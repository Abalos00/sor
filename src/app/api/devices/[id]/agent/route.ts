import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

const baseAgentScript = `
function Invoke-SorJob {
  param (
    [string]$JobId,
    [string]$AccessKey,
    [string]$ServerUrl
  )

  if ($JobId -eq "" -or $AccessKey -eq "") {
    throw "Se requiere JobId y AccessKey."
  }

  $base = $ServerUrl.TrimEnd("/")
  $manifest = Invoke-RestMethod -Method GET -Uri "$base/api/jobs/$JobId/manifest?key=$AccessKey"
  $tasks = $manifest.tasks

  foreach ($t in $tasks) {
    if (-not $t.command -or $t.command -eq "") {
      Write-Host "Tarea $($t.id) sin comando (tipo=$($t.type))"
      continue
    }

    if ($t.packageId -and $t.type -eq "app") {
      Write-Host "Revisando $($t.packageId)..."
      $null = winget list --id $t.packageId 2>$null
      if ($LASTEXITCODE -eq 0) {
        Write-Host "La app $($t.id) ya existe en este equipo. Saltando."
        continue
      }
    }

    Write-Host "Ejecutando: $($t.command)"
    try {
      & cmd.exe /c $t.command
    }
    catch {
      Write-Host "Error en tarea $($t.id): $_"
    }
  }

  Invoke-RestMethod -Method POST -Uri "$base/api/jobs/$JobId/report?key=$AccessKey" -ContentType "application/json" -Body (@{ status="succeeded"; tasks=$tasks } | ConvertTo-Json)
}
`;

export async function GET(_: NextRequest, context: Context) {
  const { id } = await context.params;
  const user = await auth.requireUser();
  if (!user.orgId) {
    return NextResponse.json({ message: "El usuario no tiene organización" }, { status: 400 });
  }

  const device = await db.device.findFirst({
    where: { id, orgId: user.orgId },
  });

  if (!device) {
    return NextResponse.json({ message: "Dispositivo no encontrado" }, { status: 404 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const script = `
${baseAgentScript}

Write-Host "Dispositivo listo: ${device.name}"
Write-Host "Token asignado: ${device.token}"

param(
  [string]$JobId = "",
  [string]$AccessKey = "",
  [string]$ServerUrl = "${baseUrl}"
)

if ($JobId -eq "") { $JobId = Read-Host "Ingresa el ID del job" }
if ($AccessKey -eq "") { $AccessKey = Read-Host "Ingresa el Access Key (desde el job)" }

Invoke-SorJob -JobId $JobId -AccessKey $AccessKey -ServerUrl $ServerUrl
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="sor-agent-${device.name}.ps1"`,
    },
  });
}


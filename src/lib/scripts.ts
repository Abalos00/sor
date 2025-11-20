import { Manifest } from "@/lib/jobs";

const header = `# SOR - Script offline generado automaticamente
Param()

Write-Host "Iniciando script de instalacion..." -ForegroundColor Cyan
`;

const wallpaperFunction = String.raw`
function Set-SORWallpaper {
  param(
    [string]$Url,
    [bool]$Locked,
    [string]$JobId
  )

  if (-not $Url) { return }

  try {
    $wallpaperPath = Join-Path $env:TEMP ("sor-wallpaper-" + $JobId + ".jpg")
    Invoke-WebRequest -Uri $Url -OutFile $wallpaperPath -UseBasicParsing

    Add-Type @"
using System.Runtime.InteropServices;
public class SORWallpaper {
  [DllImport("user32.dll", SetLastError=true)]
  public static extern bool SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@

    [SORWallpaper]::SystemParametersInfo(0x0014, 0, $wallpaperPath, 0x01 -bor 0x02) | Out-Null

    if ($Locked) {
      New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\ActiveDesktop" -Force | Out-Null
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\ActiveDesktop" -Name "NoChangingWallPaper" -Value 1 -Type DWord

      New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\System" -Force | Out-Null
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\System" -Name "Wallpaper" -Value $wallpaperPath
      Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\System" -Name "WallpaperStyle" -Value "2"
    }

    Write-Host "Fondo corporativo aplicado." -ForegroundColor Green
  }
  catch {
    Write-Host "No pudimos aplicar el fondo corporativo: $_" -ForegroundColor Yellow
  }
}
`;

export function buildPowerShellScript(manifest: Manifest, jobId: string) {
  const tasksArray = manifest.tasks
    .map((task) => {
      const pkg = task.packageId ? `"${task.packageId}"` : "$null";
      const command = task.command.replace(/"/g, '\\"');
      return `  @{ Id = "${task.id}"; Type = "${task.type}"; Package = ${pkg}; Command = "${command}" }`;
    })
    .join(",\n");

  const wallpaperData =
    manifest.wallpaper?.url && manifest.wallpaper.url.length
      ? { url: manifest.wallpaper.url, locked: Boolean(manifest.wallpaper.locked) }
      : null;

  const wallpaperSection = wallpaperData
      ? `
${wallpaperFunction}

Set-SORWallpaper -Url "${wallpaperData.url}" -Locked ${
          wallpaperData.locked ? "$true" : "$false"
        } -JobId "${jobId}"
`
      : "";

  const script = `${header}
${wallpaperSection}
$tasks = @(
${tasksArray}
)

foreach ($task in $tasks) {
  Write-Host ("\\n==> " + $task.Id) -ForegroundColor White
  if (-not $task.Command -or $task.Command -eq "") {
    Write-Host "La tarea no tiene comando definido. Saltando." -ForegroundColor Yellow
    continue
  }
  if ($task.Package -and $task.Type -eq "app") {
    $existing = winget list --id $task.Package 2>$null
    if ($LASTEXITCODE -eq 0 -and $existing) {
      Write-Host ("La app " + $task.Id + " ya existe en este equipo, se omitira.") -ForegroundColor Green
      continue
    }
  }
  Write-Host ("Ejecutando: " + $task.Command) -ForegroundColor Cyan
  try {
    & cmd.exe /c $task.Command
  }
  catch {
    Write-Host ("Error en " + $task.Id + ": " + $_) -ForegroundColor Red
  }
}

Write-Host "\\nScript finalizado para Job ${jobId}." -ForegroundColor Cyan
`;

  return script;
}

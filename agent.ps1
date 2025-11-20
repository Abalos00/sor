param(
  [string]$JobId = "",
  [string]$AccessKey = "",
  [string]$ServerUrl = "http://localhost:3000"
)
if ($JobId -eq "" -or $AccessKey -eq "") {
  Write-Host "Uso: .\agent.ps1 -JobId <id> -AccessKey <key> [-ServerUrl http://tu-servidor]"
  exit 1
}

$base = $ServerUrl.TrimEnd("/")
$manifest = Invoke-RestMethod -Method GET -Uri "$base/api/jobs/$JobId/manifest?key=$AccessKey"
$tasks = $manifest.tasks

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

if ($manifest.wallpaper -and $manifest.wallpaper.url) {
  $lockWallpaper = $false
  if ($manifest.wallpaper.locked -eq $true) {
    $lockWallpaper = $true
  }
  Set-SORWallpaper -Url $manifest.wallpaper.url -Locked $lockWallpaper -JobId $JobId
}

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
  try { & cmd.exe /c $t.command } catch { Write-Host "Error en tarea $($t.id): $_" }
}

Invoke-RestMethod -Method POST -Uri "$base/api/jobs/$JobId/report?key=$AccessKey" -ContentType "application/json" -Body (@{ status="succeeded"; tasks=$tasks } | ConvertTo-Json)

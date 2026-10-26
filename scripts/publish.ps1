param(
  [string]$Description = "Neues Update mit Verbesserungen und Aufgaben"
)

$ErrorActionPreference = "Stop"
$secretPath = "$PSScriptRoot\github_token.secret"
$token = if (Test-Path $secretPath) { (Get-Content $secretPath -Raw).Trim() } else { $env:GITHUB_TOKEN }
if (-not $token) {
  throw "GitHub Token nicht gefunden! Bitte in scripts\github_token.secret eintragen."
}
$repoOwner = "AntonKorshuov"
$repoName = "korshunov-apps"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Mathe-Champion 5 - Update Publisher" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Read package.json and increment version
$pkgJsonPath = "$PSScriptRoot\..\package.json"
$pkg = Get-Content $pkgJsonPath -Raw | ConvertFrom-Json
$currVer = $pkg.version
$verParts = $currVer.Split('.')
$newPatch = [int]$verParts[2] + 1
$newVer = "$($verParts[0]).$($verParts[1]).$newPatch"

Write-Host "Aktuelle Version: $currVer" -ForegroundColor Yellow
Write-Host "Neue Version:     $newVer" -ForegroundColor Green
Write-Host "Beschreibung:     $Description" -ForegroundColor White

$pkg.version = $newVer
$pkgStr = $pkg | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($pkgJsonPath, $pkgStr, [System.Text.UTF8Encoding]::new($false))

# 2. Build the app
Write-Host "`n1/4: Baue die Anwendung (npm run build)..." -ForegroundColor Cyan
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
& "C:\Program Files\nodejs\npm.cmd" run build
if ($LASTEXITCODE -ne 0) {
  throw "Build fehlgeschlagen!"
}

# 3. Create update-bundle.zip
Write-Host "`n2/4: Erstelle update-bundle.zip..." -ForegroundColor Cyan
$bundleDir = "$PSScriptRoot\..\dist-bundle"
if (Test-Path $bundleDir) { Remove-Item $bundleDir -Recurse -Force }
New-Item -ItemType Directory -Path $bundleDir | Out-Null

Copy-Item -Recurse -Force "$PSScriptRoot\..\dist" "$bundleDir\dist"
Copy-Item -Recurse -Force "$PSScriptRoot\..\electron" "$bundleDir\electron"
Copy-Item -Force $pkgJsonPath "$bundleDir\package.json"

$zipPath = "$PSScriptRoot\..\update-bundle.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$bundleDir\*" -DestinationPath $zipPath -Force
Remove-Item $bundleDir -Recurse -Force

Write-Host "Paketgröße: $([math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB" -ForegroundColor Green

# 4. Helper to upload to GitHub Contents API
$headers = @{
  "Authorization" = "Bearer $token"
  "User-Agent" = "MatheChampion-Publisher"
  "Accept" = "application/vnd.github.v3+json"
}

function Upload-GitHubFile([string]$remotePath, [byte[]]$bytes, [string]$commitMsg) {
  $apiUrl = "https://api.github.com/repos/$repoOwner/$repoName/contents/$remotePath"
  $sha = $null
  try {
    $existing = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get -ErrorAction SilentlyContinue
    if ($existing -and $existing.sha) {
      $sha = $existing.sha
    }
  } catch {}

  $base64 = [Convert]::ToBase64String($bytes)
  $body = @{
    message = $commitMsg
    content = $base64
  }
  if ($sha) {
    $body["sha"] = $sha
  }

  $jsonBody = $body | ConvertTo-Json
  Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Put -Body $jsonBody -ContentType "application/json" | Out-Null
}

# 5. Upload update-bundle.zip
Write-Host "`n3/4: Lade update-bundle.zip auf GitHub hoch..." -ForegroundColor Cyan
$zipBytes = [System.IO.File]::ReadAllBytes($zipPath)
Upload-GitHubFile "mathe-champion/update-bundle.zip" $zipBytes "Release: Upload update-bundle.zip v$newVer"

# 6. Upload version.json
Write-Host "`n4/4: Aktualisiere version.json auf GitHub..." -ForegroundColor Cyan
$versionInfo = @{
  version = $newVer
  description = $Description
  releaseDate = (Get-Date -Format "yyyy-MM-dd HH:mm")
  downloadUrl = "https://raw.githubusercontent.com/$repoOwner/$repoName/main/mathe-champion/update-bundle.zip"
} | ConvertTo-Json

$manifestBytes = [System.Text.Encoding]::UTF8.GetBytes($versionInfo)
Upload-GitHubFile "mathe-champion/version.json" $manifestBytes "Release: Update manifest to v$newVer"

# Clean up local zip
Remove-Item $zipPath -Force

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "   ERFOLGREICH VERÖFFENTLICHT: v$newVer!" -ForegroundColor Green
Write-Host "   Sobald der Laptop des Sohnes online ist," -ForegroundColor Green
Write-Host "   wird das Update automatisch heruntergeladen." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

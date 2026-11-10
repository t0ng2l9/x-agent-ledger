# Render every SVG in assets\ to PNG at its native size.
# Usage: .\scripts\render-assets.ps1 [-Svg card-octoverse]
param([string]$Svg = "")

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $here
$assets = Join-Path $root "assets"

$chrome = @(
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $chrome) { throw "No Chrome or Edge found for headless rendering." }

$sizes = @{
  "avatar"         = @(400, 400)
  "banner"         = @(1500, 500)
  "card-octoverse" = @(1600, 900)
  "card-763b"      = @(1600, 900)
  "card-cursor"    = @(1600, 900)
  "card-webgpu"    = @(1600, 900)
}

$bad = 0
$files = if ($Svg) {
  Get-ChildItem -LiteralPath $assets -Filter "$Svg.svg"
} else {
  Get-ChildItem -LiteralPath $assets -Filter "*.svg" | Where-Object { $_.Name -notlike "_*" }
}

foreach ($f in $files) {
  $base = $f.BaseName
  if ($sizes.ContainsKey($base)) {
    $w, $h = $sizes[$base]
  } else {
    $head = Get-Content -LiteralPath $f.FullName -Raw
    if ($head -match 'width="(\d+)"\s+height="(\d+)"') {
      $w = [int]$Matches[1]; $h = [int]$Matches[2]
    } else {
      Write-Warning "$base : no size, skipped"; continue
    }
  }

  $png = Join-Path $assets "$base.png"
  $uri = "file:///" + ($f.FullName -replace '\\', '/' -replace ' ', '%20')

  # Chrome prints an extension-registry error to stderr on this machine even
  # when the screenshot succeeds. With $ErrorActionPreference = "Stop" that
  # becomes a terminating NativeCommandError, so relax it for the call and
  # judge success by the file on disk instead.
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  # A throwaway profile is required: if the normal Chrome profile is already
  # running, a new headless launch attaches to it and ignores --window-size,
  # which produced a 762x484 screenshot instead of 1600x900.
  $tmpProfile = Join-Path $env:TEMP ("ad-render-" + [guid]::NewGuid().ToString("N"))
  & $chrome --headless --disable-gpu --disable-extensions --hide-scrollbars `
      --force-device-scale-factor=1 "--window-size=$w,$h" `
      --user-data-dir="$tmpProfile" `
      --screenshot="$png" $uri 2>$null | Out-Null
  $ErrorActionPreference = $prev
  Remove-Item -LiteralPath $tmpProfile -Recurse -Force -ErrorAction SilentlyContinue

  if (Test-Path $png) {
    # Verify the real pixel size. Chrome silently falls back to a 762x484
    # viewport when --window-size is malformed, and the script used to report
    # success anyway.
    Add-Type -AssemblyName System.Drawing
    $img = [System.Drawing.Image]::FromFile($png)
    $aw = $img.Width; $ah = $img.Height
    $img.Dispose()
    $kb = [math]::Round((Get-Item $png).Length / 1KB, 1)
    if ($aw -ne $w -or $ah -ne $h) {
      Write-Host ("  {0,-18} {1}x{2}  {3} KB  MISMATCH (expected {4}x{5})" -f $base, $aw, $ah, $kb, $w, $h) -ForegroundColor Red
      $script:bad++
    } else {
      Write-Host ("  {0,-18} {1}x{2}  {3} KB" -f $base, $aw, $ah, $kb)
    }
  } else {
    Write-Warning "$base : render failed"
    $script:bad++
  }
}



if ($bad -gt 0) {
  Write-Host ("{0} asset(s) rendered at the wrong size." -f $bad) -ForegroundColor Red
  exit 1
}


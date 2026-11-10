# Agent Dispatch — daily radar, one command.
# Usage:  .\run.ps1                 (last 3 days, 15 topics)
#         .\run.ps1 -Days 7 -Top 25
param(
  [int]$Days = 3,
  [int]$Top = 15,
  [int]$PerSource = 3
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host "Node.js not found. Install from https://nodejs.org (v18+)." -ForegroundColor Red
  exit 1
}

Write-Host "Agent Dispatch radar" -ForegroundColor Cyan
Write-Host ("  window: {0}d   top: {1}   per source: {2}" -f $Days, $Top, $PerSource) -ForegroundColor DarkGray

node (Join-Path $here "scripts\research.mjs") --days $Days --top $Top --per-source $PerSource
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Open the digest in the default editor.
$digest = Join-Path $here "digests"
$latest = Get-ChildItem $digest -Filter "radar-*.md" -ErrorAction SilentlyContinue |
          Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($latest) {
  Write-Host ("`nDigest: {0}" -f $latest.FullName) -ForegroundColor Green
  if (-not $env:AGENT_DISPATCH_NO_OPEN) { Start-Process $latest.FullName }
}

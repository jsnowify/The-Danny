# Audit contact sheets only. Original files are read, never modified.
param([string]$ReferenceDirectory = 'C:\Users\joshu\Pictures\reference')
$ErrorActionPreference = 'Stop'
$EvidenceDirectory = Join-Path $PSScriptRoot '..\artifacts\v4-stage-a\references'
New-Item -ItemType Directory -Force -Path $EvidenceDirectory | Out-Null
$Samples = @(
  @{ Name = 'vid ref.mp4'; Output = 'video-1-sheet.jpg'; Rate = '1/2' },
  @{ Name = 'vid ref 2.mp4'; Output = 'video-2-sheet.jpg'; Rate = '1/2' },
  @{ Name = 'vid ref 3.mp4'; Output = 'video-3-sheet.jpg'; Rate = '1/1.5' }
)
foreach ($Sample in $Samples) {
  $Source = Join-Path $ReferenceDirectory $Sample.Name
  if (!(Test-Path -LiteralPath $Source)) { throw "Missing reference: $Source" }
  $Destination = Join-Path $EvidenceDirectory $Sample.Output
  & ffmpeg -hide_banner -loglevel error -i $Source -vf "fps=$($Sample.Rate),scale=640:-1,tile=4x2" -frames:v 1 -y $Destination
  if ($LASTEXITCODE -ne 0) { throw "Frame extraction failed for $Source" }
}
Write-Output 'Saved three reference contact sheets. Tiles read left to right, top to bottom; any last black tile is unused space.'

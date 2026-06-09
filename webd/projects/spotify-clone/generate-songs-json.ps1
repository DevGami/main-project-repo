# ── Spotify Clone — Regenerate songs.json ─────────────────────────
# Run this EVERY TIME you add new songs or new album folders.
# Usage: Right-click → "Run with PowerShell"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$audioExts = @('.mp3','.flac','.aac','.wav','.ogg','.m4a','.opus')
$songsRoot  = Join-Path $PSScriptRoot "songs"
$albums     = @()

Get-ChildItem -Path $songsRoot -Directory | ForEach-Object {
    $infoPath = Join-Path $_.FullName "info.json"
    if (Test-Path $infoPath) {
        $info      = Get-Content $infoPath -Raw -Encoding UTF8 | ConvertFrom-Json
        $songFiles = Get-ChildItem -Path $_.FullName -File |
            Where-Object { $audioExts -contains $_.Extension.ToLower() } |
            Select-Object -ExpandProperty Name | Sort-Object
        $albums += [PSCustomObject]@{
            folder      = $_.Name
            title       = $info.title
            description = $info.description
            artist      = if ($info.artist) { $info.artist } else { "Various Artists" }
            songs       = @($songFiles)
        }
    }
}

$json      = ([PSCustomObject]@{ albums = $albums }) | ConvertTo-Json -Depth 5
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$songsRoot\songs.json", $json, $utf8NoBom)


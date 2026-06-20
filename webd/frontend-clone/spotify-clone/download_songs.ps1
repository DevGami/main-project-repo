# Array of 16 SoundHelix MP3 URLs
$urls = @(
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"
)

$destPaths = @(
  "songs\pop_vibes\Pop Track 1.mp3",
  "songs\pop_vibes\Pop Track 2.mp3",
  "songs\pop_vibes\Pop Track 3.mp3",
  "songs\pop_vibes\Pop Track 4.mp3",
  "songs\lofi_beats\LoFi Chill 1.mp3",
  "songs\lofi_beats\LoFi Chill 2.mp3",
  "songs\lofi_beats\LoFi Chill 3.mp3",
  "songs\lofi_beats\LoFi Chill 4.mp3",
  "songs\classical\Classic Opus 1.mp3",
  "songs\classical\Classic Opus 2.mp3",
  "songs\classical\Classic Opus 3.mp3",
  "songs\classical\Classic Opus 4.mp3",
  "songs\edm\Dance Anthem 1.mp3",
  "songs\edm\Dance Anthem 2.mp3",
  "songs\edm\Dance Anthem 3.mp3",
  "songs\edm\Dance Anthem 4.mp3"
)

Write-Host "Deleting old mp3 files..."
Get-ChildItem -Path "songs" -Recurse -Filter "*.mp3" | Remove-Item -Force

Write-Host "Downloading 16 unique MP3s..."
for ($i = 0; $i -lt $urls.Length; $i++) {
    $url = $urls[$i]
    $dest = Join-Path $PSScriptRoot $destPaths[$i]
    Write-Host "Downloading $($destPaths[$i])..."
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
}

Write-Host "Generating new songs.json..."
./generate-songs-json.ps1

Write-Host "Deployment..."
npx --yes netlify-cli deploy --prod

Write-Host "Done!"

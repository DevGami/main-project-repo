const fs = require('fs');
const https = require('https');
const path = require('path');

const urls = Array.from({length: 16}, (_, i) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`);

const destPaths = [
  "songs/pop_vibes/Pop Track 1.mp3",
  "songs/pop_vibes/Pop Track 2.mp3",
  "songs/pop_vibes/Pop Track 3.mp3",
  "songs/pop_vibes/Pop Track 4.mp3",
  "songs/lofi_beats/LoFi Chill 1.mp3",
  "songs/lofi_beats/LoFi Chill 2.mp3",
  "songs/lofi_beats/LoFi Chill 3.mp3",
  "songs/lofi_beats/LoFi Chill 4.mp3",
  "songs/classical/Classic Opus 1.mp3",
  "songs/classical/Classic Opus 2.mp3",
  "songs/classical/Classic Opus 3.mp3",
  "songs/classical/Classic Opus 4.mp3",
  "songs/edm/Dance Anthem 1.mp3",
  "songs/edm/Dance Anthem 2.mp3",
  "songs/edm/Dance Anthem 3.mp3",
  "songs/edm/Dance Anthem 4.mp3"
];

async function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.resolve(__dirname, dest));
        https.get(url, response => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // handle redirect if necessary, though soundhelix doesn't usually
                https.get(response.headers.location, res2 => {
                    res2.pipe(file);
                    file.on('finish', () => resolve());
                });
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', err => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function run() {
    console.log("Starting concurrent downloads...");
    try {
        await Promise.all(urls.map((url, i) => {
            const dest = destPaths[i];
            return download(url, dest).then(() => console.log(`Downloaded ${dest}`));
        }));
        console.log("All downloads finished!");
    } catch (e) {
        console.error(e);
    }
}
run();

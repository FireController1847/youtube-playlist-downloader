const ffmd = require('ffmetadata');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { gapi } = require('./tokens.js');
const { options } = require('./options.js');
options.output = options.output.replace('@album', options.metadata.album);
const path = require('path');
const shell = require('shelljs');
const ypi = require('youtube-playlist-info');
const yt = require('ytdl-core');

let current;
if (!fs.existsSync(options.output)) {
  shell.mkdir('-p', options.output);
}

let ttx = 0;
let timer;
function twirlTimer(msg, b4 = '') {
  if (timer) clearInterval(timer);
  const p = ['\\', '|', '/', '-'];
  timer = setInterval(() => {
    process.stdout.write(`\r${b4}${p[ttx++]} ${msg}`);
    ttx &= 3;
  }, 250);
  return timer;
}
function onEnd(videos, i) {
  current = null;
  i++;
  if (i >= videos.length) return console.log('✓ Playlist Completed Downloading');
  else return download(videos, i);
}
function onExit(opt, error) {
  if (error && error.stack) console.log(error.stack);
  if (opt.cleanup && current) {
    try {
      fs.unlinkSync(current);
    } catch (e) {
      return console.error(`\nThere was an internal error attempting to remove file ${current}.`, e);
    }
  }
  if (opt.exit) process.exit();
}
async function download(videos, i = 0) {
  videos[i].title = videos[i].title.replace(options.titleRemoverMain, '');
  videos[i].titleMeta = videos[i].title;
  videos[i].title = videos[i].title.replace(options.titleRemoverSecondary, '');
  const file = path.join(__dirname, options.output, `${videos[i].title}.${options.format}`);
  try {
    // Info & Force Metadata
    const exists = fs.existsSync(file);
    if (exists && !options.forceMetaUpdate) {
      console.log(`${i} - ✗ Already Exists, Skipping "${videos[i].title}"`);
      return onEnd(videos, i);
    }
    process.stdout.write(`\r${i} - ℹ Requesting Video Info "${videos[i].title}"`);
    videos[i].info = await yt.getInfo(videos[i].resourceId.videoId);
    videos[i].info.title = videos[i].title;
    if (exists) {
      process.stdout.clearLine();
      console.log(`\r${i} - ✗ Already Exists, But Forcing Metadata Update "${videos[i].title}"`);
      await updateMetadata(file, videos, i);
      return onEnd(videos, i);
    }
    // Stream
    const stream = yt(videos[i].info.video_url, {
      quality: 'highestaudio',
      highWaterMark: 1024 * 1024 * options.downloadSpeed
    });
    const ffstream = ffmpeg(stream).audioBitrate(128).save(file);
    process.stdout.clearLine();
    twirlTimer(`Downloading 0% "${videos[i].title}"...`, `${i} - `);
    current = file;
    // Events
    let prog;
    let prevProg;
    stream.on('progress', (chunk, totalDown, total) => {
      prog = totalDown / total;
      prog = (prog * 100).toFixed(0);
      if (prevProg != prog) {
        if (prog >= 100) {
          process.stdout.clearLine();
          twirlTimer(`Processing "${videos[i].title}"...`, `${i} - `);
        } else {
          twirlTimer(`Downloading ${prog}% "${videos[i].title}"...`, `${i} - `);
        }
      }
      prevProg = prog;
    });
    ffstream.on('error', e => {
      clearInterval(timer);
      process.stdout.clearLine();
      console.log(`\r${i} - ✗ Failed To Download "${videos[i].title}"`);
      console.error(e);
      return onEnd(videos, i);
    });
    ffstream.on('end', async () => {
      process.stdout.clearLine();
      process.stdout.write(`\${i} - rℹ Writing Metadata "${videos[i].title}"`);
      await updateMetadata(file, videos, i);
      clearInterval(timer);
      process.stdout.clearLine();
      console.log(`\r${i} - ✓ Download Complete "${videos[i].title}"`);
      return onEnd(videos, i);
    });
  } catch (e) {
    process.stdout.clearLine();
    console.log(`\r${i} - ✗ Error Downloading Video ${videos[i].title}`);
    console.error(e);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    return onEnd(videos, i);
  }
}
function updateMetadata(file, videos, i) {
  return new Promise((resolve, reject) => {
    let data = {
      artist: options.authorMatch ? videos[i].title.match(options.authorMatch)[0] : videos[i].info.author.name,
      album_artist: videos[i].channelTitle,
      title: videos[i].title.replace(options.titleRemoverMeta, ''),
      track: `${i + 1}/${videos.length}`,
      date: (new Date(videos[i].info.published)).getFullYear()
    };
    data = Object.assign({}, data, options.metadata);
    const foptions = {};
    ffmd.write(file, data, foptions, e => {
      if (e) return reject(e);
      if (options.cover) {
        const temp = path.join(__dirname, options.output, `${videos[i].title}.temp.${options.format}`);
        const stream = ffmpeg(file).addOutputOptions(
          '-i', options.cover,
          '-map', '0:0',
          '-map', '1:0',
          '-c', 'copy',
          '-id3v2_version', '3'
        ).save(temp);
        stream.on('error', e => { // eslint-disable-line no-shadow
          reject(e);
        });
        stream.on('end', () => {
          try {
            fs.unlinkSync(file);
            fs.renameSync(temp, file);
          } catch (e) { // eslint-disable-line no-shadow
            return reject(e);
          }
          return resolve();
        });
      } else {
        return resolve();
      }
    });
  });
}
(async () => {
  console.log('ℹ Requesting Playlist Info');
  let videos;
  try {
    videos = await ypi(gapi, options.playlist);
  } catch (e) {
    return console.error('✗ Error Requesting Playlist Info', e);
  }
  console.log(`ℹ Found ${videos.length} video${videos.length == 1 ? '' : 's'}.`);
  return download(videos).catch(e => {
    console.error('✗ Error Downloading Playlist', e);
  });
})();
process.on('unhandledRejection', console.error);
process.on('exit', onExit.bind(null, { cleanup: true }));
process.on('SIGINT', onExit.bind(null, { exit: true }));
process.on('SIGUSR1', onExit.bind(null, { exit: true }));
process.on('SIGUSR2', onExit.bind(null, { exit: true }));
process.on('uncaughtException', onExit.bind(null, { exit: true }));
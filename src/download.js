const ffmd = require('ffmetadata');
const fs = require('fs');
const { gapi } = require('./tokens.js');
const snekfetch = require('snekfetch');
const ypi = require('youtube-playlist-info');
const yt = require('ytdl-core');

/**
 * The YouTube Playlists's ID
 * @type {string}
 */
const playlist = 'PLe8jmEHFkvsahDl5a1yepu60rWxKn8rbT';
/**
 * The output file.
 * @type {string}
 */
const output = './audio';
/**
 * The temporary directory for thumbnail images.
 * @type {string}
 */
const temp = './temp';
/**
 * The audio output format.
 * Don't change this unless you know what you're doing.
 * @type {string}
 */
const format = 'm4a';
/**
 * Force a metadata update even if the file exists.
 * @type {boolean}
 */
const forceUpdateMeta = false;

/**
 * Contains information about the playlist to be attributed to each file.
 * @type {object}
 */
const metadata = {
  /**
   * The playlist name.
   */
  album: 'Rocket League x Monstercat Vol. 1'
};

/**
 * A custom replacer for the title. Can be used to remove
 * spam like "[Monstercat Release]" from the titles.
 * Set to '' to disable.
 * @type {RegExp|string}
 */
const titleRemover = / \[Monstercat Release\]/g;
const titleRemover2 = /[^-]*- /;
/**
 * A custom matcher that will extract from the title, in
 * case the author is included in the title. For example,
 * in 'Slushii - LUV U NEED U', 'Slushii' is the author.
 * Set to '' to disable.
 * @type {RegExp|string}
 */
const authorMatch = /[^-]*\w+/g;

let curr;

if (!fs.existsSync(output)) {
  fs.mkdirSync(output);
}
if (!fs.existsSync(temp)) {
  fs.mkdirSync(temp);
}

let x = 0;
function twirlTimer(msg) {
  const p = ['\\', '|', '/', '-'];
  return setInterval(() => {
    process.stdout.write(`\r${p[x++]} ${msg}`);
    x &= 3;
  }, 250);
}
function writeMeta(path, info, list, i) {
  let data = {
    artist: authorMatch ? info.title.match(authorMatch)[0] : info.author.name,
    album_artist: list[i].channelTitle,
    title: info.title.replace(titleRemover2, ''),
    track: `${i + 1}/${list.length}`,
    date: (new Date(info.published)).getFullYear()
  };
  data = Object.assign({}, data, metadata);
  // const image = await snekfetch.get(info.thumbnail);
  // fs.writeFileSync(`${temp}/thumbnail.jepg`, image.body);
  // const options = {
  //   attachments: [`${temp}/thumbnail.jepg`]
  // };
  const options = {};
  ffmd.write(path, data, options);
}
async function downloadSongs(list, i = 0) {
  list[i].title = list[i].title.replace(titleRemover, '');
  const path = `${output}/${list[i].title}.${format}`;
  if (fs.existsSync(path)) {
    if (forceUpdateMeta) {
      console.log(`✗ Already Exists, But Forcing Metadata Update "${list[i].title}"`);
      const info = await getVideoInfo(list[i].resourceId.videoId);
      await writeMeta(path, info, list, i);
    } else {
      console.log(`✗ Already Exists, Skipping "${list[i].title}"`);
    }
    i++;
    return downloadSongs(list, i);
  }
  const reqln = `\rℹ Requesting Video Info "${list[i].title}"`;
  process.stdout.write(reqln);
  const info = await getVideoInfo(list[i].resourceId.videoId);
  const stream = yt(info.video_url);
  try {
    stream.pipe(fs.createWriteStream(path));
  } catch (e) {
    stream.pipe(fs.createWriteStream(`${output}/${list[i].title.replace(/\W/g, '')}.${format}`));
  }
  process.stdout.clearLine();
  let loader = twirlTimer(`Downloading 0% "${list[i].title}"...`);
  curr = path;
  stream.on('error', () => {
    clearInterval(loader);
    process.stdout.clearLine();
    console.log(`\r✗ Failed To Download "${list[i].title}"`);
    return onEnd(list, i);
  });
  let prevPer;
  let per;
  stream.on('progress', (chunk, totalDown, total) => {
    per = totalDown / total;
    per = (per * 100).toFixed(0);
    if (prevPer != per) {
      clearInterval(loader);
      loader = twirlTimer(`Downloading ${per}% "${list[i].title}"...`);
    }
    prevPer = per;
  });
  stream.on('end', async () => {
    process.stdout.clearLine();
    process.stdout.write(`\rℹ Writing Metadata "${list[i].title}"`);
    await writeMeta(path, info, list, i);
    curr = null;
    clearInterval(loader);
    process.stdout.clearLine();
    console.log(`\r✓ Download Complete "${list[i].title}"`);
    return onEnd(list, i);
  });
}
async function getVideoInfo(vid) {
  const info = await yt.getInfo(vid);
  try {
    const newt = info.thumbnail_url.replace('default', 'maxresdefault');
    const res = await snekfetch.get(newt);
    info.thumbnail = res.status == 404 ? info.thumbnail_url.replace('default', 'hqdefault') : newt;
  } catch (e) {
    info.thumbnail = info.thumbnail_url.replace('default', 'mqdefault');
  }
  info.title = info.title.replace(titleRemover, '');
  return info;
}
function onEnd(list, i) {
  i++;
  if (i >= list.length) return console.log('Completed All Downloads');
  else return downloadSongs(list, i);
}
function onExit(options, error) {
  if (error && error.stack) console.log(error.stack);
  if (options.cleanup && curr) fs.unlinkSync(curr);
  if (options.exit) process.exit();
}

(async () => {
  console.log('Getting Playlist Info...');
  const videos = await ypi(gapi, playlist);
  console.log(`Downloading ${videos.length} video${videos.length == 1 ? '' : 's'}`);
  downloadSongs(videos);
})();

process.on('unhandledRejection', console.error);
process.on('exit', onExit.bind(null, { cleanup: true }));
process.on('SIGINT', onExit.bind(null, { exit: true }));
process.on('SIGUSR1', onExit.bind(null, { exit: true }));
process.on('SIGUSR2', onExit.bind(null, { exit: true }));
process.on('uncaughtException', onExit.bind(null, { exit: true }));
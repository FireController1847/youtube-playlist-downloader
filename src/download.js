const ffmd = require('ffmetadata');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { gapi } = require('./tokens.js');
const mkdirp = require('mkdirp');
const options = require('./options.js');
const ora = require('ora')({
  spinner: {
    interval: 80,
    frames: [
      '⠋', '⠙', '⠹', '⠸', '⠼',
      '⠴', '⠦', '⠧', '⠇', '⠏'
    ]
  }
});
const path = require('path');
const Playlist = require('./structures/Playlist.js');
const Video = require('./structures/Video.js');
const ypi = require('youtube-playlist-info');
const yt = require('ytdl-core');

console.debug = function() {
  if (options.debug) console.log.bind(console, '[Debug]')(...arguments);
};

(async () => {
  if (!fs.existsSync(options.output)) {
    console.debug(`Output file does not exist. Creating at ${options.output}.`);
    mkdirp.sync(options.output);
  } else {
    console.debug(`Output file exists at ${options.output}.`);
  }
  // Request Playlist Info
  console.debug(`Requesting for Playlist ID ${options.plid}`);
  ora.start('Requesting Playlist Info');
  let videos;
  try {
    videos = await ypi(gapi, options.plid);
  } catch (e) {
    return ora.fail(`Playlist Request Failed: ${e.stack}`);
  }
  ora.succeed('Playlist Request Success');
  const playlist = new Playlist(videos);
  ora.info(`Found ${videos.length} video${videos.length == 1 ? '' : 's'} in the playlist.`);

  // Download Videos
  for (let i = 0; i < playlist.videos.length; i++) {
    const video = playlist.videos[i];

    // Modify The Video
    /** The modified title. */
    video.mTitle = video.title;
    options.titleRemovers.forEach(tr => {
      video.mTitle = video.mTitle.replace(tr, '');
    });
    /** The title that will be used for metadata info. */
    video.metaTitle = video.mTitle.replace(options.titleRemoverMeta, '');
    /** The matched author from the modified title. */
    video.mAuthor = video.mTitle.match(options.authorMatch);
    console.debug(`Title: ${video.title}`);
    console.debug(`Modifed Title: ${video.mTitle}`);
    console.debug(`Metadata Title: ${video.metaTitle}`);
    console.debug(`Matched Author: ${video.mAuthor}`);

    // Now We Do It
    let res;
    try {
      res = await download(playlist, video);
    } catch (e) {
      ora.fail(`There was an Internal ${e.stack}`);
    }

    if (!res) ora.succeed(`${i + 1}/${playlist.videos.length} Download Complete for "${video.metaTitle}"`);
    else if (res == 'already_exists') ora.fail(`${i + 1}/${playlist.videos.length} Already Exists, Skipping "${video.metaTitle}"`);
    else if (res == 'already_exists_metadata') ora.succeed(`${i + 1}/${playlist.videos.length} Metadata Update Complete for "${video.metaTitle}"`);
  }
})();

/**
 * @param {Playlist} playlist
 * @param {Video} video
 */
function download(playlist, video) {
  return new Promise(async resolve => {
    video.path = path.join(options.output, `${video.metaTitle}.${options.format}`);
    video.tempPath = path.join(options.output, `${video.metaTitle}.temp.${options.format}`);
    console.debug(`Video Path: ${video.path}`);

    // Check for Metadata & Existing
    if (fs.existsSync(video.path)) {
      console.debug(`File Already Exists`);
      if (options.updateMetadata) {
        ora.fail(`Already Exists, But Forcing Metadata Update "${video.metaTitle}"`);
        await metadata(playlist, video);
        return resolve('already_exists_metadata');
      } else {
        return resolve('already_exists');
      }
    }

    // Being Streams
    const stream = yt(video.url, { quality: 'highestaudio', highWaterMark: options.downloadSpeed * 1024 * 1024 });
    const ffstream = ffmpeg(stream).audioBitrate(128).save(video.path);

    // Event Handling
    let progress = 0;
    ora.start(`Starting Download for "${video.metaTitle}"`);
    stream.on('progress', (chunk, completed, total) => {
      progress = completed / total;
      progress = (progress * 100).toFixed(1);
      ora.text = `${progress}% Downloading "${video.metaTitle}"...`;
    });
    stream.on('error', e => {
      throw new Error(e);
    });
    ffstream.on('error', e => {
      throw new Error(e);
    });
    ffstream.on('end', async () => {
      await metadata(playlist, video);
      return resolve();
    });
  });
}

/**
 * @param {Playlist} playlist
 * @param {Video} video
 */
function metadata(playlist, video) {
  return new Promise((resolve, reject) => {
    ora.start(`Writing Metadata for "${video.metaTitle}"`);
    const data = {
      artist: video.mAuthor,
      album_artist: playlist.sameAuthor ? video.channel.name : 'Various Artists',
      title: video.metaTitle,
      track: `${video.position + 1}/${playlist.videos.length}`,
      date: video.published.getFullYear()
    };
    for (const key in options.metadata) { if (options.metadata[key]) data[key] = options.metadata[key]; }
    ffmd.write(video.path, data, {}, e => {
      if (e) return reject(e);
      if (options.debug) ora.stop();
      console.debug('Metadata Write Complete');
      if (options.debug) ora.start();
      if (options.cover) {
        if (options.debug) ora.stop();
        console.debug('Cover Is Included');
        if (options.debug) ora.start();
        const ffstream = ffmpeg(video.path).addOutputOptions(
          '-i', options.cover,
          '-map', '0:0',
          '-map', '1:0',
          '-c', 'copy',
          '-id3v2_version', '3'
        ).save(video.tempPath);
        ffstream.on('error', reject.bind(this));
        ffstream.on('end', () => {
          if (options.debug) ora.stop();
          console.debug('Completed Writing Cover');
          if (options.debug) ora.start();
          fs.unlinkSync(video.path);
          fs.renameSync(video.tempPath, video.path);
          return resolve();
        });
      }
    });
  });
}

process.on('unhandledRejection', e => {
  ora.fail(e.stack);
});
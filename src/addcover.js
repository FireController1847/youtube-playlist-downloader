const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
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

if (!fs.existsSync(options.output)) return ora.fail('Your output file has not been created. Have you downloaded and inserted the songs you want?');

(async () => {
  ora.start('Loading Files');
  const fileNames = fs.readdirSync(options.output);
  let files = [];
  for (let i = 0; i < fileNames.length; i++) {
    files[i] = [];
    const fPath = path.join(options.output, fileNames[i]);
    files[i][0] = path.parse(fPath);
    files[i][0].path = fPath;
    files[i][1] = fs.readFileSync(files[i][0].path);
    if (files[i][0].ext != '.mp3') return ora.fail('ALL files must be MP3 files to add covers to them.');
  }
  ora.succeed(`${files.length} Files Loaded`);
  for (let i = 0; i < files.length; i++) {
    await addCover(files, files[i]);
    ora.succeed(`${i + 1}/${files.length} Cover Added to "${files[i][0].name}"`);
  }
})();

function addCover(files, file) {
  return new Promise((resolve, reject) => {
    file[0].temp = path.join(file[0].dir, `${file[0].name}.temp.mp3`);
    const ffstream = ffmpeg(file[0].path).addOutputOptions(
      '-i', options.cover,
      '-map', '0:0',
      '-map', '1:0',
      '-c', 'copy',
      '-id3v2_version', '3'
    ).save(file[0].temp);
    ffstream.on('error', reject.bind(this));
    ffstream.on('end', () => {
      if (options.debug) ora.stop();
      if (options.debug) ora.start();
      fs.unlinkSync(file[0].path);
      fs.renameSync(file[0].temp, file[0].path);
      return resolve();
    });
  });
}


process.on('unhandledRejection', e => {
  ora.fail(e.stack);
});
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { options } = require('./options.js');
options.output = options.output.replace('@album', options.metadata.album);
const path = require('path');

if (!fs.existsSync(options.output)) {
  return console.error('✗ Your output file has not been created. Have you downloaded and inserted the songs you want?');
}

function addCover(file) {
  return new Promise((resolve, reject) => {
    const temp = path.join(file[0].dir, `${file[0].name}.temp.mp3`);
    const stream = ffmpeg(file[0].path).addOutputOptions(
      '-i', options.cover,
      '-map', '0:0',
      '-map', '1:0',
      '-c', 'copy',
      '-id3v2_version', '3'
    ).save(temp);
    stream.on('error', e => { // eslint-disable-line
      reject(e);
    });
    stream.on('end', () => {
      try {
        fs.unlinkSync(file[0].path);
        fs.renameSync(temp, file[0].path);
      } catch (e) { // eslint-disable-line no-shadow
        return reject(e);
      }
      return resolve();
    });
  });
}
(async () => {
  console.log('ℹ Reading Files');
  let fileNames;
  try {
    fileNames = fs.readdirSync(options.output);
  } catch (e) {
    return console.error('✗ Error Reading Files', e);
  }
  const files = [];
  for (let i = 0; i < fileNames.length; i++) {
    try {
      files[i] = [];
      const fPath = path.join(__dirname, options.output, fileNames[i]);
      files[i][0] = path.parse(fPath);
      files[i][0].path = fPath;
      files[i][1] = fs.readFileSync(files[i][0].path);
    } catch (e) {
      return console.error('✗ Error Parsing Files', e);
    }
  }
  for (let i = 0; i < files.length; i++) {
    try {
      await addCover(files[i], i);
      console.log(`${i} - ℹ Cover Added "${files[i][0].name}"`);
    } catch (e) {
      console.log(`${i} - ✗ Error Adding Cover "${files[i][0].name}"`, e);
    }
  }
  console.log(`ℹ Completed`);
})();
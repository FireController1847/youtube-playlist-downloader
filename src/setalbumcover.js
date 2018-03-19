const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const file = path.join(__dirname, './audio/Darkness and Starlight.mp3');
const file2 = path.join(__dirname, './audio/Darkness and Starlight AC.mp3');
ffmpeg.ffprobe(file, (err, md) => {
  if (err) return console.error(err);
  console.log(md);
  ffmpeg(file).addOutputOptions('-i', 'cover.jpg', '-map', '0:0', '-map', '1:0', '-c', 'copy', '-id3v2_version', '3').save(file2);
});
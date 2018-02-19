const fs = require('fs');
const ffmd = require('ffmetadata');
const song = '../src/audio/Slushii - LUV U NEED U [Monstercat Release].m4a';
ffmd.read(song, (err, data) => {
  if (err) throw err;
  console.log(data);
  const newd = {
    artist: 'Monstercat',
    album_artist: 'Monstercat',
    album: 'Rocket League x Monstercat Vol. 1',
    title: 'LUV U NEED U',
    track: '3/17',
    date: '2017',
    rating: 5
  }
  ffmd.write(song, newd, err => {
    if (err) throw err;
    console.log('File Updated');
  });
});
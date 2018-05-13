const Video = require('./Video.js');

/**
 * @typedef Video
 */
class Playlist {
  constructor(raw) {
    /** Playlist Info Video */
    const pliv = raw.find(v => v.hasOwnProperty('playlistId'));

    /**
     * The ID of this playlist.
     * @type {string}
     */
    this.id = pliv.playlistId;

    /**
     * The URL of the playlist.
     * @type {string}
     */
    this.url = `https://www.youtube.com/playlist?list=${this.id}`;

    /**
     * A list of videos in this playlist.
     * @type {Array<Video>}
     */
    this.videos = [];
    raw.forEach(v => {
      const video = new Video(this, v);
      this.videos.push(video);
    });

    /**
     * Whether or not every video in this playlist has the same author.
     * @type {boolean}
     */
    this.sameAuthor = this.videos.every(v => v.channel.name == pliv.channelTitle);
  }
}

module.exports = Playlist;
const Playlist = require('./Playlist.js'); // eslint-disable-line no-unused-vars

/**
 * @typedef Video
 */
class Video {
  constructor(playlist, info) {
    /**
     * The playlist that this video is in.
     * @type {Playlist}
     */
    this.playlist = playlist;

    /**
     * The date this video was published.
     * @type {Date}
     */
    this.published = new Date(info.publishedAt);

    /**
     * The title of this video.
     * @type {string}
     */
    this.title = info.title;

    /**
     * The different thumbnails available for this video.
     * @type {object}
     */
    this.thumbnails = info.thumbnails;

    /**
     * Information about the channel that posted this video.
     * @type {object}
     */
    this.channel = {

      /**
       * The ID of the channel that posted this video.
       * @type {string}
       */
      id: info.channelId,

      /**
       * The URL of the channel that posted this video.
       * @type {string}
       */
      url: `https://www.youtube.com/channel/${info.channelId}`,

      /**
       * The name of the channel that posted this video.
       */
      name: info.channelTitle
    };

    /**
     * The ID of this video.
     */
    this.id = info.resourceId.videoId;

    /**
     * The URL of this video.
     */
    this.url = `https://www.youtube.com/watch?v=${this.id}`;

    /**
     * The position that this video is in on the playlist. Is 0 based.
     * @type {number}
     */
    this.position = info.position;
  }
}

module.exports = Video;
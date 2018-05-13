const options = {
  /**
   * The YouTube Playlist ID
   * @type {string}
   */
  plid: 'PLe8jmEHFkvsYuYm1x5t3RZ5WyGrfF8bkg',

  /**
   * The output file. Use "@album" to use the album cover.
   * @type {string}
   */
  output: './audio/@album',

  /**
   * Force a metadata update even if the file exists.
   * @type {boolean}
   */
  updateMetadata: false,

  /**
   * Contains information about the playlist to be attributed
   * to each file. Add a new property to override other
   * properties.
   * @type {object}
   */
  metadata: {

    /**
     * The album name. If set to `null` will be the playlist title.
     * @type {null|string}
     */
    album: 'Rocket League x Monstercat Vol. 2',

    /**
     * The album artist. If set to `null`, YTPLDL will automatically
     * set this value. When setting the value, YTPLDL will detect if
     * there are multiple artists. If there are, it will be assigned
     * 'Various Artists'. Otherwise, it will be assigned the name of
     * the artist of each song.
     * @type {null|string}
     */
    album_artist: null

  },

  /**
   * The location of the album cover for this playlist. You must
   * download an image and put it in any directory under the 'src'
   * folder. Similar to the output property.
   * Set to '' to have no album cover.
   */
  cover: './cover.png',

  /** ********* ADVANCED ********** **/

  /**
   * Replacers for the title of songs. This is an array of different
   * RegExp's or strings to replace from the title in order from first
   * to last. Every modification from the previous title remover will
   * effect the next. Useful to remove crap like "[Monstercat Release]"
   * from titles.
   * Set to [] to disable.
   * @type {Array<RegExp|string>}
   */
  titleRemovers: [
    / \[Monstercat Release\]/g
  ],

  /**
   * Similar to the title removers, only this will remove data from the
   * metadata ONLY. Useful if you need to use the next option to match
   * and author, and then remove it in the metadata and file name.
   * Anything removed here will still be shown to the authorMatcher.
   * Set to '' to disable.
   * @type {RegExp|string}
   */
  titleRemoverMeta: /[^-]*- /g,

  /**
   * A custom matcher that will extract from the title, in case the author
   * is included in the title. For example, in 'Slushii - LUV U NEED U',
   * 'Slushii' is the author.
   * Set to '' to disable.
   * When disabled, the author must be provided in the metadata option.
   * @type {RegExp|string}
   */
  authorMatch: /[^-]*\w+/g,

  /** ********* REDICULOUSLY ADVANCED ********** **/

  /**
   * The download speed in MPBS. This seems to NOT be what most would
   * consider 'download speed', so I don't suggest changing this unless
   * you know what you're doing.
   * 10mbps is the default.
   * @type {number}
   */
  downloadSpeed: 10,

  /**
   * The audio output format. This is hard coded, so do not change this
   * unless you know which part of the code you'll need to change to
   * make it work.
   * mp3 is the default.
   * @type {string}
   */
  format: 'mp3',

  /**
   * Set to true to get debug information.
   * @type {boolean}
   */
  debug: false
};
const path = require('path');
options.output = path.resolve(options.output.replace('@album', options.metadata.album));
module.exports = options;
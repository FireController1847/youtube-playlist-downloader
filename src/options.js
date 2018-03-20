module.exports.options = {
  /**
   * The YouTube Playlists's ID
   * @type {string}
   */
  playlist: 'PLe8jmEHFkvsahDl5a1yepu60rWxKn8rbT',
  /**
   * The output file. Use @album to use the album cover.
   * @type {string}
   */
  output: './audio/@album/',
  /**
   * Force a metadata update even if the file exists.
   * @type {boolean}
   */
  forceMetaUpdate: false,
  /**
   * Contains information about the playlist to be attributed
   * to each file.
   * @type {object}
   */
  metadata: {
    /**
     * The album name (most common the playlist name).
     * @type {string}
     */
    album: 'Rocket League x Monstercat Vol. 1'
  },
  /**
   * The file name for the album cover. You must download an image
   * and put it in the 'src' folder to be able to use this.
   * Set to '' to disable.
   */
  cover: 'cover.jpg',
  /** ADVANCED */
  /**
   * A custom replacer for the title. Can be used to remove
   * spam like "[Monstercat Release]" from the titles.
   * Set to '' to disable.
   * @type {RegExp|string}
   */
  titleRemoverMain: / \[Monstercat Release\]/g,
  /**
   * A secondary replacer for the title.
   * Set to '' to disable.
   * @type {RegExp|string}
   */
  titleRemoverSecondary: '',
  /**
   * Similar to the title removers, this will remove data from
   * the metadata ONLY. Useful if you need to use the option below to
   * match an author, and then remove it in the metadata and file name.
   * Anything removed here will still be shown to the authorMatcher.
   * @type {RegExp|string}
   */
  titleRemoverMeta: /[^-]*- /g,
  /**
   * A custom matcher that will extract from the title, in
   * case the author is included in the title. For example,
   * in 'Slushii - LUV U NEED U', 'Slushii' is the author.
   * Set to '' to disable.
   * When disabled, the author must be provided in the metadata object above.
   * @type {RegExp|string}
   */
  authorMatch: /[^-]*\w+/g,
  /** REDICULOUSLY ADVANCED */
  /**
   * The audio output format.
   * This is hard coded, so do not chnage this unless you know
   * which part of the code you'll need to change to make it
   * work. 'mp3' is suggested at all times.
   * @type {string}
   */
  format: 'mp3'
};
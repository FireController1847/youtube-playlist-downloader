# YouTube Playlist Downloader
Downloads YouTube Playlists! :)

# How to Use
### You must have FFMPEG installed to use this downloader.
1. Clone this repository into a folder.
2. Open a terminal and cd into the `src` folder.
3. Open options.js and edit the stuff you want to edit. Each item comes with a description and the types it needs to be.
4. Make a file called tokens.js in `src` and insert your YouTube API token. Example:
    ```js
    module.exports.gapi = 'myawesometoken';
5. Run `node download.js`
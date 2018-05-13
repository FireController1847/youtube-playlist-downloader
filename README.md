# YouTube Playlist Downloader [![Build Status](https://travis-ci.org/FireController1847/youtube-playlist-downloader.svg?branch=master)](https://travis-ci.org/FireController1847/youtube-playlist-downloader)
This module will download YouTube playlists for you! It was just a fun experiment I've done and I keep improving on!

# How to Use
1. **Install FFMPEG**
    - For Windows: Checkout [this wikiHow tutorial](https://www.wikihow.com/Install-FFmpeg-on-Windows). If that doesn't help, you'll have to do some googling on your own.
    - For Mac/Linux: Use a package manager such as `sudo apt install ffmpeg -y` for Linux.
2. Clone this repository into a folder.
    - Generally, you use a Git client to clone it, like this:
    ```sh
    git clone https://github.com/FireController1847/youtube-playlist-downloader.git`
    ```
3. Open a terminal and `cd` into the `src` folder.
3. Open `options.js` and edit the stuff you'd like to edit. Each item comes with a description right above it.
4. Make a file called `tokens.js` in the `src` folder, and insert your YouTube API token using the example below.
  ```js
  module.exports.gapi = 'myawesometoken';
  ```
5. Run `node download.js`.
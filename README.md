# SPOTIFY CLONE FRONTEND

## About This Repo
This repo is a clone application of spotify web player. It uses the official Spotify documentation of [Web API](https://developer.spotify.com/documentation/web-api) and [Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk). It uses the [spotify-clone-backend](https://github.com/MohammadAfandy/spotify-clone-backend) to manage the authentication/authorization.

## Made with
* Typescript
* React.js
* Tailwind CSS

## Credits
* Lyrics by [lyrics-finder](https://www.npmjs.com/package/lyrics-finder)
* Routing by [react-router-dom](https://www.npmjs.com/package/react-router-dom)
* Icons by [react-icons](https://www.npmjs.com/package/react-icons)
* [react-infinite-scroll-component](https://www.npmjs.com/package/react-infinite-scroll-component)
* [axios](https://www.npmjs.com/package/axios)
* .. and other modules

## Features
* Login using your spotify account
* Remote control player
* Search songs / albums / artists / playlists / podcasts / episodes
* Follow albums / playlists / podcasts
* Songs list and podcast episode ist
* Add song to saved track
* Add podcast episode to saved episode
* Add / edit / delete your own playlist
* Show currently playing song lyric

## Instalation
### Install Dependencies
```
npm install
```

### Change .env file
```
REACT_APP_BACKEND_URI = <URL of the backend authentication>
```
### Run Application
#### Development
```
npm start
```

#### Build
```
npm run build
```

## Future Update
- [ ] Edit user profile
- [ ] Detail page of another user
- [ ] Refractor error handling
- [x] Fully responsive design on mobile
- [ ] Handle non premium user
- [ ] Refractor web player sdk lifecycle

## Disclaimer
[spotify-clone-frontend](https://github.com/MohammadAfandy/spotify-clone-frontend) and [spotify-clone-backend](https://github.com/MohammadAfandy/spotify-clone-backend) is intended for educational purpose only. All data including image, song, logo, etc belong to their respective copyright owners.

import { SearchBar } from "../components/SearchBar/SearchBar"

let accessToken = ''
let expiresIn = 0
let clientID = ''
let redirectURI = ''
export const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        accessToken = window.location.href.match(/access_token=([^&]*)/)
        expiresIn = window.location.href.match(/expires_in=([^&]*)/)
        if (accessToken && expiresIn) {
            console.log(accessToken[1])
            accessToken = accessToken[1]
            expiresIn = expiresIn[1]
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        }

        window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`
    },
    search(term) {
        accessToken = this.getAccessToken()

        let url = `https://api.spotify.com/v1/search?type=track&q=${term}`
        let headers = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
        return fetch(url, headers)
            .then(response => response.json())
            .then(response => {
                return response.tracks.items.map(track => {

                    return {
                        name: track.name,
                        id: track.id,
                        artist: track.artist,
                        album: track.album.name,
                        uri: track.uri
                    }

                })
            })
    },
    savePlaylist(playlistName, trackURIs) {
        if (!playlistName || !trackURIs)
            return

        accessToken = this.getAccessToken()

        let url = `https://api.spotify.com/v1/me`
        let headers = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }

        let userID = ''

        return fetch(url, headers)
            .then(response => response.json())
            .then(response => {
                userID = response.id
                url = `https://api.spotify.com/v1/users/${userID}/playlists`
                headers = {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    method: 'POST',
                    body: JSON.stringify({ name: playlistName })
                }
                return fetch(url, headers)
                    .then(response => response.json())
                    .then(response => {
                        let playlistId = response.id
                        url = `https://api.spotify.com/v1/users/${userID}/playlists/${playlistId}/tracks`
                        headers = {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`
                            },
                            method: 'POST',
                            body: JSON.stringify({ uris: trackURIs })
                        }
                        return fetch(url, headers)
                    })
            })
    }
}
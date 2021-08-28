import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Track from '../types/Track';
import Artist from '../types/Artist';
import Album from '../types/Album';
import Playlist from '../types/Playlist';
import ApiSpotify from '../utils/api-spotify';
import { AuthContext } from '../context/auth-context';
import { getHighestImage, getArtistNames, makeRequest } from '../utils/helpers';

import CardItem from '../Components/Card/CardItem';

const GenrePage: React.FC = () => {
  const { type } = useParams<{ query: string; type: string }>();

  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [newReleases, setNewReleases] = useState<Album[]>([]);

  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [typeText, setTypeText] = useState('');

  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchGenre = async () => {
      const params = { limit: 50 };

      if (type === 'featured-playlists') {
        const response = await makeRequest('/browse/featured-playlists', {
          params,
        }, isLoggedIn);
        setFeaturedPlaylists(response.data.playlists.items);
        setTypeText(response.data.message);
      } else if (type === 'top-tracks') {
        const response = await ApiSpotify.get('/me/top/tracks', {
          params: { ...params, country: undefined },
        });
        setTopTracks(response.data.items);
        setTypeText('Your Top Tracks');
      } else if (type === 'top-artists') {
        const response = await ApiSpotify.get('/me/top/artists', {
          params: { ...params, country: undefined },
        });
        setTopArtists(response.data.items);
        setTypeText('Your Top Artists');
      } else if (type === 'new-releases') {
        const response = await makeRequest('/browse/new-releases', {
          params,
        }, isLoggedIn);
        setNewReleases(response.data.albums.items);
        setTypeText('New Releases');
      }
    };

    fetchGenre();
  }, [type, isLoggedIn]);

  return (
    <div className="flex flex-col px-4 py-4">
      <div className="text-2xl mb-4">{typeText}</div>
      {type === 'featured-playlists' && (
        <div className="grid grid-cols-5 gap-4">
          {featuredPlaylists.map((playlist) => (
            <CardItem
              key={playlist.id}
              name={playlist.name}
              description={playlist.owner.name}
              image={getHighestImage(playlist.images)}
              uri={playlist.uri}
              href={'/playlist/' + playlist.id}
            />
          ))}
        </div>
      )}
      {type === 'top-tracks' && (
        <div className="grid grid-cols-5 gap-4">
          {topTracks.map((track) => (
            <CardItem
              key={track.id}
              name={track.name}
              image={getHighestImage(track.album.images)}
              uri={track.uri}
              href={'/album/' + track.album.id}
            />
          ))}
        </div>
      )}
      {type === 'top-artists' && (
        <div className="grid grid-cols-5 gap-4">
          {topArtists.map((artist) => (
            <CardItem
              key={artist.id}
              name={artist.name}
              description={artist.type}
              image={getHighestImage(artist.images)}
              uri={artist.uri}
              href={'/artist/' + artist.id}
            />
          ))}
        </div>
      )}
      {type === 'new-releases' && (
        <div className="grid grid-cols-5 gap-4">
          {newReleases.map((album) => (
            <CardItem
              key={album.id}
              name={album.name}
              description={getArtistNames(album.artists)}
              image={getHighestImage(album.images)}
              uri={album.uri}
              href={'/album/' + album.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GenrePage;

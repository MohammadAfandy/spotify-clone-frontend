import { useEffect, useState, useContext } from 'react';
import Track from '../types/Track';
import Artist from '../types/Artist';
import Album from '../types/Album';
import Playlist from '../types/Playlist';
import ApiSpotify from '../utils/api-spotify';
import { AuthContext } from '../context/auth-context';
import { getHighestImage, getArtistNames, makeRequest } from '../utils/helpers';

import CardItem from '../Components/Card/CardItem';
import TextLink from '../Components/Link/TextLink';

const HomePage: React.FC = () => {
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [newReleases, setNewReleases] = useState<Album[]>([]);

  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [message, setMessage] = useState('');

  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchHome = async () => {
      const params = { limit: 5 };
      const promises = [
        makeRequest('/browse/new-releases', { params }, isLoggedIn),
        makeRequest('/browse/featured-playlists', { params }, isLoggedIn)
      ];
      if (isLoggedIn) {
        promises.push(
          ApiSpotify.get('/me/top/tracks', { params }),
          ApiSpotify.get('/me/top/artists', { params })
        );
      }
      const response = await Promise.all(promises);

      setNewReleases(response[0].data.albums.items);
      setFeaturedPlaylists(response[1].data.playlists.items);
      setMessage(response[1].data.message);

      if (isLoggedIn) {
        setTopTracks(response[2].data.items);
        setTopArtists(response[3].data.items);
      }
    };

    fetchHome();
  }, [isLoggedIn]);

  return (
    <div className="flex flex-col px-4 py-4">
      {featuredPlaylists.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end mr-8 font-bold">
            <div className="text-2xl">{message}</div>
            <TextLink text="See All" url="/genre/featured-playlists" />
          </div>
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
        </div>
      )}

      {isLoggedIn && topTracks.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end mr-8 font-bold">
            <div className="text-2xl">Your Top Tracks</div>
            <TextLink text="See All" url="genre/top-tracks" />
          </div>
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
        </div>
      )}

      {isLoggedIn && topArtists.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end mr-8 font-bold">
            <div className="text-2xl">Your Top Artists</div>
            <TextLink text="See All" url="genre/top-artists" />
          </div>
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
        </div>
      )}

      {newReleases.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end mr-8 font-bold">
            <div className="text-2xl">New Releases</div>
            <TextLink text="See All" url="genre/new-releases" />
          </div>
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
        </div>
      )}
    </div>
  );
};

export default HomePage;

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
import GridWrapper from '../Components/Grid/GridWrapper';

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
          <div className="mb-4 flex justify-between items-end font-bold w-full">
            <div className="text-2xl">{message}</div>
            <TextLink text="See All" url="/genre/featured-playlists" />
          </div>
          <GridWrapper>
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
          </GridWrapper>
        </div>
      )}

      {isLoggedIn && topTracks.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end font-bold w-full">
            <div className="text-2xl">Your Top Tracks</div>
            <TextLink text="See All" url="genre/top-tracks" />
          </div>
          <GridWrapper>
            {topTracks.map((track) => (
              <CardItem
                key={track.id}
                name={track.name}
                image={getHighestImage(track.album.images)}
                uri={track.uri}
                href={'/album/' + track.album.id}
              />
            ))}
          </GridWrapper>
        </div>
      )}

      {isLoggedIn && topArtists.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end font-bold w-full">
            <div className="text-2xl">Your Top Artists</div>
            <TextLink text="See All" url="genre/top-artists" />
          </div>
          <GridWrapper>
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
          </GridWrapper>
        </div>
      )}

      {newReleases.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end font-bold w-full">
            <div className="text-2xl">New Releases</div>
            <TextLink text="See All" url="genre/new-releases" />
          </div>
          <GridWrapper>
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
          </GridWrapper>
        </div>
      )}
    </div>
  );
};

export default HomePage;

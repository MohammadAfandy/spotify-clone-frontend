import { useEffect, useState } from 'react';
import Track from '../types/Track';
import Artist from '../types/Artist';
import Album from '../types/Album';
import Playlist from '../types/Playlist';
import ApiSpotify from '../utils/api-spotify';
import { getHighestImage, getArtistNames } from '../utils/helpers';

import CardItem from '../Components/Card/CardItem';
import TextLink from '../Components/Link/TextLink';

const HomePage: React.FC = () => {
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [newReleases, setNewReleases] = useState<Album[]>([]);

  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchHome = async () => {
      const params = { limit: 5 };
      const [
        dataTopTracks,
        dataTopArtists,
        dataNewReleases,
        dataFeaturedPlaylists,
      ] = await Promise.all([
        ApiSpotify.get('/me/top/tracks', { params }),
        ApiSpotify.get('/me/top/artists', { params }),
        ApiSpotify.get('/browse/new-releases', { params }),
        ApiSpotify.get('/browse/featured-playlists', { params }),
      ]);

      setTopTracks(dataTopTracks.data.items);
      setTopArtists(dataTopArtists.data.items);
      setNewReleases(dataNewReleases.data.albums.items);
      setFeaturedPlaylists(dataFeaturedPlaylists.data.playlists.items);
      setMessage(dataFeaturedPlaylists.data.message);
    };

    fetchHome();
  }, []);

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

      {topTracks.length > 0 && (
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

      {topArtists.length > 0 && (
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

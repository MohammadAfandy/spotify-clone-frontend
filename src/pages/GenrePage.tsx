import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Track from '../types/Track';
import Artist from '../types/Artist';
import Album from '../types/Album';
import Playlist from '../types/Playlist';
import ApiSpotify from '../utils/api-spotify';
import { AuthContext } from '../context/auth-context';
import { getHighestImage, getArtistNames, makeRequest } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import GridWrapper from '../components/Grid/GridWrapper';
import Skeleton from 'react-loading-skeleton';

const GenrePage: React.FC = () => {
  const { type } = useParams<{ query: string; type: string }>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [newReleases, setNewReleases] = useState<Album[]>([]);

  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [typeText, setTypeText] = useState('');

  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchGenre = async () => {
      try {
        setIsLoading(true);
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
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenre();
  }, [type, isLoggedIn]);

  const CardLoading = (
    [...Array(20)].map((_, idx) => (
      <CardItem key={idx} isLoading />
    ))
  );

  return (
    <div className="flex flex-col px-4 py-4">
      <div className="text-2xl font-bold mb-4 truncate">
        {typeText || <Skeleton width={200} />}
      </div>
      {type === 'featured-playlists' && (
        <GridWrapper>
          {isLoading && CardLoading}
          {featuredPlaylists.map((playlist) => (
            <CardItem
              key={playlist.id}
              name={playlist.name}
              description={`By ${playlist.owner.display_name}`}
              image={getHighestImage(playlist.images)}
              uri={playlist.uri}
              href={'/playlist/' + playlist.id}
            />
          ))}
        </GridWrapper>
      )}
      {type === 'top-tracks' && (
        <GridWrapper>
          {isLoading && CardLoading}
          {!isLoading && topTracks.map((track) => (
            <CardItem
              key={track.id}
              name={track.name}
              description={getArtistNames(track.artists)}
              image={getHighestImage(track.album.images)}
              uri={track.uri}
              href={'/album/' + track.album.id}
            />
          ))}
        </GridWrapper>
      )}
      {type === 'top-artists' && (
        <GridWrapper>
          {isLoading && CardLoading}
          {!isLoading && topArtists.map((artist) => (
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
      )}
      {type === 'new-releases' && (
        <GridWrapper>
          {isLoading && CardLoading}
          {!isLoading && newReleases.map((album) => (
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
      )}
    </div>
  );
};

export default GenrePage;

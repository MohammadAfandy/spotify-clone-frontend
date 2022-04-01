import { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Artist from '../types/Artist';
import Album from '../types/Album';
import Playlist from '../types/Playlist';
import Show from '../types/Show';
import Episode from '../types/Episode';
import { AuthContext } from '../context/auth-context';
import { makeRequest, removeNull } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import GridWrapper from '../components/Grid/GridWrapper';

const SearchResultAllPage: React.FC = () => {
  const history = useHistory();
  const { query, type } = useParams<{ query: string; type: string }>();

  const { isLoggedIn } = useContext(AuthContext);

  if (
    ['track', 'artist', 'album', 'playlist', 'show', 'episode'].includes(
      type
    ) === false
  ) {
    history.replace('/');
  }

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    const fetchSearchDetail = async () => {
      try {
        setIsLoading(true);
        const response = await makeRequest('/search', {
          params: {
            q: query,
            type: type,
            limit: 50,
          },
        }, isLoggedIn);
  
        if (type === 'album') {
          setAlbums(response.data.albums.items.filter(removeNull));
        } else if (type === 'artist') {
          setArtists(response.data.artists.items.filter(removeNull));
        } else if (type === 'playlist') {
          setPlaylists(response.data.playlists.items.filter(removeNull));
        } else if (type === 'show') {
          setShows(response.data.shows.items.filter(removeNull));
        } else if (type === 'episode') {
          setEpisodes(response.data.episodes.items.filter(removeNull));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchDetail();
  }, [type, query, isLoggedIn]);

  const CardLoading = (
    [...Array(20)].map((_, idx) => (
      <CardItem key={idx} isLoading />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="text-2xl font-bold mb-4 truncate">
        All {type} for “{query}”
      </div>
      {type === 'artist' && (
        <GridWrapper>
          {isLoading && CardLoading}
          {!isLoading && artists.map((artist) => (
            <CardItem
              key={artist.id}
              name={artist.name}
              description={''}
              image={artist.images && artist.images[0] && artist.images[0].url}
              uri={artist.uri}
              href={'/artist/' + artist.id}
            />
          ))}
        </GridWrapper>
      )}
      {type === 'album' && (
        <GridWrapper>
          {isLoading && CardLoading}
          {!isLoading && albums.map((album) => (
            <CardItem
              key={album.id}
              name={album.name}
              description={''}
              image={album.images && album.images[0] && album.images[0].url}
              uri={album.uri}
              href={'/album/' + album.id}
            />
          ))}
        </GridWrapper>
      )}
      {type === 'playlist' && (
        <GridWrapper>
          {isLoading && CardLoading}
          {!isLoading && playlists.map((playlist) => (
            <CardItem
              key={playlist.id}
              name={playlist.name}
              description={`By ${playlist.owner.display_name}`}
              image={
                playlist.images && playlist.images[0] && playlist.images[0].url
              }
              uri={playlist.uri}
              href={'/playlist/' + playlist.id}
            />
          ))}
        </GridWrapper>
      )}
      {type === 'show' && (
        <GridWrapper>
          {isLoading && CardLoading}
          {!isLoading && shows.map((show) => (
            <CardItem
              key={show.id}
              name={show.name}
              description={show.publisher}
              image={show.images && show.images[0] && show.images[0].url}
              uri={show.uri}
              href={'/show/' + show.id}
            />
          ))}
        </GridWrapper>
      )}
      {type === 'episode' && (
        <GridWrapper>
          {isLoading && CardLoading}
          {!isLoading && episodes.map((episode) => (
            <CardItem
              key={episode.id}
              name={episode.name}
              description={''}
              image={
                episode.images && episode.images[0] && episode.images[0].url
              }
              uri={episode.uri}
              href={'/episode/' + episode.id}
            />
          ))}
        </GridWrapper>
      )}
    </div>
  );
};

export default SearchResultAllPage;

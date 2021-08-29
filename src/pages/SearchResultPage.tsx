import { useState, useContext, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import Track from '../types/Track';
import Artist from '../types/Artist';
import Album from '../types/Album';
import Playlist from '../types/Playlist';
import Show from '../types/Show';
import Episode from '../types/Episode';
import { PlayerContext } from '../context/player-context';
import { AuthContext } from '../context/auth-context';
import { makeRequest, getArtistNames, removeNull } from '../utils/helpers';

import PlayerListTrackMini from '../components/PlayerList/PlayerListTrackMini';
import CardItem from '../components/Card/CardItem';
import TextLink from '../components/Link/TextLink';
import GridWrapper from '../components/Grid/GridWrapper';

const SearchResultPage: React.FC = () => {
  const history = useHistory();
  const params = useParams<{ query: string }>();
  const location = useLocation();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const { togglePlay } = useContext(PlayerContext);
  const { isLoggedIn } = useContext(AuthContext);

  const handlePlayTrack = (event: React.MouseEvent, uri: string) => {
    event.stopPropagation();
    togglePlay([uri], 0, 0);
  };

  useEffect(() => {
    const fetchSearch = async () => {
      const response = await makeRequest('/search', {
        params: {
          q: params.query,
          type: 'track,artist,album,playlist,show,episode',
          limit: 5,
        },
      }, isLoggedIn);

      setTracks(response.data.tracks.items.filter(removeNull));
      setArtists(response.data.artists.items.filter(removeNull));
      setAlbums(response.data.albums.items.filter(removeNull));
      setPlaylists(response.data.playlists.items.filter(removeNull));
      setShows(response.data.shows.items.filter(removeNull));
      setEpisodes(response.data.episodes.items.filter(removeNull));
    };

    fetchSearch();
  }, [params, isLoggedIn]);

  return (
    <div className="flex flex-col px-4 py-4">
      {tracks.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end font-bold w-full">
            <div className="text-2xl">Songs</div>
            <div
              className="text-md cursor-pointer hover:underline"
              onClick={() => history.push(location.pathname + '/track')}
            >
              See All
            </div>
          </div>
          {tracks.map((track) => (
            <PlayerListTrackMini
              track={track as Track & Episode}
              handlePlayTrack={(e) => handlePlayTrack(e, track.uri)}
            />
          ))}
        </div>
      )}

      {artists.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end font-bold w-full">
            <div className="text-2xl">Artists</div>
            <TextLink text="See All" url={location.pathname + '/artist'} />
          </div>
          <GridWrapper>
            {artists.map((artist) => (
              <CardItem
                key={artist.id}
                name={artist.name}
                description={artist.type}
                image={
                  artist.images && artist.images[0] && artist.images[0].url
                }
                uri={artist.uri}
                href={'/artist/' + artist.id}
              />
            ))}
          </GridWrapper>
        </div>
      )}

      {albums.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end font-bold w-full">
            <div className="text-2xl">Albums</div>
            <TextLink text="See All" url={location.pathname + '/album'} />
          </div>
          <GridWrapper>
            {albums.map((album) => (
              <CardItem
                key={album.id}
                name={album.name}
                description={getArtistNames(album.artists)}
                image={album.images && album.images[0] && album.images[0].url}
                uri={album.uri}
                href={'/album/' + album.id}
              />
            ))}
          </GridWrapper>
        </div>
      )}

      {playlists.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end font-bold w-full">
            <div className="text-2xl">Playlists</div>
            <TextLink text="See All" url={location.pathname + '/playlist'} />
          </div>
          <GridWrapper>
            {playlists.map((playlist) => (
              <CardItem
                key={playlist.id}
                name={playlist.name}
                description={`By ${playlist.owner.display_name}`}
                image={
                  playlist.images &&
                  playlist.images[0] &&
                  playlist.images[0].url
                }
                uri={playlist.uri}
                href={'/playlist/' + playlist.id}
              />
            ))}
          </GridWrapper>
        </div>
      )}

      {shows.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end font-bold w-full">
            <div className="text-2xl">Podcasts</div>
            <TextLink text="See All" url={location.pathname + '/show'} />
          </div>
          <GridWrapper>
            {shows.map((show) => (
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
        </div>
      )}

      {episodes.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-end font-bold w-full">
            <div className="text-2xl">Episodes</div>
            <TextLink text="See All" url={location.pathname + '/episode'} />
          </div>
          <GridWrapper>
            {episodes.map((episode) => (
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
        </div>
      )}
    </div>
  );
};

export default SearchResultPage;
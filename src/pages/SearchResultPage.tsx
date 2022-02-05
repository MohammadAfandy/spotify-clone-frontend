import { useState, useContext, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Track from '../types/Track';
import Artist from '../types/Artist';
import Album from '../types/Album';
import Playlist from '../types/Playlist';
import Show from '../types/Show';
import Episode from '../types/Episode';
import { PlayerContext } from '../context/player-context';
import { AuthContext } from '../context/auth-context';
import { makeRequest, getArtistNames, removeNull, duration, formatDate } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import TextLink from '../components/Text/TextLink';
import GridWrapper from '../components/Grid/GridWrapper';
import { GRID_COUNT } from '../utils/constants';
import PlayerListTrack from '../components/PlayerList/PlayerListTrack';

const SearchResultPage: React.FC = () => {
  const params = useParams<{ query: string }>();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const { currentTrack, isPlaying, togglePlay, togglePause } = useContext(PlayerContext);
  const { isLoggedIn } = useContext(AuthContext);

  const handlePlayTrack = (
    selectedOffset: number,
    selectedPositionMs: number
  ) => {
    const trackUris = tracks.map((v) => v.uri);
    togglePlay(trackUris, selectedOffset, selectedPositionMs);
  };

  const handlePauseTrack = () => {
    togglePause();
  };

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        setIsLoading(true);
        const response = await makeRequest('/search', {
          params: {
            q: params.query,
            type: 'track,artist,album,playlist,show,episode',
            limit: GRID_COUNT,
          },
        }, isLoggedIn);

        setTracks(response.data.tracks.items.filter(removeNull));
        setArtists(response.data.artists.items.filter(removeNull));
        setAlbums(response.data.albums.items.filter(removeNull));
        setPlaylists(response.data.playlists.items.filter(removeNull));
        setShows(response.data.shows.items.filter(removeNull));
        setEpisodes(response.data.episodes.items.filter(removeNull));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearch();
  }, [params.query, isLoggedIn]);

  const CardLoading = (
    [...Array(GRID_COUNT)].map((_, idx) => (
      <CardItem key={idx} isLoading />
    ))
  );

  return (
    <div className="flex flex-col px-4 py-4">
      <div className="mb-8">
        <div className="mb-4 flex justify-between items-end font-bold w-full">
          <div className="text-lg md:text-2xl truncate">Songs</div>
          {tracks.length > 0 && <TextLink className="ml-6 whitespace-pre" text="See All" url={location.pathname + '/track'} />}
        </div>
        <PlayerListTrack
          tracks={tracks}
          showAlbum
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          handlePlayTrack={handlePlayTrack}
          handlePauseTrack={handlePauseTrack}
          handleNext={() => {}}
          hasMore={false}
        />
      </div>

      <div className="mb-8">
        <div className="mb-4 flex justify-between items-end font-bold w-full">
          <div className="text-lg md:text-2xl truncate">Artists</div>
          {artists.length > 0 && <TextLink className="ml-6 whitespace-pre" text="See All" url={location.pathname + '/artist'} />}
        </div>
        <GridWrapper>
          {isLoading && CardLoading}
          {!isLoading && artists.map((artist) => (
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

      <div className="mb-8">
        <div className="mb-4 flex justify-between items-end font-bold w-full">
          <div className="text-lg md:text-2xl truncate">Albums</div>
          {albums.length > 0 && <TextLink className="ml-6 whitespace-pre" text="See All" url={location.pathname + '/album'} />}
        </div>
        <GridWrapper>
          {isLoading && CardLoading}
          {!isLoading && albums.map((album) => (
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

      <div className="mb-8">
        <div className="mb-4 flex justify-between items-end font-bold w-full">
          <div className="text-lg md:text-2xl truncate">Playlists</div>
          {playlists.length > 0 && <TextLink className="ml-6 whitespace-pre" text="See All" url={location.pathname + '/playlist'} />}
        </div>
        <GridWrapper>
          {isLoading && CardLoading}
          {!isLoading && playlists.map((playlist) => (
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

      <div className="mb-8">
        <div className="mb-4 flex justify-between items-end font-bold w-full">
          <div className="text-lg md:text-2xl truncate">Podcasts</div>
          {shows.length > 0 && <TextLink className="ml-6 whitespace-pre" text="See All" url={location.pathname + '/show'} />}
        </div>
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
      </div>

      <div className="mb-8">
        <div className="mb-4 flex justify-between items-end font-bold w-full">
          <div className="text-lg md:text-2xl truncate">Episodes</div>
          {episodes.length > 0 && <TextLink className="ml-6 whitespace-pre" text="See All" url={location.pathname + '/episode'} />}
        </div>
        <GridWrapper>
          {isLoading && CardLoading}
          {!isLoading && episodes.map((episode) => (
            <CardItem
              key={episode.id}
              name={episode.name}
              description={`${formatDate(episode.release_date, 'MMM YY')} · ${duration(episode.duration_ms, true, true)}`}
              image={
                episode.images && episode.images[0] && episode.images[0].url
              }
              uri={episode.uri}
              href={'/episode/' + episode.id}
            />
          ))}
        </GridWrapper>
      </div>
    </div>
  );
};

export default SearchResultPage;

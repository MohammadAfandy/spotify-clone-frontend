import { useState, useContext, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Track from '../types/Track';
import Artist from '../types/Artist';
import Album from '../types/Album';
import Playlist from '../types/Playlist';
import Show from '../types/Show';
import Episode from '../types/Episode';
import { AuthContext } from '../context/auth-context';
import { makeRequest, getArtistNames, removeNull, duration, formatDate } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import TextLink from '../components/Text/TextLink';
import Slider from '../components/Slider/Slider';
import { CARD_COUNT } from '../utils/constants';
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

  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        setIsLoading(true);
        const response = await makeRequest('/search', {
          params: {
            q: params.query,
            type: 'track,artist,album,playlist,show,episode',
            limit: CARD_COUNT,
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
    [...Array(CARD_COUNT)].map((_, idx) => (
      <CardItem key={idx} isLoading />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="mb-8">
        <div className="mb-2 flex justify-between items-end font-bold w-full text-sm md:text-lg">
          <div className="truncate">Songs</div>
          {tracks.length > 0 && <TextLink className="ml-6 whitespace-pre" text="See All" url={location.pathname + '/track'} />}
        </div>
        <PlayerListTrack
          tracks={tracks.slice(0, 5)}
          showAlbum
          uris={tracks.map((v) => v.uri)}
          handleNext={() => {}}
          hasMore={false}
        />
      </div>

      <div className="mb-8">
        <div className="mb-2 flex justify-between items-end font-bold w-full text-sm md:text-lg">
          <div className="truncate">Artists</div>
          {artists.length > 0 && <TextLink className="ml-6 whitespace-pre" text="See All" url={location.pathname + '/artist'} />}
        </div>
        <Slider>
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
        </Slider>
      </div>

      <div className="mb-8">
        <div className="mb-2 flex justify-between items-end font-bold w-full text-sm md:text-lg">
          <div className="truncate">Albums</div>
          {albums.length > 0 && <TextLink className="ml-6 whitespace-pre" text="See All" url={location.pathname + '/album'} />}
        </div>
        <Slider>
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
        </Slider>
      </div>

      <div className="mb-8">
        <div className="mb-2 flex justify-between items-end font-bold w-full text-sm md:text-lg">
          <div className="truncate">Playlists</div>
          {playlists.length > 0 && <TextLink className="ml-6 whitespace-pre" text="See All" url={location.pathname + '/playlist'} />}
        </div>
        <Slider>
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
        </Slider>
      </div>

      <div className="mb-8">
        <div className="mb-2 flex justify-between items-end font-bold w-full text-sm md:text-lg">
          <div className="truncate">Podcasts</div>
          {shows.length > 0 && <TextLink className="ml-6 whitespace-pre" text="See All" url={location.pathname + '/show'} />}
        </div>
        <Slider>
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
        </Slider>
      </div>

      <div className="mb-8">
        <div className="mb-2 flex justify-between items-end font-bold w-full text-sm md:text-lg">
          <div className="truncate">Episodes</div>
          {episodes.length > 0 && <TextLink className="ml-6 whitespace-pre" text="See All" url={location.pathname + '/episode'} />}
        </div>
        <Slider>
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
        </Slider>
      </div>
    </div>
  );
};

export default SearchResultPage;

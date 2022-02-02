import { useState, useContext, useEffect } from 'react';
import { PlayerContext } from '../context/player-context';
import { AuthContext } from '../context/auth-context';
import Playlist from '../types/Playlist';
import Track from '../types/Track';
import Episode from '../types/Episode';
import ApiSpotify from '../utils/api-spotify';
import { getHighestImage } from '../utils/helpers';
import { EPISODE_LOGO_IMAGE, LIMIT_CARD } from '../utils/constants';

import CardItem from '../components/Card/CardItem';
import CardCollection from '../components/Card/CardCollection';
import GridWrapper from '../components/Grid/GridWrapper';

const CollectionPlaylistPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [playlistTotalTrack, setplaylistTotalTrack] = useState<number>(0);
  const [playlistTotalEpisode, setplaylistTotalEpisode] = useState<number>(0);

  const { user } = useContext(AuthContext);
  const { togglePlay } = useContext(PlayerContext);

  useEffect(() => {
    const fetchCollectionPlaylist = async () => {
      try {
        setIsLoading(true);
        const paramsPlaylist = { limit: 50 };
        const paramsTrack = { limit: 5 };
        const paramsEpisode = { limit: 1 };
        const [dataPlaylist, dataPlaylistTrack, dataPlaylistEpisode] =
          await Promise.all([
            ApiSpotify.get('/me/playlists', { params: paramsPlaylist }),
            ApiSpotify.get('/me/tracks', { params: paramsTrack }),
            ApiSpotify.get('/me/episodes', { params: paramsEpisode }),
          ]);
  
        setPlaylists(dataPlaylist.data.items);
        setPlaylistTracks(
          dataPlaylistTrack.data.items.map(
            (item: { added_at: Date; track: Track }) => ({
              ...item.track,
              added_at: item.added_at,
            })
          )
        );
        setplaylistTotalTrack(dataPlaylistTrack.data.total);
        setplaylistTotalEpisode(dataPlaylistEpisode.data.total);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionPlaylist();
  }, []);

  // because we can't play context uri of your episode (spotify:user:<username>:collection:your-episodes)
  // so we fetch all episode first and play it as multiple uris
  const handlePlayEpisode = async () => {
    const response = await ApiSpotify.get('/me/episodes', {
      params: { limit: 50 },
    });
    const episodeUris = response.data.items.map(
      (v: { added_at: Date; episode: Episode }) => v.episode.uri
    );
    togglePlay(episodeUris, 0);
  };

  const CardLoading = (
    [...Array(LIMIT_CARD)].map((_, idx) => (
      <CardItem key={idx} isLoading />
    ))
  );

  return (
    <div className="flex flex-col px-4 py-4">
      <div className="text-2xl mb-4 font-bold">PLAYLISTS</div>
      <GridWrapper>
        <div className="col-span-2">
          <CardCollection
            uris={[`spotify:user:${user.id}:collection`]}
            tracks={playlistTracks}
            type="track"
            total={playlistTotalTrack}
            href="/collection/tracks"
            isLoading={isLoading}
          />
        </div>
        <div>
          <CardItem
            name="Your Episodes"
            description={playlistTotalEpisode + ' episodes'}
            image={EPISODE_LOGO_IMAGE}
            // uri="spotify:user:afandy9895:collection:your-episodes"
            href={'/collection/episodes'}
            onClickPlay={handlePlayEpisode}
            isLoading={isLoading}
          />
        </div>
        {isLoading && CardLoading}
        {!isLoading && playlists.map((playlist) => (
          <CardItem
            key={playlist.id}
            name={playlist.name}
            description={''}
            image={getHighestImage(playlist.images)}
            uri={playlist.uri}
            href={'/playlist/' + playlist.id}
          />
        ))}
      </GridWrapper>
    </div>
  );
};

export default CollectionPlaylistPage;

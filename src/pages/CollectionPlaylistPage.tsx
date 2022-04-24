import { useState, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { togglePlay } from '../store/player-slice';
import { AuthContext } from '../context/auth-context';
import Playlist from '../types/Playlist';
import Track from '../types/Track';
import Episode from '../types/Episode';
import ApiSpotify from '../utils/api-spotify';
import { getHighestImage } from '../utils/helpers';
import { EPISODE_LOGO_IMAGE, GRID_CARD_COUNT, ITEM_LIST_LIMIT } from '../utils/constants';

import CardItem from '../components/Card/CardItem';
import CardCollection from '../components/Card/CardCollection';
import CardItemSkeleton from '../components/Card/CardItemSkeleton';
import InfiniteScroll from '../components/InfiniteScroll/InfiniteScroll';
import useFetchList from '../hooks/useFetchList';

const CollectionPlaylistPage: React.FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [playlistTotalTrack, setplaylistTotalTrack] = useState<number>(0);
  const [playlistTotalEpisode, setplaylistTotalEpisode] = useState<number>(0);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCollectionPlaylist = async () => {
      try {
        setIsLoading(true);
        const paramsTrack = { limit: 5 };
        const paramsEpisode = { limit: 1 };
        const [
          dataPlaylistTrack,
          dataPlaylistEpisode,
        ] =
          await Promise.all([
            ApiSpotify.get('/me/tracks', { params: paramsTrack }),
            ApiSpotify.get('/me/episodes', { params: paramsEpisode }),
          ]);

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
      params: { limit: ITEM_LIST_LIMIT },
    });
    const episodeUris = response.data.items.map(
      (v: { added_at: Date; episode: Episode }) => v.episode.uri
    );
    dispatch(togglePlay({
      uris: episodeUris,
    }));
  };

  const { setNextUrl, items, pageData, hasPagination } = useFetchList<Playlist>({
    url: '/me/playlists',
  });

  const CardLoading = (
    [...Array(GRID_CARD_COUNT)].map((_, idx) => (
      <CardItemSkeleton key={idx} />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="text-2xl mb-4 font-bold">PLAYLISTS</div>
      <InfiniteScroll
        className="grid-wrapper"
        dataLength={items.length}
        next={() => setNextUrl(pageData.next)}
        hasMore={pageData.next === null ? !!pageData.next : hasPagination}
        loader={CardLoading}
      >
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
        <CardItem
          name="Your Episodes"
          description={playlistTotalEpisode + ' episodes'}
          image={EPISODE_LOGO_IMAGE}
          // uri="spotify:user:afandy9895:collection:your-episodes"
          href={'/collection/episodes'}
          onClickPlay={handlePlayEpisode}
        />
        {items.map((playlist) => (
          <CardItem
            key={playlist.id}
            name={playlist.name}
            description={playlist.description || 'By ' + playlist.owner.display_name}
            image={getHighestImage(playlist.images)}
            uri={playlist.uri}
            href={'/playlist/' + playlist.id}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default CollectionPlaylistPage;

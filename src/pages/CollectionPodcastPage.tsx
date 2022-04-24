import { useState, useEffect } from 'react';
import Show from '../types/Show';
import Episode from '../types/Episode';
import ApiSpotify from '../utils/api-spotify';
import { getHighestImage } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import CardCollection from '../components/Card/CardCollection';
import CardItemSkeleton from '../components/Card/CardItemSkeleton';
import InfiniteScroll from '../components/InfiniteScroll/InfiniteScroll';
import useFetchList from '../hooks/useFetchList';
import { GRID_CARD_COUNT } from '../utils/constants';

type CollectionPodcast = {
  added_at: Date;
  show: Show;
};

const CollectionPodcastPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playlistEpisodes, setPlaylistEpisodes] = useState<Episode[]>([]);
  const [playlistTotalEpisode, setplaylistTotalEpisode] = useState<number>(0);

  useEffect(() => {
    const fetchCollectionPodcast = async () => {
      try {
        setIsLoading(true);
        const paramsEpisode = { limit: 5 };
        const dataPlaylistEpisode = await ApiSpotify.get('/me/episodes', { params: paramsEpisode });

        setPlaylistEpisodes(
          dataPlaylistEpisode.data.items.map(
            (item: { added_at: Date; episode: Episode }) => ({
              ...item.episode,
              added_at: item.added_at,
            })
          )
        );
        setplaylistTotalEpisode(dataPlaylistEpisode.data.total);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionPodcast();
  }, []);

  const { setNextUrl, items, pageData, hasPagination } = useFetchList<CollectionPodcast>({
    url: '/me/shows',
  });

  const CardLoading = (
    [...Array(GRID_CARD_COUNT)].map((_, idx) => (
      <CardItemSkeleton key={idx} />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="text-2xl mb-4 font-bold">PODCASTS</div>
      <InfiniteScroll
        className="grid-wrapper"
        dataLength={items.length}
        next={() => setNextUrl(pageData.next)}
        hasMore={pageData.next === null ? !!pageData.next : hasPagination}
        loader={CardLoading}
      >
        <div className="col-span-2">
          <CardCollection
            className="bg-gradient-to-b from-green-300 to-green-800"
            uris={playlistEpisodes.map((episode) => episode.uri)}
            episodes={playlistEpisodes}
            type="episode"
            total={playlistTotalEpisode}
            href="/collection/episodes"
            isLoading={isLoading}
          />
        </div>
        {items.map(({ show }) => (
          <CardItem
            key={show.id}
            name={show.name}
            description={show.publisher}
            image={getHighestImage(show.images)}
            uri={show.uri}
            href={'/show/' + show.id}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default CollectionPodcastPage;

import Artist from '../types/Artist';
import { getHighestImage } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import CardItemSkeleton from '../components/Card/CardItemSkeleton';
import useFetchList from '../hooks/useFetchList';
import InfiniteScroll from '../components/InfiniteScroll/InfiniteScroll';
import { GRID_CARD_COUNT } from '../utils/constants';

const CollectionArtistPage: React.FC = () => {

  const { setNextUrl, items, pageData, hasPagination } = useFetchList<Artist>({
    url: '/me/following?type=artist',
    propertyName: 'artists',
  });

  const CardLoading = (
    [...Array(GRID_CARD_COUNT)].map((_, idx) => (
      <CardItemSkeleton key={idx} />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="text-2xl mb-4 font-bold">ARTISTS</div>
      <InfiniteScroll
        className="grid-wrapper"
        dataLength={items.length}
        next={() => setNextUrl(pageData.next)}
        hasMore={pageData.next === null ? !!pageData.next : hasPagination}
        loader={CardLoading}
      >
        {items.map((artist) => (
          <CardItem
            key={artist.id}
            name={artist.name}
            description={artist.type}
            image={getHighestImage(artist.images)}
            uri={artist.uri}
            href={'/artist/' + artist.id}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default CollectionArtistPage;

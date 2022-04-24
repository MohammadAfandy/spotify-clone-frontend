import Album from '../types/Album';
import { getArtistNames, getHighestImage } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import CardItemSkeleton from '../components/Card/CardItemSkeleton';
import useFetchList from '../hooks/useFetchList';
import InfiniteScroll from '../components/InfiniteScroll/InfiniteScroll';
import { GRID_CARD_COUNT } from '../utils/constants';

type CollectionAlbum = {
  added_at: Date;
  album: Album;
};

const CollectionAlbumPage: React.FC = () => {
  const { setNextUrl, items, pageData, hasPagination } = useFetchList<CollectionAlbum>({
    url: '/me/albums',
  });

  const CardLoading = (
    [...Array(GRID_CARD_COUNT)].map((_, idx) => (
      <CardItemSkeleton key={idx} />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="text-2xl mb-4 font-bold">ALBUMS</div>
      <InfiniteScroll
        className="grid-wrapper"
        dataLength={items.length}
        next={() => setNextUrl(pageData.next)}
        hasMore={pageData.next === null ? !!pageData.next : hasPagination}
        loader={CardLoading}
      >
        {items.map(({ album }) => (
          <CardItem
            key={album.id}
            name={album.name}
            description={getArtistNames(album.artists)}
            image={getHighestImage(album.images)}
            uri={album.uri}
            href={'/album/' + album.id}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default CollectionAlbumPage;

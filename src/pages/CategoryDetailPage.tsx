import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Category from '../types/Category';
import Playlist from '../types/Playlist';
import { AuthContext } from '../context/auth-context';
import { makeRequest } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import Skeleton from '../components/Skeleton/Skeleton';
import CardItemSkeleton from '../components/Card/CardItemSkeleton';
import InfiniteScroll from '../components/InfiniteScroll/InfiniteScroll';
import useFetchList from '../hooks/useFetchList';
import { GRID_CARD_COUNT } from '../utils/constants';

const CategoryDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [category, setCategory] = useState<Category>(Object);

  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const dataCategories = await makeRequest('/browse/categories/' + params.id, {}, isLoggedIn);
        setCategory(dataCategories.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [params.id, isLoggedIn]);

  const { setNextUrl, items, pageData, hasPagination } = useFetchList<Playlist>({
    url: '/browse/categories/' + params.id + '/playlists',
    propertyName: 'playlists',
    limit: 20, // "j-trakcs" category will response with "server error" if limit above 27 ?
  });

  const CardLoading = (
    [...Array(GRID_CARD_COUNT)].map((_, idx) => (
      <CardItemSkeleton key={idx} />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="w-full text-4xl font-bold mb-5">
        {isLoading && <Skeleton width={200} height={20} />}
        {!isLoading && category.name}
      </div>
      <InfiniteScroll
        className="grid-wrapper"
        dataLength={items.length}
        next={() => setNextUrl(pageData.next)}
        hasMore={pageData.next === null ? !!pageData.next : hasPagination}
        loader={CardLoading}
      >
        {items.map((playlist, idx) => (
          <CardItem
            key={idx + playlist.id}
            name={playlist.name}
            description={`By ${playlist.owner.display_name}`}
            image={
              playlist.images && playlist.images[0] && playlist.images[0].url
            }
            uri={playlist.uri}
            href={'/playlist/' + playlist.id}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default CategoryDetailPage;

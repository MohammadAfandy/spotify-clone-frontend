import { useHistory } from 'react-router-dom';
import Category from '../types/Category';

import cardStyles from '../components/Card/Card.module.css';
import CardItemSkeleton from '../components/Card/CardItemSkeleton';
import useFetchList from '../hooks/useFetchList';
import InfiniteScroll from '../components/InfiniteScroll/InfiniteScroll';
import { GRID_CARD_COUNT } from '../utils/constants';

const SearchPage: React.FC = () => {
  const history = useHistory();

  const { setNextUrl, items, pageData, hasPagination } = useFetchList<Category>({
    url: '/browse/categories',
    propertyName: 'categories',
  });

  const CardLoading = (
    [...Array(GRID_CARD_COUNT)].map((_, idx) => (
      <CardItemSkeleton key={idx} />
    ))
  );

  return (
    <div className="sm:p-4 p-2">
      <InfiniteScroll
        className="grid-wrapper"
        dataLength={items.length}
        next={() => setNextUrl(pageData.next)}
        hasMore={pageData.next === null ? !!pageData.next : hasPagination}
        loader={CardLoading}
      >
        {items.map((category) => (
          <div
            key={category.id}
            className={`${cardStyles.cardItem} relative cursor-pointer transition duration-300 ease-in-out transform hover:scale-105`}
            onClick={() => history.push('/category/' + category.id)}
          >
            <img
              src={category.icons[0].url}
              alt={category.id}
              className="rounded-xl filter brightness-200 h-full w-full"
            />
            <div className="font-bold text-center text-2xl absolute bottom-1 left-1/2 transform -translate-x-1/2 ">
              {category.name}
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default SearchPage;

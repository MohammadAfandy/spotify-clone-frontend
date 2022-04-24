import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Artist from '../types/Artist';
import Album from '../types/Album';

import CardItem from '../components/Card/CardItem';
import CardItemSkeleton from '../components/Card/CardItemSkeleton';
import useFetchList from '../hooks/useFetchList';
import InfiniteScroll from '../components/InfiniteScroll/InfiniteScroll';
import { GRID_CARD_COUNT } from '../utils/constants';

const AritstAllPage: React.FC = () => {
  const history = useHistory();
  const { id, type } = useParams<{ id: string; type: string }>();

  if (['related', 'albums'].includes(type) === false) {
    history.replace('/');
  }

  const [endpoint, setEndpoint] = useState('');
  const [propertyName, setPropertyName] = useState('');

  useEffect(() => {
    const fetchArtistAll = async () => {
      try {
        let uri = '';
        if (type === 'albums') {
          uri = 'albums';
          setPropertyName('');
        } else if (type === 'related') {
          uri = 'related-artists';
          setPropertyName('artists');
        }
        setEndpoint('/artists/' + id + '/' + uri);
      } catch (error) {
        console.error(error);
      }
    };

    fetchArtistAll();
  }, [type, id]);

  const { setNextUrl, items, pageData, hasPagination } = useFetchList<Artist | Album>({
    url: endpoint,
    propertyName,
  });

  const CardLoading = (
    [...Array(GRID_CARD_COUNT)].map((_, idx) => (
      <CardItemSkeleton key={idx} />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="text-2xl font-bold mb-4 truncate">
        {type === 'related' && 'Fan Also Like'}
        {type === 'albums' && 'Albums'}
      </div>
      <InfiniteScroll
        className="grid-wrapper"
        dataLength={items.length}
        next={() => setNextUrl(pageData.next)}
        hasMore={pageData.next === null ? !!pageData.next : hasPagination}
        loader={CardLoading}
      >
        {items.map((item) => (
          <CardItem
            key={item.id}
            name={item.name}
            description={''}
            image={item.images && item.images[0] && item.images[0].url}
            uri={item.uri}
            href={(type === 'albums' ? '/album/' : '/artist/') + item.id}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default AritstAllPage;

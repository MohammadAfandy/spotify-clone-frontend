import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import { getHighestImage, getArtistNames } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import Skeleton from '../components/Skeleton/Skeleton';
import CardItemSkeleton from '../components/Card/CardItemSkeleton';
import InfiniteScroll from '../components/InfiniteScroll/InfiniteScroll';
import useFetchList from '../hooks/useFetchList';
import { GRID_CARD_COUNT } from '../utils/constants';

const GenrePage: React.FC = () => {
  const { type } = useParams<{ query: string; type: string }>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [typeText, setTypeText] = useState('');

  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchGenre = async () => {
      try {
        setIsLoading(true);

        if (type === 'featured-playlists') {
          setEndpoint('/browse/featured-playlists');
          setPropertyName('playlists');
        } else if (type === 'recently-played') {
          setTypeText('Recently Played');
          setEndpoint('/me/player/recently-played');
          setPropertyName('');
        } else if (type === 'top-tracks') {
          setTypeText('Your Top Tracks');
          setEndpoint('/me/top/tracks');
          setPropertyName('');
        } else if (type === 'top-artists') {
          setTypeText('Your Top Artists');
          setEndpoint('/me/top/artists');
          setPropertyName('');
        } else if (type === 'new-releases') {
          setTypeText('New Releases');
          setEndpoint('/browse/new-releases');
          setPropertyName('albums');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenre();
  }, [type, isLoggedIn]);

  const CardLoading = (
    [...Array(GRID_CARD_COUNT)].map((_, idx) => (
      <CardItemSkeleton key={idx} />
    ))
  );

  const { setNextUrl, items, pageData, hasPagination, additionalData } = useFetchList<any>({
    url: endpoint,
    propertyName,
  });

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="text-2xl font-bold mb-4 truncate">
        {isLoading && <Skeleton width={200} height={20} />}
        {!isLoading && (additionalData?.message || typeText)}
      </div>
      <InfiniteScroll
        className="grid-wrapper"
        dataLength={items.length}
        next={() => setNextUrl(pageData.next)}
        hasMore={pageData.next === null ? !!pageData.next : hasPagination}
        loader={CardLoading}
      >
        {type === 'featured-playlists' && items.map((item) => (
          <CardItem
            key={item.id}
            name={item.name}
            description={`By ${item.owner.display_name}`}
            image={getHighestImage(item.images)}
            uri={item.uri}
            href={'/playlist/' + item.id}
          />
        ))}
        {type === 'top-tracks' && items.map((item) => (
          <CardItem
            key={item.id}
            name={item.name}
            description={getArtistNames(item.artists)}
            image={getHighestImage(item.album.images)}
            uri={item.uri}
            href={'/album/' + item.album.id}
          />
        ))}
        {type === 'recently-played' && items.map(({ track: item }) => (
          <CardItem
            key={item.id}
            name={item.name}
            description={getArtistNames(item.artists)}
            image={getHighestImage(item.album.images)}
            uri={item.uri}
            href={'/album/' + item.album.id}
          />
        ))}
        {type === 'top-artists' && items.map((item) => (
          <CardItem
            key={item.id}
            name={item.name}
            description={item.type}
            image={getHighestImage(item.images)}
            uri={item.uri}
            href={'/artist/' + item.id}
          />
        ))}
        {type === 'new-releases' && items.map((item) => (
          <CardItem
            key={item.id}
            name={item.name}
            description={getArtistNames(item.artists)}
            image={getHighestImage(item.images)}
            uri={item.uri}
            href={'/album/' + item.id}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default GenrePage;

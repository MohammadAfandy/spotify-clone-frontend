import { useParams, useHistory } from 'react-router-dom';

import CardItem from '../components/Card/CardItem';
import CardItemSkeleton from '../components/Card/CardItemSkeleton';
import InfiniteScroll from '../components/InfiniteScroll/InfiniteScroll';
import useFetchList from '../hooks/useFetchList';
import { GRID_CARD_COUNT } from '../utils/constants';

const SearchResultAllPage: React.FC = () => {
  const history = useHistory();
  const { query, type } = useParams<{ query: string; type: string }>();

  if (
    ['track', 'artist', 'album', 'playlist', 'show', 'episode'].includes(
      type
    ) === false
  ) {
    history.replace('/');
  }

  const { setNextUrl, items, pageData, hasPagination } = useFetchList<any>({
    url: `/search?q=${query}&type=${type}`,
    propertyName: `${type}s`,
  });

  const CardLoading = (
    [...Array(GRID_CARD_COUNT)].map((_, idx) => (
      <CardItemSkeleton key={idx} />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="text-2xl font-bold mb-4 truncate">
        All {type} for “{query}”
      </div>
      <InfiniteScroll
        className="grid-wrapper"
        dataLength={items.length}
        next={() => setNextUrl(pageData.next)}
        hasMore={pageData.next === null ? !!pageData.next : hasPagination}
        loader={CardLoading}
      >
      {/* <div className="grid-wrapper"> */}
        {type === 'artist' && items.map((artist, idx) => (
          <CardItem
            key={idx + artist.id}
            name={artist.name}
            description={''}
            image={artist.images && artist.images[0] && artist.images[0].url}
            uri={artist.uri}
            href={'/artist/' + artist.id}
          />
        ))}
        {type === 'album' && items.map((album, idx) => (
          <CardItem
            key={idx + album.id}
            name={album.name}
            description={''}
            image={album.images && album.images[0] && album.images[0].url}
            uri={album.uri}
            href={'/album/' + album.id}
          />
        ))}
        {type === 'playlist' && items.map((playlist, idx) => (
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
        {type === 'show' && items.map((show, idx) => (
          <CardItem
            key={idx + show.id}
            name={show.name}
            description={show.publisher}
            image={show.images && show.images[0] && show.images[0].url}
            uri={show.uri}
            href={'/show/' + show.id}
          />
        ))}
        {type === 'episode' && items.map((episode, idx) => (
          <CardItem
            key={idx + episode.id}
            name={episode.name}
            description={''}
            image={
              episode.images && episode.images[0] && episode.images[0].url
            }
            uri={episode.uri}
            href={'/episode/' + episode.id}
          />
        ))}
      {/* </div> */}
      </InfiniteScroll>
    </div>
  );
};

export default SearchResultAllPage;

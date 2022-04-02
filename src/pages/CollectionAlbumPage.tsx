import { useState, useEffect } from 'react';
import Album from '../types/Album';
import ApiSpotify from '../utils/api-spotify';
import { getArtistNames, getHighestImage } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import GridWrapper from '../components/Grid/GridWrapper';
import { CARD_COUNT } from '../utils/constants';
import CardItemSkeleton from '../components/Card/CardItemSkeleton';

const CollectionAlbumPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const fetchCollectionAlbum = async () => {
      try {
        setIsLoading(true);
        const response = await ApiSpotify.get('/me/albums', {
          params: { limit: 50 },
        });
  
        setAlbums(
          response.data.items.map((item: { added_at: Date; album: Album }) => ({
            ...item.album,
            added_at: item.added_at,
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionAlbum();
  }, []);

  const CardLoading = (
    [...Array(CARD_COUNT)].map((_, idx) => (
      <CardItemSkeleton key={idx} />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="text-2xl mb-4 font-bold">ALBUMS</div>
      <GridWrapper>
        {isLoading && CardLoading}
        {!isLoading && albums.map((album) => (
          <CardItem
            key={album.id}
            name={album.name}
            description={getArtistNames(album.artists)}
            image={getHighestImage(album.images)}
            uri={album.uri}
            href={'/album/' + album.id}
          />
        ))}
      </GridWrapper>
    </div>
  );
};

export default CollectionAlbumPage;

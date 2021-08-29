import { useState, useEffect } from 'react';
import Album from '../types/Album';
import ApiSpotify from '../utils/api-spotify';
import { getArtistNames, getHighestImage } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import GridWrapper from '../components/Grid/GridWrapper';

const CollectionAlbumPage: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const fetchCollectionAlbum = async () => {
      const response = await ApiSpotify.get('/me/albums', {
        params: { limit: 50 },
      });

      setAlbums(
        response.data.items.map((item: { added_at: Date; album: Album }) => ({
          ...item.album,
          added_at: item.added_at,
        }))
      );
    };

    fetchCollectionAlbum();
  }, []);

  return (
    <div className="flex flex-col px-4 py-4">
      <div className="text-2xl mb-4 font-bold">ALBUMS</div>
      <GridWrapper>
        {albums.map((album) => (
          <div>
            <CardItem
              key={album.id}
              name={album.name}
              description={getArtistNames(album.artists)}
              image={getHighestImage(album.images)}
              uri={album.uri}
              href={'/album/' + album.id}
            />
          </div>
        ))}
      </GridWrapper>
    </div>
  );
};

export default CollectionAlbumPage;
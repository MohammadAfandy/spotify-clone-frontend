import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Category from '../types/Category';
import Playlist from '../types/Playlist';
import { AuthContext } from '../context/auth-context';
import { makeRequest } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import GridWrapper from '../components/Grid/GridWrapper';
import Skeleton from '../components/Skeleton/Skeleton';
import CardItemSkeleton from '../components/Card/CardItemSkeleton';

const CategoryDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [category, setCategory] = useState<Category>(Object);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const dataCategories = await makeRequest('/browse/categories/' + params.id, {}, isLoggedIn);
        setCategory(dataCategories.data);
        const dataPlaylist = await makeRequest(
          '/browse/categories/' + params.id + '/playlists',
          {},
          isLoggedIn,
        );
        setPlaylists(dataPlaylist.data.playlists.items);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [params.id, isLoggedIn]);

  const CardLoading = (
    [...Array(20)].map((_, idx) => (
      <CardItemSkeleton key={idx} />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="w-full text-4xl font-bold mb-5">
        {isLoading && <Skeleton width={200} height={20} />}
        {!isLoading && category.name}
      </div>
      <GridWrapper>
        {isLoading && CardLoading}
        {!isLoading && playlists.map((playlist) => (
          <CardItem
            key={playlist.id}
            name={playlist.name}
            description={`By ${playlist.owner.display_name}`}
            image={
              playlist.images && playlist.images[0] && playlist.images[0].url
            }
            uri={playlist.uri}
            href={'/playlist/' + playlist.id}
          />
        ))}
      </GridWrapper>
    </div>
  );
};

export default CategoryDetailPage;

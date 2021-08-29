import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Category from '../types/Category';
import Playlist from '../types/Playlist';
import { AuthContext } from '../context/auth-context';
import { makeRequest } from '../utils/helpers';

import CardItem from '../Components/Card/CardItem';
import GridWrapper from '../Components/Grid/GridWrapper';

const CategoryDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category>(Object);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchCategory = async () => {
      const response = await makeRequest('/browse/categories/' + params.id, {}, isLoggedIn);
      setCategory(response.data);
    };
    const fetchPlayList = async () => {
      const response = await makeRequest(
        '/browse/categories/' + params.id + '/playlists',
        {},
        isLoggedIn,
      );
      setPlaylists(response.data.playlists.items);
    };

    fetchCategory();
    fetchPlayList();
  }, [params.id, isLoggedIn]);

  return (
    <div className="flex flex-col px-4 py-4">
      <div className="w-full text-4xl font-bold mb-5">{category.name}</div>
      <GridWrapper>
        {playlists.map((playlist) => (
          <CardItem
            key={playlist.id}
            name={playlist.name}
            description={playlist.owner.name}
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

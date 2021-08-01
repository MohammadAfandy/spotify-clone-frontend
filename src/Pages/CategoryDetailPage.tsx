import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import Category from '../types/Category';
import Playlist from '../types/Playlist';
import ApiSpotify from '../utils/api-spotify';

import CardItem from '../Components/Card/CardItem';

const CategoryDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category>(Object);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const fetchCategory = async () => {
      const response = await ApiSpotify.get('/browse/categories/' + params.id);
      setCategory(response.data);
    };
    const fetchPlayList = async () => {
      const response = await ApiSpotify.get('/browse/categories/' + params.id + '/playlists');
      setPlaylists(response.data.playlists.items);
    };

    fetchCategory();
    fetchPlayList();
  }, [params.id]);

  return (
    <div className="flex flex-col px-4 py-4">
      <div className="w-full text-4xl font-bold mb-5">
        {category.name}
      </div>
      <div className="grid grid-cols-5 gap-4">
        {playlists.map((playlist) => (
          <CardItem
            key={playlist.id}
            name={playlist.name}
            description={playlist.owner.name}
            image={playlist.images && playlist.images[0] && playlist.images[0].url}
            uri={playlist.uri}
            href={'/playlist/' + playlist.id}
          />
        ))}
      </div>
    </div>
  )
}

export default CategoryDetailPage

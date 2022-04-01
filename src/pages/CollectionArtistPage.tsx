import { useState, useEffect } from 'react';
import Artist from '../types/Artist';
import ApiSpotify from '../utils/api-spotify';
import { getHighestImage } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import GridWrapper from '../components/Grid/GridWrapper';
import { CARD_COUNT } from '../utils/constants';

const CollectionArtistPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    const fetchCollectionArtist = async () => {
      try {
        setIsLoading(true);
        const response = await ApiSpotify.get('/me/following', {
          params: { type: 'artist', limit: 50 },
        });

        setArtists(response.data.artists.items);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionArtist();
  }, []);

  const CardLoading = (
    [...Array(CARD_COUNT)].map((_, idx) => (
      <CardItem key={idx} isLoading />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="text-2xl mb-4 font-bold">ARTISTS</div>
      <GridWrapper>
        {isLoading && CardLoading}
        {!isLoading && artists.map((artist) => (
          <CardItem
            key={artist.id}
            name={artist.name}
            description={artist.type}
            image={getHighestImage(artist.images)}
            uri={artist.uri}
            href={'/artist/' + artist.id}
          />
        ))}
      </GridWrapper>
    </div>
  );
};

export default CollectionArtistPage;

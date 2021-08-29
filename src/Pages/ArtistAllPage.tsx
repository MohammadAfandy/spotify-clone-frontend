import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import ApiSpotify from '../utils/api-spotify';
import Artist from '../types/Artist';
import Album from '../types/Album';

import CardItem from '../Components/Card/CardItem';
import GridWrapper from '../Components/Grid/GridWrapper';

const AritstAllPage: React.FC = () => {
  const history = useHistory();
  const { id, type } = useParams<{ id: string; type: string }>();

  if (['related', 'albums'].includes(type) === false) {
    history.replace('/');
  }

  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const fetchArtistAll = async () => {
      let uri = '';
      if (type === 'albums') {
        uri = 'albums';
      } else if (type === 'related') {
        uri = 'related-artists';
      }
      const response = await ApiSpotify.get('/artists/' + id + '/' + uri, {
        params: {
          limit: 50,
        },
      });

      if (type === 'related') {
        setRelatedArtists(response.data.artists);
      } else if (type === 'albums') {
        setAlbums(response.data.items);
      }
    };

    fetchArtistAll();
  }, [type, id]);

  return (
    <div className="flex flex-col px-4 py-4">
      <div className="text-2xl mb-4">
        {type === 'related' && 'Fan Also Like'}
        {type === 'albums' && 'Albums'}
      </div>
      {type === 'related' && (
        <GridWrapper>
          {relatedArtists.map((artist) => (
            <CardItem
              key={artist.id}
              name={artist.name}
              description={''}
              image={artist.images && artist.images[0] && artist.images[0].url}
              uri={artist.uri}
              href={'/artist/' + artist.id}
            />
          ))}
        </GridWrapper>
      )}
      {type === 'albums' && (
        <GridWrapper>
          {albums.map((album) => (
            <CardItem
              key={album.id}
              name={album.name}
              description={''}
              image={album.images && album.images[0] && album.images[0].url}
              uri={album.uri}
              href={'/album/' + album.id}
            />
          ))}
        </GridWrapper>
      )}
    </div>
  );
};

export default AritstAllPage;

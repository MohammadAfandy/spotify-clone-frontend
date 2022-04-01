import { useState, useEffect } from 'react';
import Show from '../types/Show';
import Episode from '../types/Episode';
import ApiSpotify from '../utils/api-spotify';
import { getHighestImage } from '../utils/helpers';

import CardItem from '../components/Card/CardItem';
import CardCollection from '../components/Card/CardCollection';
import GridWrapper from '../components/Grid/GridWrapper';
import { CARD_COUNT } from '../utils/constants';

const CollectionPodcastPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [podcasts, setPodcasts] = useState<Show[]>([]);
  const [playlistEpisodes, setPlaylistEpisodes] = useState<Episode[]>([]);
  const [playlistTotalEpisode, setplaylistTotalEpisode] = useState<number>(0);

  useEffect(() => {
    const fetchCollectionPodcast = async () => {
      try {
        setIsLoading(true);
        const paramsPodcast = { limit: 50 };
        const paramsEpisode = { limit: 5 };
        const [dataPodcast, dataPlaylistEpisode] = await Promise.all([
          ApiSpotify.get('/me/shows', { params: paramsPodcast }),
          ApiSpotify.get('/me/episodes', { params: paramsEpisode }),
        ]);
  
        setPodcasts(
          dataPodcast.data.items.map((item: { added_at: Date; show: Show }) => ({
            ...item.show,
            added_at: item.added_at,
          }))
        );
        setPlaylistEpisodes(
          dataPlaylistEpisode.data.items.map(
            (item: { added_at: Date; episode: Episode }) => ({
              ...item.episode,
              added_at: item.added_at,
            })
          )
        );
        setplaylistTotalEpisode(dataPlaylistEpisode.data.total);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionPodcast();
  }, []);

  const CardLoading = (
    [...Array(CARD_COUNT)].map((_, idx) => (
      <CardItem key={idx} isLoading />
    ))
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="text-2xl mb-4 font-bold">PODCASTS</div>
      <GridWrapper>
        <div className="col-span-2">
          <CardCollection
            className="bg-gradient-to-b from-green-300 to-green-800"
            uris={playlistEpisodes.map((episode) => episode.uri)}
            episodes={playlistEpisodes}
            type="episode"
            total={playlistTotalEpisode}
            href="/collection/episodes"
            isLoading={isLoading}
          />
        </div>
        {isLoading && CardLoading}
        {!isLoading && podcasts.map((show) => (
          <CardItem
            key={show.id}
            name={show.name}
            description={show.publisher}
            image={getHighestImage(show.images)}
            uri={show.uri}
            href={'/show/' + show.id}
          />
        ))}
      </GridWrapper>
    </div>
  );
};

export default CollectionPodcastPage;

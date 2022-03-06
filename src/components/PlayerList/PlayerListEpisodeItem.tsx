import { useState, useEffect } from 'react';
import {
  MdPlayCircle,
  MdAddCircle,
  MdCheck,
} from 'react-icons/md';
import Episode from '../../types/Episode';
import ApiSpotify from '../../utils/api-spotify';
import {
  getHighestImage,
  formatDate,
  duration,
} from '../../utils/helpers';

import Skeleton from '../Skeleton/Skeleton';
import Explicit from '../Text/Explicit';
import TextLink from '../Text/TextLink';

type PlayerListEpisodeItemProps = {
  episode?: Episode;
  number?: number;
  handlePlayEpisode?: (offset: number, positionMs: number) => void;
  isLoading?: boolean;
};

const defaultProps: PlayerListEpisodeItemProps = {
  episode: {} as Episode,
  number: 0,
  handlePlayEpisode: (offset: number, positionMs: number) => {},
  isLoading: false,
};

const PlayerListEpisodeItem: React.FC<PlayerListEpisodeItemProps> = ({
  episode,
  number,
  handlePlayEpisode,
  isLoading,
}) => {
  const [isSaved, setIsSaved] = useState(episode?.is_saved);

  useEffect(() => {
    setIsSaved(episode?.is_saved);
  }, [episode?.is_saved]);

  const handleAddToSavedEpisode = async (id: string) => {
    const params = {
      ids: id,
    };
    let response;
    if (isSaved) {
      response = await ApiSpotify.delete('/me/episodes', { params });
    } else {
      response = await ApiSpotify.put('/me/episodes', {}, { params });
    }
    if (response.status === 200) {
      setIsSaved((prevState) => !prevState);
    }
  };

  const LoadingComponent = (
    <>
      <div className="mr-4 w-24 h-24 rounded-xl">
        <Skeleton className="h-full" />
      </div>
      <div className="flex flex-col w-full">
        <Skeleton className="h-full" />
        <Skeleton className="h-full" />
        <Skeleton className="h-full" />
      </div>
    </>
  );

  return (
    <div
      className="group flex items-center px-2 py-4 border-t-2 border-opacity-10 hover:bg-gray-500 hover:bg-opacity-25"
    >
      {isLoading && LoadingComponent}
      {!isLoading && episode && (
        <>
          <img
            src={getHighestImage(episode.images)}
            alt={episode.name}
            className="mr-4 w-24 h-24 rounded-xl"
          />
          <div className="flex flex-col w-full">
            <TextLink
              className="mb-2"
              text={episode.name}
              url={'/episode/' + episode.id}
            />
            <div className="mb-2 text-sm font-light line-clamp-2">
              {episode.description}
            </div>
            <div className="flex items-center text-xs">
              <div className="flex items-center mr-auto">
                <MdPlayCircle
                  className="mr-4 w-8 h-8 cursor-pointer"
                  onClick={() => handlePlayEpisode && number && handlePlayEpisode(number - 1, 0)}
                />
                {episode.explicit && <Explicit />}
                <div className="mr-2">
                  {formatDate(episode.release_date, 'MMM DD')}
                </div>
                <div>{duration(episode.duration_ms, true)}</div>
              </div>
              <div className="flex canhover:hidden canhover:group-hover:flex items-center">
                {isSaved ? (
                  <MdCheck
                    className="mr-4 w-8 h-8 cursor-pointer text-green-400"
                    onClick={() => handleAddToSavedEpisode(episode.id)}
                  />
                ) : (
                  <MdAddCircle
                    className="mr-4 w-8 h-8 cursor-pointer"
                    onClick={() => handleAddToSavedEpisode(episode.id)}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

PlayerListEpisodeItem.defaultProps = defaultProps;

export default PlayerListEpisodeItem;

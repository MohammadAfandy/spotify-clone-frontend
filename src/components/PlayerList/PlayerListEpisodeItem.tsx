import { useState, useEffect } from 'react';
import { PlayCircle, PlusCircle, Check } from 'react-feather';
import Episode from '../../types/Episode';
import ApiSpotify from '../../utils/api-spotify';
import {
  getHighestImage,
  formatDate,
  duration,
} from '../../utils/helpers';

import TextLink from '../Link/TextLink';

type PlayerListEpisodeItemProps = {
  episode: Episode;
  number: number;
  handlePlayEpisode: (offset: number, positionMs: number) => void;
};

const defaultProps: PlayerListEpisodeItemProps = {
  episode: {} as Episode,
  number: 0,
  handlePlayEpisode: (offset: number, positionMs: number) => {},
};

const PlayerListEpisodeItem: React.FC<PlayerListEpisodeItemProps> = ({
  episode,
  number,
  handlePlayEpisode,
}) => {
  const [isSaved, setIsSaved] = useState(episode.is_saved);

  useEffect(() => {
    setIsSaved(episode.is_saved);
  }, [episode.is_saved]);

  const handleAddToSavedEpisode = async (id: string) => {
    const params = {
      ids: id,
    };
    let response;
    if (isSaved) {
      response = await ApiSpotify.delete('/me/episodes', { params });
    } else {
      response = await ApiSpotify.put('/me/episodes', null, { params });
    }
    if (response.status === 200) {
      setIsSaved((prevState) => !prevState);
    }
  };

  return (
    <div
      className="group flex items-center px-2 py-4 border-t-2 border-opacity-10 hover:bg-gray-500 hover:bg-opacity-25"
      key={episode.id}
    >
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
            <PlayCircle
              className="mr-4 w-8 h-8 cursor-pointer"
              onClick={() => handlePlayEpisode(number - 1, 0)}
            />
            {episode.explicit && (
              <div className="bg-gray-100 border border-black text-black rounded-xs px-1 text-xs mr-2">
                E
              </div>
            )}
            <div className="mr-2">
              {formatDate(episode.release_date, 'MMM DD')}
            </div>
            <div>{duration(episode.duration_ms, true)}</div>
          </div>
          <div className="hidden group-hover:flex items-center">
            {isSaved ? (
              <Check
                className="mr-4 w-8 h-8 cursor-pointer text-green-400"
                onClick={() => handleAddToSavedEpisode(episode.id)}
              />
            ) : (
              <PlusCircle
                className="mr-4 w-8 h-8 cursor-pointer"
                onClick={() => handleAddToSavedEpisode(episode.id)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

PlayerListEpisodeItem.defaultProps = defaultProps;

export default PlayerListEpisodeItem;

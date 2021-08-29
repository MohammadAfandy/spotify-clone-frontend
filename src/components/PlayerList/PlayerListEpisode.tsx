import InfiniteScroll from 'react-infinite-scroll-component';
import Episode from '../../types/Episode';

import PlayerListEpisodeItem from './PlayerListEpisodeItem';

type PlayerListEpisodeProps = {
  episodes: Episode[];
  handlePlayEpisode: (offset: number, positionMs: number) => void;
  handleNext: () => void;
  hasMore: boolean;
};

const defaultProps: PlayerListEpisodeProps = {
  episodes: [],
  handlePlayEpisode: (offset: number, positionMs: number) => {},
  handleNext: () => {},
  hasMore: false,
};

const PlayerListEpisode: React.FC<PlayerListEpisodeProps> = ({
  episodes,
  handlePlayEpisode,
  handleNext,
  hasMore,
}) => {
  return (
    <div className="flex flex-col">
      {episodes && (
        <InfiniteScroll
          dataLength={episodes.length}
          next={handleNext}
          hasMore={hasMore}
          loader={<h4>Loading ...</h4>}
          scrollableTarget="main-container"
        >
          {episodes.map((episode, idx) => (
            <PlayerListEpisodeItem
              key={episode.id}
              episode={episode}
              number={idx + 1}
              handlePlayEpisode={handlePlayEpisode}
            />
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

PlayerListEpisode.defaultProps = defaultProps;

export default PlayerListEpisode;
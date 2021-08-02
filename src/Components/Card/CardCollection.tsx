import { Fragment, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { PlayerContext } from '../../context/player-context';
import Track from '../../types/Track';
import Episode from '../../types/Episode';

import PlayButton from '../Button/PlayButton';
type CardCollectionProps = {
  className?: string;
  uris: string[];
  tracks?: Track[];
  episodes?: Episode[];
  total: number;
  type: 'track' | 'episode';
  href?: string;
};

const defaultProps: CardCollectionProps = {
  className: '',
  uris: [],
  tracks: [],
  episodes: [],
  total: 0,
  type: 'track',
  href: '',
};

const CardCollection: React.FC<CardCollectionProps> = ({
  className,
  uris,
  tracks,
  episodes,
  type,
  total,
  href,
}) => {
  const history = useHistory();
  const { togglePlay } = useContext(PlayerContext);

  const handleClick = (event: React.MouseEvent) => {
    if (!href) return;
    history.push(href);
  };
  const handleClickPlay = (event: React.MouseEvent) => {
    event.stopPropagation();
    togglePlay(uris, 0, 0);
  };

  const bgColor =
    'bg-gradient-to-b ' +
    (type === 'track'
      ? 'from-green-300 to-green-800'
      : 'from-blue-300 to-blue-800');
  return (
    <div
      className={`group relative flex flex-col h-72 p-4 justify-end rounded-md cursor-pointer ${bgColor} ${className}`}
      onClick={handleClick}
    >
      <div className="text-justify mb-4 text-sm">
        {type === 'track' &&
          tracks &&
          tracks.map((track, idx) => (
            <Fragment key={idx}>
              <span className="font-bold">
                {track.artists[0].name}
                &nbsp;
              </span>
              <span className="font-light">
                {track.name}
                &nbsp;
              </span>
              {idx !== tracks.length - 1 && <span>•&nbsp;</span>}
            </Fragment>
          ))}

        {type === 'episode' &&
          episodes &&
          episodes.map((episode, idx) => (
            <Fragment key={idx}>
              <span className="font-bold">
                {episode.name}
                &nbsp;
              </span>
              <span className="font-light">
                {episode.show.name}
                &nbsp;
              </span>
              {idx !== episodes.length - 1 && <span>•&nbsp;</span>}
            </Fragment>
          ))}
      </div>
      <div className="text-3xl font-bold">
        {type === 'track' && 'Liked Songs'}
        {type === 'episode' && 'Your Episodes'}
      </div>
      <div className="">
        {type === 'track' && total + ' songs'}
        {type === 'episode' && total + ' episodes'}
      </div>

      <PlayButton
        className="opacity-0 group-hover:opacity-100 absolute bottom-4 right-5 h-12 w-12"
        onClick={handleClickPlay}
      />
    </div>
  );
};

CardCollection.defaultProps = defaultProps;

export default CardCollection;

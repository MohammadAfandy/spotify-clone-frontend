import { Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { togglePlay } from '../../store/player-slice';
import Track from '../../types/Track';
import Episode from '../../types/Episode';

import PlayButton from '../Button/PlayButton';
import Skeleton from '../Skeleton/Skeleton';
type CardCollectionProps = {
  className?: string;
  uris?: string[];
  tracks?: Track[];
  episodes?: Episode[];
  total?: number;
  type?: 'track' | 'episode';
  href?: string;
  isLoading?: boolean;
};

const defaultProps: CardCollectionProps = {
  className: '',
  uris: [],
  tracks: [],
  episodes: [],
  total: 0,
  type: 'track',
  href: '',
  isLoading: false,
};

const CardCollection: React.FC<CardCollectionProps> = ({
  className,
  uris,
  tracks,
  episodes,
  type,
  total,
  href,
  isLoading,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const handleClick = (event: React.MouseEvent) => {
    if (!href) return;
    history.push(href);
  };

  const handleClickPlay = (event: React.MouseEvent) => {
    if (uris && uris.length) {
      event.stopPropagation();
      dispatch(togglePlay({
        uris,
      }));
    }
  };

  const bgColor =
    'bg-gradient-to-tl ' +
    (type === 'track'
      ? 'from-indigo-500 to-indigo-800'
      : 'from-green-500 to-green-800');

  return (
    <div
      className={`group relative flex flex-col min-h-72 sm:min-h-0 h-full p-4 justify-end rounded-md cursor-pointer ${bgColor} ${className}`}
      onClick={handleClick}
    >
      <div className="text-justify mb-4 text-sm line-clamp-3">
        {isLoading && <Skeleton type="light" />}
        {!isLoading && (
          <Fragment>
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
          </Fragment>
        )}
      </div>
      <div className="text-3xl font-bold">
        {isLoading && <Skeleton type="light" />}
        {!isLoading && (
          <Fragment>
            {type === 'track' && 'Liked Songs'}
            {type === 'episode' && 'Your Episodes'}
          </Fragment>
        )}
      </div>
      <div className="">
        {isLoading && <Skeleton type="light" />}
        {!isLoading && (
          <Fragment>
            {type === 'track' && total + ' songs'}
            {type === 'episode' && total + ' episodes'}
          </Fragment>
        )}
      </div>

      {!isLoading && (
        <PlayButton
          className="opacity-0 group-hover:opacity-100 absolute bottom-4 right-5 h-12 w-12"
          onClick={handleClickPlay}
        />
      )}
    </div>
  );
};

CardCollection.defaultProps = defaultProps;

export default CardCollection;

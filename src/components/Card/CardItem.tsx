import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { FiMusic } from 'react-icons/fi';
import { PlayerContext } from '../../context/player-context';

import Skeleton from '../Skeleton/Skeleton';

import PlayButton from '../Button/PlayButton';
import { ucwords } from '../../utils/helpers';

type CardItemProps = {
  className?: string;
  name?: string;
  image?: string;
  isLoading?: boolean;
  description?: string;
  onClickPlay?: (event: React.MouseEvent<SVGElement>) => void;
  uri?: string;
  href?: string;
};

const defaultProps: CardItemProps = {
  className: '',
  name: '',
  image: '',
  isLoading: false,
  description: '',
  uri: '',
  href: '',
};

const CardItem: React.FC<CardItemProps> = ({
  className,
  name,
  image,
  isLoading,
  description,
  onClickPlay,
  uri,
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
    if (!uri) return;
    togglePlay([uri], 0, 0);
  };
  
  const LoadingComponent = (
    <div className={`card-item p-4 bg-light-black hover:bg-light-black-2 rounded-md`}>
      <Skeleton className="w-full h-75% rounded-md" />
      <div className="text-sm font-bold mt-2">
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  );

  return (
    <>
      {isLoading && LoadingComponent}
      {!isLoading && (
        <div
          className={`card-item group cursor-pointer transition duration-300 ease-in-out transform p-4 bg-light-black hover:bg-light-black-2 rounded-md ${className}`}
          onClick={handleClick}
        >
          <div className="relative h-75%">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full rounded-md min-h-full" />
            ) : (
              <div className="w-full h-full">
                <FiMusic className="w-full h-full p-8" />
              </div>
            )}
            <div className="hidden md:block opacity-0 canhover:group-hover:opacity-100 transition duration-500 ease-in-out">
              <PlayButton
                className="absolute bottom-4 right-5 h-12 w-12"
                onClick={onClickPlay ? onClickPlay : handleClickPlay}
              />
            </div>
          </div>
          <div className="text-xs font-bold mt-2">
            <div className="truncate">{name}</div>
            <div className="font-semibold text-gray-300 line-clamp-1 sm:line-clamp-2">
              {description ? ucwords(description) : <span>&nbsp;</span>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

CardItem.defaultProps = defaultProps;

export default CardItem;

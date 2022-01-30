import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { PlayerContext } from '../../context/player-context';
import { Music } from 'react-feather';

import PlayButton from '../Button/PlayButton';

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
    <div className="p-4 h-72 min-w-52 bg-light-black hover:bg-light-black-1 rounded-xl">
      <Skeleton className="w-full h-48 rounded-xl" />
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
          className={`group cursor-pointer h-72 min-w-52 transition duration-300 ease-in-out transform p-4 bg-light-black hover:bg-light-black-1 rounded-xl ${className}`}
          onClick={handleClick}
        >
          <div className="relative">
            {image ? (
              <img src={image} alt={name} className="w-full h-48 rounded-xl" />
            ) : (
              <div className="flex justify-center items-center w-full h-48 rounded-xl bg-light-black-2">
                <Music className="w-24 h-24" />
              </div>
            )}
            <div className="hidden md:block opacity-0 canhover:group-hover:opacity-100 transition duration-500 ease-in-out">
              <PlayButton
                className="absolute bottom-4 right-5 h-12 w-12"
                onClick={onClickPlay ? onClickPlay : handleClickPlay}
              />
            </div>
          </div>
          <div className="text-sm font-bold mt-2">
            <div className="truncate">{name}</div>
            <div className="text-sm font-light text-gray-300 truncate">
              {description}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

CardItem.defaultProps = defaultProps;

export default CardItem;

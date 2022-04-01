import { useHistory } from 'react-router-dom';
import { FiMusic } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { togglePlay } from '../../store/player-slice';

import Skeleton from '../Skeleton/Skeleton';

import PlayButton from '../Button/PlayButton';
import { ucwords } from '../../utils/helpers';

import styles from './Card.module.css';

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
  const dispatch = useDispatch();
  const history = useHistory();
  const handleClick = (event: React.MouseEvent) => {
    if (!href) return;
    history.push(href);
  };
  const handleClickPlay = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!uri) return;
    dispatch(togglePlay({
      uris: [uri],
    }));
  };

  const LoadingComponent = (
    <div className={`${styles.cardItem} sm:bg-light-black sm:rounded-md py-4`}>
      <div className={styles.cardImage}>
        <Skeleton height="100%" />
      </div>
      <div className="px-2 sm:px-4 text-center sm:text-left mt-1 sm:mt-2">
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
          className={`${styles.cardItem} group cursor-pointer transition duration-300 ease-in-out transform sm:bg-light-black sm:hover:bg-light-black-2 sm:rounded-md py-4 ${className}`}
          onClick={handleClick}
        >
          <div className={styles.cardImage}>
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full sm:rounded-md min-h-full" />
            ) : (
              <div className="w-full h-full">
                <FiMusic className="w-full h-full p-8" />
              </div>
            )}
            <div className="hidden md:block opacity-0 absolute bottom-4 right-5 canhover:group-hover:opacity-100 transition duration-500 ease-in-out">
              <PlayButton
                className="h-12 w-12"
                onClick={onClickPlay ? onClickPlay : handleClickPlay}
              />
            </div>
          </div>
          <div className="px-2 sm:px-4 text-xxs sm:text-xs text-center sm:text-left font-bold mt-1 sm:mt-2">
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

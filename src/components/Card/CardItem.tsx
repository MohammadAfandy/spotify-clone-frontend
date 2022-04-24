import { useHistory } from 'react-router-dom';
import { FiMusic } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { decode } from 'html-entities';
import { togglePlay } from '../../store/player-slice';

import PlayButton from '../Button/PlayButton';

import styles from './Card.module.css';

type CardItemProps = {
  className?: string;
  name: string;
  image?: string;
  description?: string;
  onClickPlay?: (event: React.MouseEvent<SVGElement>) => void;
  uri?: string;
  href?: string;
};

const defaultProps: CardItemProps = {
  className: '',
  name: '',
  image: '',
  description: '',
  uri: '',
  href: '',
};

const CardItem: React.FC<CardItemProps> = ({
  className,
  name,
  image,
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

  return (
    <div
      className={`${styles.cardItem} group cursor-pointer transition duration-300 ease-in-out transform sm:bg-light-black sm:hover:bg-light-black-2 sm:rounded-md py-4 ${className}`}
      onClick={handleClick}
    >
      <div className={styles.cardImage}>
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full sm:rounded-md min-h-full"
            loading="lazy"
          />
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
          {decode(description) || <span>&nbsp;</span>}
        </div>
      </div>
    </div>
  );
};

CardItem.defaultProps = defaultProps;

export default CardItem;

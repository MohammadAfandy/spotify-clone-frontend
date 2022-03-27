import {
  MdAddCircle,
  MdCheckCircle,
  MdFavorite,
  MdFavoriteBorder,
} from 'react-icons/md';

export type LikeButtonProps = {
  className?: string;
  isActive?: boolean;
  type?: string;
  onClick?: (event: React.MouseEvent<SVGElement>) => void;
};

const defaultProps: LikeButtonProps = {
  isActive: false,
  type: 'track',
  className: '',
};

const LikeButton: React.FC<LikeButtonProps> = ({
  className,
  onClick,
  type,
  isActive,
}) => {
  let Prop;
  if (type === 'track') {
    Prop = isActive ? MdFavorite : MdFavoriteBorder;
  } else {
    Prop = isActive ? MdCheckCircle : MdAddCircle;
  }
  const color = isActive ? 'text-green-400' : '';
  return (
    <Prop
      className={`h-4 w-4 cursor-pointer transition duration-300 ease-in-out transform hover:scale-110 ${color} ${className}`}
      onClick={onClick}
      data-tip="like"
      data-for="login-tooltip"
      data-event="click"
    />
  );
};

LikeButton.defaultProps = defaultProps;

export default LikeButton;

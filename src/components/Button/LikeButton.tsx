import {
  MdFavorite,
  MdFavoriteBorder,
} from 'react-icons/md';

type LikeButtonProps = {
  className?: string;
  isActive?: boolean;
  onClick?: (event: React.MouseEvent<SVGElement>) => void;
};

const defaultProps: LikeButtonProps = {
  isActive: false,
  className: '',
};

const LikeButton: React.FC<LikeButtonProps> = ({
  className,
  onClick,
  isActive,
}) => {
  const Prop = isActive ? MdFavorite : MdFavoriteBorder;
  const color = isActive ? 'text-green-500' : '';
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

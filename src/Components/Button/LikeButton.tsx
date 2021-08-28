import { Heart } from 'react-feather';

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
  const colorProps = isActive
    ? {
        color: 'green',
        fill: 'green',
      }
    : {};
  return (
    <Heart
      className={`cursor-pointer transition duration-300 ease-in-out transform hover:scale-110  ${className}`}
      onClick={onClick}
      data-tip="like"
      data-for="login-tooltip"
      data-event="click"
      {...colorProps}
    />
  );
};

LikeButton.defaultProps = defaultProps;

export default LikeButton;

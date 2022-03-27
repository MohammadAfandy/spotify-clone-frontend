import {
  MdAddCircle,
  MdCheckCircle,
  MdFavorite,
  MdFavoriteBorder,
} from 'react-icons/md';
import { IconType } from 'react-icons/lib';
import ControlButton, { ControlButtonProps } from './ControlButton';

type LikeButtonProps = Omit<ControlButtonProps, 'Icon'> & {
  type?: string;
  Icon?: IconType;
};

const defaultProps: LikeButtonProps = {
  type: 'track',
  Icon: MdFavorite,
};

const LikeButton: React.FC<LikeButtonProps> = ({
  type,
  isActive,
  ...props
}) => {
  let Icon;
  if (type === 'track') {
    Icon = isActive ? MdFavorite : MdFavoriteBorder;
  } else {
    Icon = isActive ? MdCheckCircle : MdAddCircle;
  }
  return (
    <ControlButton
      {...props}
      isActive={isActive}
      Icon={Icon}
    />
  );
};

LikeButton.defaultProps = defaultProps;

export default LikeButton;

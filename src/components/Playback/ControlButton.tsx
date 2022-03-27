import { IconType, IconBaseProps } from 'react-icons';
import { LikeButtonProps } from '../Button/LikeButton';

type ControlButtonProps = {
  className?: string;
  Icon: IconType | React.FC<LikeButtonProps>;
  onClick?: (event: React.MouseEvent<SVGElement>) => void;
  sizeType?: 'mini' | 'full';
};

const ControlButton: React.FC<ControlButtonProps & IconBaseProps & LikeButtonProps> = ({
  className,
  Icon,
  onClick,
  sizeType,
  ...props
}) => {
  let classSize = '';
  if (sizeType === 'full') {
    classSize = 'h-7 w-7';
  } else {
    classSize = 'h-6 w-6 sm:h-5 sm:w-5';
  }

  return (
    <Icon
      className={`${classSize} cursor-pointer ${className}`}
      onClick={onClick}
      {...props}
    />
  )
};

export default ControlButton;

import { overrideTailwindClasses } from 'tailwind-override';
import { IconType, IconBaseProps } from 'react-icons/lib';

export type ControlButtonProps = {
  className?: string;
  Icon: IconType;
  onClick?: (event: React.MouseEvent<SVGElement>) => void;
  sizeType?: 'mini' | 'full';
  isActive?: boolean;
  disabled?: boolean;
};

const ControlButton: React.FC<ControlButtonProps & IconBaseProps> = ({
  className,
  Icon,
  onClick,
  sizeType,
  isActive,
  disabled,
  ...props
}) => {
  let classSize = '';
  if (sizeType === 'full') {
    classSize = 'h-7 w-7';
  } else {
    classSize = 'h-6 w-6 sm:h-5 sm:w-5';
  }

  let classOpacity = isActive ? 'text-green-400' : 'canhover:opacity-70';

  return (
    <Icon
      className={
        overrideTailwindClasses(`${classSize} ${classOpacity} transition duration-300 ease-in-out transform canhover:hover:opacity-100 canhover:hover:scale-110 cursor-pointer ${className}`)
      }
      onClick={!disabled ? onClick : undefined}
      {...props}
    />
  )
};

export default ControlButton;

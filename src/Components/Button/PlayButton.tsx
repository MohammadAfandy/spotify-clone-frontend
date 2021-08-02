import { Play, Pause } from 'react-feather';

type PlayButtonProps = {
  isPlaying?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<SVGElement>) => void;
};

const defaultProps: PlayButtonProps = {
  isPlaying: false,
  className: '',
};

const PlayButton: React.FC<PlayButtonProps> = ({
  className,
  onClick,
  isPlaying,
}) => {
  const Prop = isPlaying ? Pause : Play;
  return (
    <Prop
      className={`bg-green-500 rounded-full p-3 cursor-pointer transition duration-300 ease-in-out transform hover:scale-110 ${className}`}
      onClick={onClick}
      fill="#fff"
    />
  );
};

PlayButton.defaultProps = defaultProps;

export default PlayButton;

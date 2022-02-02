import {
  MdPlayArrow,
  MdPause,
} from 'react-icons/md';

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
  const Prop = isPlaying ? MdPause : MdPlayArrow;
  return (
    <Prop
      className={`bg-green-500 rounded-full p-2 cursor-pointer transition duration-300 ease-in-out transform hover:scale-110 ${className}`}
      onClick={onClick}
      fill="#fff"
      data-tip="play"
      data-for="login-tooltip"
      data-event="click"
    />
  );
};

PlayButton.defaultProps = defaultProps;

export default PlayButton;

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { togglePlay } from '../../store/player-slice';

type TimeStampProps = {
  className?: string;
  uri: string;
  miliseconds: number;
  afterClick?: () => void;
};

const defaultProps: TimeStampProps = {
  className: '',
  uri: '',
  miliseconds: 0,
  afterClick: () => {},
};

const TimeStamp: React.FC<TimeStampProps> = ({
  className,
  children,
  uri,
  miliseconds,
  afterClick,
}) => {
  const dispatch = useDispatch();

  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);

  const handleClick = () => {
    if (uri === currentTrack.uri) {
      dispatch(togglePlay({
        positionMs: miliseconds,
      }));
    } else {
      dispatch(togglePlay({
        uris: [uri],
        offset: 0,
        positionMs: miliseconds,
      }));
    }
    if (afterClick) afterClick();
  }

  return (
    <span
      className={`font-semibold underline text-blue-400 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {children}
    </span>
  );
};

TimeStamp.defaultProps = defaultProps;

export default TimeStamp;

import ReactToolTip, { Place } from 'react-tooltip';
import { BACKEND_URI } from '../../utils/constants';

import Button from '../Button/Button';

type ToolTipProps = {
  className?: string;
  id: string;
  place: Place;
  disable?: boolean;
  isCapture?: boolean;
  backgroundColor: string;
};

const defaultProps: ToolTipProps = {
  className: '',
  id: '',
  place: 'bottom',
  disable: false,
  isCapture: false,
  backgroundColor: '',
};

const ToolTip: React.FC<ToolTipProps> = ({
  className,
  id,
  place,
  disable,
  isCapture,
  backgroundColor,
}) => {

  const handleLogin = () => {
    window.location.href = BACKEND_URI + '/login';
  };

  return (
    <ReactToolTip
      className={className}
      id={id}
      disable={disable}
      place={place}
      backgroundColor={backgroundColor}
      getContent={(dataTip) => {
        ReactToolTip.rebuild();
        let title = '';
        let tip = '';
        switch (dataTip) {
          case 'create-playlist': {
            title = 'Create a playlist';
            tip = 'Log in to create and share playlists.';
            break;
          }
          case 'collection': {
            title = 'Enjoy your Liked Songs / Episodes';
            tip = 'Log in to see all the songs and episodes you\'ve liked in one easy playlist.';
            break;
          }
          case 'library': {
            title = 'Enjoy Your Library';
            tip = 'Log in to see saved songs, podcasts, artists, and playlists in Your Library.';
            break;
          }
          case 'play': {
            title = 'Log in to listen';
            tip = 'Due to limitations in the spotify playback api, log in to your PREMIUM account to listen';
            break;
          }
          case 'like': {
            title = 'You’re logged out';
            tip = 'Log in to add this to your Liked Songs, Episodes, and Playlists.';
            break;
          }
          case 'follow': {
            title = 'You’re logged out';
            tip = 'Log in to follow this albums, artists, and shows';
            break;
          }
          default: {
            return null;
          }
        }
        return (
          <div className="w-80">
            <div className="mb-4">
              <div className="text-xl font-bold mb-2">{title}</div>
              <div className="text-sm">{tip}</div>
            </div>
            <div className="flex justify-end">
              <Button text="Sign In" onClick={handleLogin} fill="green" />
            </div>
          </div>
        );
      }}
      clickable
      effect="solid"
      globalEventOff="click"
      isCapture={isCapture}
    />
  );
};

ToolTip.defaultProps = defaultProps;

export default ToolTip;

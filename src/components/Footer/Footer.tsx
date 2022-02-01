import { useContext } from 'react';
import { AuthContext } from '../../context/auth-context';
import BannerWrapper from '../Banner/BannerWrapper';

import Button from '../Button/Button';
import WebPlayback from '../Playback/WebPlayback';

const Footer: React.FC = ({ children }) => {

  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div className="fixed bottom-0 w-full h-20 z-30">
      {isLoggedIn ? (
          <WebPlayback />
      ) : (
        <BannerWrapper>
          <div className="flex-grow text-justify text-xs md:text-sm">
            This web player is intended for educational purpose only. All data
            including image, song, logo, etc belong to their respective
            copyright owners. Currently you need premium account for better
            experience in using this app. To visit the official app, please go
            to{' '}
            <a
              className="underline"
              href="https://open.spotify.com"
              target="_blank"
              rel="noreferrer"
            >
              open.spotify.com
            </a>
            .
          </div>
          <div className="sm:block hidden flex-none ml-8">
            <Button
              className="w-full h-10 font-bold text-lg"
              onClick={() =>
                window.open('https://spotify.com/signup', '_blank')
              }
              text="Sign Up Free"
            />
          </div>
        </BannerWrapper>
      )}
    </div>
  );
};

export default Footer;

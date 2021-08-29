import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import PlayerProvider from '../context/player-context';

import Navbar from '../Components/Navbar/Navbar';
import ToolBar from '../Components/Toolbar/ToolBar';
import MainContent from '../Components/MainContent/MainContent';
import Player from '../Components/Player/Player';
import Button from '../Components/Button/Button';
import ToolTip from '../Components/ToolTip/ToolTip';

const MainPage: React.FC = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <PlayerProvider>
      <div className="flex">
        <div
          className="flex w-full"
          style={{ height: 'calc(100vh - 6rem)' }}
        >
          <Navbar />
          <ToolBar />
          <MainContent />
        </div>
        <div className="fixed bottom-0 w-full h-24 ">
          {isLoggedIn ? (
            <Player />
          ) : (
            <div className="bg-banner-gradient h-full flex justify-center items-center p-10">
              <div className="sm:block hidden flex-grow text-justify text-sm mr-8">
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
              </div>
              <div className="flex-none">
                <Button
                  className="w-full h-10 font-bold text-lg"
                  onClick={() =>
                    window.open('https://spotify.com/signup', '_blank')
                  }
                  text="Sign Up Free"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <ToolTip
        id="login-tooltip"
        place="bottom"
        disable={isLoggedIn}
        isCapture={isLoggedIn}
        backgroundColor="#2e77d0"
      />
    </PlayerProvider>
  );
};

export default MainPage;

import { useContext, useState } from 'react';
import { AuthContext } from '../context/auth-context';
import PlayerProvider from '../context/player-context';

import Navbar from '../components/Navbar/Navbar';
import ToolBar from '../components/Toolbar/ToolBar';
import MainContent from '../components/MainContent/MainContent';
import ToolTip from '../components/ToolTip/ToolTip';
import Footer from '../components/Footer/Footer';

const MainPage: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { isLoggedIn } = useContext(AuthContext);

  const handleIsNavOpen = (state: boolean) => {
    setIsNavOpen(state);
  };

  const getOverlayClass = () => {
    let overlayClass = 'fixed top-0 left-0 h-full w-full -z-1 opacity-0';
    if (isNavOpen) {
      overlayClass = 'fixed top-0 left-0 h-full w-full z-10 opacity-100';
    }
    return overlayClass;
  };

  return (
    <PlayerProvider>
      <div className="flex">
        <div
          className="flex w-full content-area"
        >
          <Navbar isNavOpen={isNavOpen} handleIsNavOpen={handleIsNavOpen} />
          <ToolBar isNavOpen={isNavOpen} handleIsNavOpen={handleIsNavOpen} />
          <MainContent />
          <Footer />
        </div>
      </div>
      <ToolTip
        id="login-tooltip"
        disable={isLoggedIn}
        isCapture={isLoggedIn}
        backgroundColor="#2e77d0"
      />
      <div
        className={getOverlayClass()}
        onClick={() => setIsNavOpen(false)}
      >
      </div>
    </PlayerProvider>
  );
};

export default MainPage;

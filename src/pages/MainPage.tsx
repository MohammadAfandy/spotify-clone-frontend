import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';

import Navbar from '../components/Navbar/Navbar';
import ToolBar from '../components/Toolbar/ToolBar';
import MainContent from '../components/MainContent/MainContent';
import ToolTip from '../components/ToolTip/ToolTip';
import Footer from '../components/Footer/Footer';
import Toast from '../components/Toast/Toast';

const MainPage: React.FC = () => {
  const { isLoggedIn, isPremium } = useContext(AuthContext);

  return (
    <>
      <div className="flex">
        <div
          className="flex w-full content-area"
        >
          <Navbar />
          <ToolBar />
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
      <ToolTip
        id="play-tooltip"
        disable={isPremium}
        isCapture={isPremium}
        backgroundColor="#2e77d0"
      />
      <Toast />
    </>
  );
};

export default MainPage;

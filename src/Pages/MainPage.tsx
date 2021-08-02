import { Fragment, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import PlayerProvider from '../context/player-context';
import { getHashValue } from '../utils/helpers';

import Navbar from '../Components/Navbar/Navbar';
import ToolBar from '../Components/Toolbar/ToolBar';
import MainContent from '../Components/MainContent/MainContent';
import Player from '../Components/Player/Player';

const MainPage: React.FC = () => {
  const {
    isLoggedIn,
  } = useContext(AuthContext);
  const { access_token } = getHashValue();

  return (
    <Fragment>
      {(isLoggedIn || access_token) ? (
        <PlayerProvider>
          <div className="flex">
            <div className="flex w-full" style={{ height: 'calc(100vh - 6rem)' }}>
              <Navbar />
              <ToolBar />
              <MainContent />
            </div>
            <div className="fixed bottom-0 w-full">
              <Player />
            </div>
          </div>
        </PlayerProvider>
      ) : (
        <Redirect push to="/login" />
      )}
    </Fragment>
  )
}

export default MainPage;

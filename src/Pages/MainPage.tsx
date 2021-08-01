import { Fragment, useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';

import LoginPage from '../Pages/LoginPage';
import Navbar from '../Components/Navbar/Navbar';
import ToolBar from '../Components/Toolbar/ToolBar';
import MainContent from '../Components/MainContent/MainContent';
import Player from '../Components/Player/Player';
import PlayerProvider from '../context/player-context';

const MainPage: React.FC = () => {
  const { isLoggedIn } = useContext(AuthContext);
  return (
    <Fragment>
      <Route path="/login" exact>
        <LoginPage />
      </Route>
      {isLoggedIn ? (
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
        <Redirect to="/login" />
      )}
    </Fragment>
  )
}

export default MainPage;

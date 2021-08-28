import { useState, useEffect, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { BACKEND_URI } from '../../utils/constants';
import { AuthContext } from '../../context/auth-context';

import Button from '../Button/Button';
import SearchInput from '../Input/SearchInput';
import ToolBarItem from './ToolBarItem';

const ToolBar: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isToolbarLinkActive, setIsToolbarLinkActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        const [, , , type] = location.pathname.split('/');
        history.replace('/search/' + searchQuery + (type ? '/' + type : ''));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, history, location.pathname]);

  useEffect(() => {
    setSearchQuery('');
    setIsSearchActive(false);
    setIsToolbarLinkActive(false);

    if (location.pathname.startsWith('/search')) {
      setIsSearchActive(true);
      const [, , query] = location.pathname.split('/');
      if (query) {
        setSearchQuery(query);
      }
    }

    const toolbarLinks = [
      '/collection/playlists',
      '/collection/podcasts',
      '/collection/artists',
      '/collection/albums',
    ];
    if (toolbarLinks.includes(location.pathname)) {
      setIsToolbarLinkActive(true);
    }
  }, [location.pathname]);

  const handleGoBack = () => {
    history.goBack();
  };

  const handleGoForward = () => {
    history.goForward();
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleLogin = () => {
    window.location.href = BACKEND_URI + '/login';
  };

  return (
    <div className="fixed flex box-shadow w-auto items-center left-52 right-0 top-0 px-4 py-2 z-50">
      <div className="flex items-center mr-auto">
        <div
          className={`mr-4 bg-black rounded-full bg-opacity-60 p-1 cursor-pointer ${''}`}
          onClick={handleGoBack}
        >
          <ChevronLeft />
        </div>
        <div
          className={`mr-4 bg-black rounded-full bg-opacity-60 p-1 cursor-pointer ${''}`}
          onClick={handleGoForward}
        >
          <ChevronRight />
        </div>
        {isSearchActive && (
          <SearchInput
            placeholder="Artists, songs, or podcasts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
        {isToolbarLinkActive && (
          <>
            <ToolBarItem to="/collection/playlists" text="Playlists" />
            <ToolBarItem to="/collection/podcasts" text="Podcasts" />
            <ToolBarItem to="/collection/artists" text="Artists" />
            <ToolBarItem to="/collection/albums" text="Albums" />
          </>
        )}
      </div>
      <div className="flex items-center">
        {isLoggedIn ? (
          <>
            <span className="mr-4">{user.display_name}</span>
            <Button onClick={handleLogout} text="Logout" color="red" />
          </>
        ) : (
          <Button onClick={handleLogin} text="Login" fill="green" />
        )}
      </div>
    </div>
  );
};

export default ToolBar;

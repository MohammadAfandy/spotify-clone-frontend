import { useState, useEffect, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  MdChevronLeft,
  MdChevronRight,
  MdPerson,
} from 'react-icons/md';
import { FiExternalLink, FiMenu } from 'react-icons/fi';
import { BACKEND_URI } from '../../utils/constants';
import { AuthContext } from '../../context/auth-context';
import useComponentVisible from '../../hooks/useComponentVisible';

import Button from '../Button/Button';
import SearchInput from '../Input/SearchInput';
import ToolBarItem from './ToolBarItem';
import MenuList from '../Menu/MenuList';
import { ucwords } from '../../utils/helpers';

type ToolbarProps = {
  isNavOpen: boolean;
  handleIsNavOpen: (state: boolean) => void;
};

const ToolBar: React.FC<ToolbarProps> = ({ isNavOpen, handleIsNavOpen }) => {
  const history = useHistory();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useContext(AuthContext);

  const [userDropDownRef, userDropDownVisible, setUserDropDownVisible] = useComponentVisible(false);
  const [libraryDropDownRef, libraryDropDownVisible, setLibraryDropDownVisible] = useComponentVisible(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isToolbarLinkActive, setIsToolbarLinkActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        const [, , , type] = location.pathname.split('/');
        history.replace('/search/' + searchQuery + (type ? '/' + type : ''));
      } else {
        if (location.pathname.startsWith('/search')) {
          history.replace('/search');
        }
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
    <div className="fixed flex w-auto items-center justify-between bg-black bg-opacity-50 left-0 sm:left-52 right-0 top-0 px-4 py-2 h-16 z-10">
      <div className="flex sm:hidden items-center">
        <FiMenu
          className="h-6 w-6 cursor-pointer"
          onClick={() => handleIsNavOpen(true)}
        />
      </div>
      <div className="flex items-center w-full">
        <div
          className={`bg-black bg-opacity-70 rounded-full p-1 cursor-pointer ml-4`}
          onClick={handleGoBack}
        >
          <MdChevronLeft className="w-6 h-6" />
        </div>
        <div
          className={`bg-black bg-opacity-70 rounded-full p-1 cursor-pointer ml-4 ${isSearchActive || isToolbarLinkActive ? 'hidden sm:block' : ''}`}
          onClick={handleGoForward}
        >
          <MdChevronRight className="w-6 h-6" />
        </div>
        <div className="w-full mx-4 text-sm">
          {isSearchActive && (
            <SearchInput
              className="w-full lg:w-96"
              placeholder="Artists, songs, or podcasts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClearValue={(e) => setSearchQuery('')}
            />
          )}
          {isToolbarLinkActive && (
            <>
              <div className="hidden lg:flex">
                <ToolBarItem to="/collection/playlists" text="Playlists" />
                <ToolBarItem to="/collection/podcasts" text="Podcasts" />
                <ToolBarItem to="/collection/artists" text="Artists" />
                <ToolBarItem to="/collection/albums" text="Albums" />
              </div>
              <MenuList
                className="inline-block lg:hidden mx-2 w-full"
                ref={libraryDropDownRef}
                text={ucwords(location.pathname.split('/')[2])}
                isVisible={libraryDropDownVisible}
                handleVisible={setLibraryDropDownVisible}
              >
                <ToolBarItem to="/collection/playlists" text="Playlists" onClick={() => setLibraryDropDownVisible(false)} />
                <ToolBarItem to="/collection/podcasts" text="Podcasts" onClick={() => setLibraryDropDownVisible(false)} />
                <ToolBarItem to="/collection/artists" text="Artists" onClick={() => setLibraryDropDownVisible(false)} />
                <ToolBarItem to="/collection/albums" text="Albums" onClick={() => setLibraryDropDownVisible(false)} />
              </MenuList>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {isLoggedIn ? (
          <MenuList
            ref={userDropDownRef}
            text={user.display_name}
            isVisible={userDropDownVisible}
            handleVisible={setUserDropDownVisible}
            Icon={<MdPerson className="w-4 h-4" />}
            childPosition="right"
          >
            <a
              className="flex justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-500"
              href="https://www.spotify.com/id/account/overview/"
              target="_blank"
              rel="noreferrer"
            >
              Account
              <FiExternalLink className="w-4 h-4" />
            </a>
            {/* profile page stil in progress */}
            {/* <div className="flex justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-500">
              Profile
            </div> */}
            <div
              className="flex justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-500"
              onClick={handleLogout}
            >
              Logout
            </div>
          </MenuList>
        ) : (
          <Button onClick={handleLogin} text="Login" fill="green" />
        )}
      </div>
    </div>
  );
};

export default ToolBar;

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
    <div className="fixed flex w-auto items-center justify-between bg-black bg-opacity-50 left-0 sm:left-52 right-0 top-0 px-4 py-2 h-16 z-10">
      <div className="flex sm:hidden items-center">
        <FiMenu
          className="h-6 w-6 cursor-pointer"
          onClick={() => handleIsNavOpen(true)}
        />
      </div>
      <div className="flex items-center">
        <div
          className={`mr-4 bg-black bg-opacity-70 rounded-full p-1 cursor-pointer hidden sm:block`}
          onClick={handleGoBack}
        >
          <MdChevronLeft className="w-6 h-6" />
        </div>
        <div
          className={`mr-4 bg-black bg-opacity-70 rounded-full p-1 cursor-pointer hidden sm:block`}
          onClick={handleGoForward}
        >
          <MdChevronRight className="w-6 h-6" />
        </div>
        {isSearchActive && (
          <SearchInput
            className="w-full md:w-80 mx-2 text-sm"
            placeholder="Artists, songs, or podcasts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              className="inline-block lg:hidden w-48 mx-2"
              ref={libraryDropDownRef}
              text="Library"
              isVisible={libraryDropDownVisible}
              handleVisible={setLibraryDropDownVisible}
            >
              <ToolBarItem to="/collection/playlists" text="Playlists" />
              <ToolBarItem to="/collection/podcasts" text="Podcasts" />
              <ToolBarItem to="/collection/artists" text="Artists" />
              <ToolBarItem to="/collection/albums" text="Albums" />
            </MenuList>
          </>
        )}
      </div>
      <div className="flex items-center">
        {isLoggedIn ? (
          <MenuList
            ref={userDropDownRef}
            text={user.display_name}
            isVisible={userDropDownVisible}
            handleVisible={setUserDropDownVisible}
            Icon={<MdPerson className="w-4 h-4" />}
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

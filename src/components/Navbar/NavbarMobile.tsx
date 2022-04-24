import { useContext } from 'react';
import {
  MdHomeFilled,
  MdSearch,
  MdLibraryMusic,
} from 'react-icons/md';
import { AuthContext } from '../../context/auth-context';
import { SPOTIFY_ICON_WHITE } from '../../utils/constants';
import { isActiveRoute } from '../../utils/helpers';
import NavbarMobileItem from './NavbarMobileItem';

type NavbarMobileProps = {
  className?: string;
};

const NavbarMobile: React.FC<NavbarMobileProps> = ({
  className,
}) => {
  const {
    isLoggedIn,
  } = useContext(AuthContext);

  return (
    <nav className="flex justify-around items-center w-full h-full py-1">
      <NavbarMobileItem
        to="/"
        Icon={MdHomeFilled}
        text="Home"
        exact
        isActive={isActiveRoute('home')}
      />
      <NavbarMobileItem
        to="/search"
        Icon={MdSearch}
        text="Search"
        isActive={isActiveRoute('search')}
      />
      <div
        className="h-full"
        data-tip="library"
        data-for="login-tooltip"
        data-event="click"
        data-place="top"
      >
        <NavbarMobileItem
          to={isLoggedIn ? '/collection/playlists' : ''}
          Icon={MdLibraryMusic}
          text="Your Library"
          isActive={isActiveRoute('library')}
        />
      </div>
      <NavbarMobileItem
        to="/get-app"
        image={SPOTIFY_ICON_WHITE}
        text="Get App"
      />
    </nav>
  );
};

export default NavbarMobile;

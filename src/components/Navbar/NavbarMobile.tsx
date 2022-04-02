import { useContext } from 'react';
import {
  MdHomeFilled,
  MdSearch,
  MdLibraryMusic,
} from 'react-icons/md';
import { AuthContext } from '../../context/auth-context';
import { SPOTIFY_LOGO_WHITE } from '../../utils/constants';
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
      />
      <NavbarMobileItem
        to="/search"
        Icon={MdSearch}
        text="Search"
      />
      <div
        className="h-full"
        data-tip="library"
        data-for="login-tooltip"
        data-event="click"
        data-place="top"
      >
        <NavbarMobileItem
          to={isLoggedIn ? "/collection/playlists" : undefined}
          Icon={MdLibraryMusic}
          text="Your Library"
        />
      </div>
      <NavbarMobileItem
        to="/get-app"
        image={SPOTIFY_LOGO_WHITE}
        text="Get App"
      />
    </nav>
  );
};

export default NavbarMobile;

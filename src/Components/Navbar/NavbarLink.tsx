import { NavLink } from 'react-router-dom';

import NavbarItem from './NavbarItem';

import styles from './Navbar.module.css';

type NavbarLinkProps = {
  to: string,
  Icon?: React.ReactNode,
  image?: string,
  text: string,
  editable?: boolean,
  onClick?: () => void,
  onClickEdit?: (e: React.MouseEvent) => void,
};

const defaultProps: NavbarLinkProps = {
  to: '',
  text: '',
  editable: false,
};

const NavbarLink: React.FC<NavbarLinkProps> = ({ to, Icon, text, image, editable, onClickEdit }) => {
  return (
    <NavLink
      to={to}
      activeClassName={styles.activeLink}
      exact
    >
      <NavbarItem
        Icon={Icon}
        text={text}
        image={image}
        editable={editable}
        onClickEdit={onClickEdit}
      />
    </NavLink>
  );
};

NavbarLink.defaultProps = defaultProps;

export default NavbarLink;

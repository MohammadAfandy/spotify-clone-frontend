import { NavLink, NavLinkProps } from 'react-router-dom';

import NavbarItem from './NavbarItem';

import styles from './Navbar.module.css';

type NavbarLinkProps = {
  Icon?: React.ReactNode;
  image?: string;
  text: string;
  editable?: boolean;
  onClick?: () => void;
  onClickEdit?: (e: React.MouseEvent) => void;
} & NavLinkProps;

const defaultProps: NavbarLinkProps = {
  to: '',
  text: '',
  editable: false,
};

const NavbarLink: React.FC<NavbarLinkProps> = ({
  Icon,
  text,
  image,
  editable,
  onClick,
  onClickEdit,
  ...rest
}) => {
  return (
    <NavLink
      activeClassName={styles.activeLink}
      {...rest}
    >
      <NavbarItem
        Icon={Icon}
        text={text}
        image={image}
        editable={editable}
        onClick={onClick}
        onClickEdit={onClickEdit}
      />
    </NavLink>
  );
};

NavbarLink.defaultProps = defaultProps;

export default NavbarLink;

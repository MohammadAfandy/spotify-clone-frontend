import { NavLink, NavLinkProps } from 'react-router-dom';
import { IconType } from 'react-icons/lib';

import styles from './Navbar.module.css';

type NavbarMobileItemProps = {
  Icon?: IconType;
  image?: string;
  text: string;
  isExternal?: boolean;
} & NavLinkProps;

const defaultProps: NavbarMobileItemProps = {
  to: '',
  text: '',
  Icon: undefined,
  image: '',
  isExternal: false,
};

const NavbarMobileItem: React.FC<NavbarMobileItemProps> = ({
  to,
  Icon,
  text,
  image,
  isExternal,
  ...rest
}) => {
  const newTabProps = isExternal ? {
    target: '_blank',
    rel: 'noopener noreferrer',
  } : {};
  return (
    <>
      {to !== '' ? (
        <NavLink
          to={to}
          className="flex flex-col h-full justify-around items-center px-4 opacity-50"
          activeClassName={styles.activeLinkMobile}
          {...rest}
          {...newTabProps}
        >
          {Icon
            ? <Icon className="w-7 h-7" />
            : <img src={image} alt={text} className="w-7 h-7 rounded-sm" />
          }
          <span className="text-xs">{text}</span>
        </NavLink>
      ) : (
        <div className="flex flex-col h-full justify-around items-center px-4">
          {Icon && <Icon className="w-7 h-7" />}
          <span className="text-xs">{text}</span>
        </div>
      )}
    </>
  );
};

NavbarMobileItem.defaultProps = defaultProps;

export default NavbarMobileItem;

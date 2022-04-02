import { NavLink } from 'react-router-dom';
import { IconType } from 'react-icons/lib';

type NavbarMobileItemProps = {
  to?: string;
  Icon?: IconType;
  image?: string;
  text: string;
  isExternal?: boolean;
};

const defaultProps: NavbarMobileItemProps = {
  to: undefined,
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
}) => {
  const newTabProps = isExternal ? {
    target: '_blank',
    rel: 'noopener noreferrer',
  } : {};
  return (
    <>
      {to !== undefined ? (
        <NavLink
          to={to}
          className="flex flex-col h-full justify-around items-center"
          {...newTabProps}
        >
          {Icon
            ? <Icon className="w-7 h-7" />
            : <img src={image} alt={text} className="w-7 h-7 rounded-sm" />
          }
          <span className="text-xs">{text}</span>
        </NavLink>
      ) : (
        <div className="flex flex-col h-full justify-around items-center">
          {Icon && <Icon className="w-7 h-7" />}
          <span className="text-xs">{text}</span>
        </div>
      )}
    </>
  );
};

NavbarMobileItem.defaultProps = defaultProps;

export default NavbarMobileItem;

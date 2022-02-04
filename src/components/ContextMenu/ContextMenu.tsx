import {
  Menu,
  MenuProps,
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

const ContextMenu: React.FC<MenuProps> = ({
  children,
  ...props
}) => {

  return (
    <Menu
      transition
      {...props}
    >
      {children}
    </Menu>
  );
};

export default ContextMenu;

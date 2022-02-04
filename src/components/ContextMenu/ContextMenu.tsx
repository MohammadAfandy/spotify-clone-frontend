import {
  Menu,
  MenuProps,
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

import styles from './ContextMenu.module.css';

const ContextMenu: React.FC<MenuProps> = ({
  children,
  ...props
}) => {

  return (
    <Menu
      transition
      menuClassName={styles.contextMenu}
      {...props}
    >
      {children}
    </Menu>
  );
};

export default ContextMenu;

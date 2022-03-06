import {
  applyStatics,
  MenuItem,
  MenuItemProps,
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

import styles from './ContextMenu.module.css';

const ContextMenuItem: React.FC<MenuItemProps> = ({
  children,
  ...props
}) => {

  return (
    <MenuItem
      className={({ hover }) => (hover ? styles.contextMenuHover : styles.contextMenu)}
      {...props}
    >
      {children}
    </MenuItem>
  );
};

applyStatics(MenuItem)(ContextMenuItem);

export default ContextMenuItem;

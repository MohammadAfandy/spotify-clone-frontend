import {
  applyStatics,
  SubMenu,
  SubMenuProps,
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

import styles from './ContextMenu.module.css';

const ContextSubMenu: React.FC<SubMenuProps> = ({
  children,
  ...props
}) => {

  return (
    <SubMenu
      menuClassName={styles.contextMenu}
      itemProps={{
        className: ({ hover }) => (hover ? styles.contextMenuHover : styles.contextMenu),
      }}
      {...props}
    >
      {children}
    </SubMenu>
  );
};

applyStatics(SubMenu)(ContextSubMenu);

export default ContextSubMenu;

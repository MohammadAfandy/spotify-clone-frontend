import { NavLink } from 'react-router-dom';

import styles from './Toolbar.module.css';

type ToolBarItemProps = {
  to: string;
  text: string;
};

const ToolBarItem: React.FC<ToolBarItemProps> = ({ to, text }) => {
  return (
    <NavLink to={to} activeClassName={styles.activeToolbarLink}>
      <li className="flex mr-2 px-4 py-1 rounded-md cursor-pointer">{text}</li>
    </NavLink>
  );
};

export default ToolBarItem;

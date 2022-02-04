import { NavLink } from 'react-router-dom';

import styles from './Toolbar.module.css';

type ToolBarItemProps = {
  to: string;
  text: string;
  onClick?: (event: React.MouseEvent) => void;
};

const ToolBarItem: React.FC<ToolBarItemProps> = ({ to, text, onClick }) => {
  return (
    <NavLink to={to} activeClassName={styles.activeToolbarLink} onClick={onClick}>
      <li className="flex sm:mr-2 px-4 py-2 sm:rounded-md cursor-pointer justify-center">{text}</li>
    </NavLink>
  );
};

export default ToolBarItem;

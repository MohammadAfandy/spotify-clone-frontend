import { MdExpandMore } from 'react-icons/md';
import styles from './FullScreen.module.css';

type FullScreenProps = {
  isOpen: boolean;
  handleCloseScreen: () => void;
};

const FullScreen: React.FC<FullScreenProps> = ({
  children,
  isOpen,
  handleCloseScreen,
}) => {

  return (
    <div className={`${styles.fullScreen} ${isOpen ? styles.open : ''}`}>
      <div className="absolute right-6 top-2">
        <MdExpandMore
          className="h-8 w-8 cursor-pointer"
          onClick={handleCloseScreen}
        />
      </div>
      {children}
    </div>
  );
};

export default FullScreen;

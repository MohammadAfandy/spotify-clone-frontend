import styles from './Loader.module.css';

type LoaderProps = {
  className?: string;
};

const Loader: React.FC<LoaderProps> = ({
  className,
}) => {
  return (
    <div className={`${styles.loader} ease-linear rounded-full border-8 h-20 w-20 ${className}`}>
    </div>
  );
};

export default Loader;

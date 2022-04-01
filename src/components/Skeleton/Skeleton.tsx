import styles from './Skeleton.module.css';

type SkeletonProps = {
  height?: string | number;
  width?: string | number;
};

const defaultProps: SkeletonProps = {
  height: '1rem',
  width: '100%',
};

const Skeleton: React.FC<SkeletonProps> = ({
  height,
  width,
}) => {

  return (
    <div className={styles.skeleton} style={{ height, width }}/>
  )
};

Skeleton.defaultProps = defaultProps;

export default Skeleton;

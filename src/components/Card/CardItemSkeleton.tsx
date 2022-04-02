import Skeleton from '../Skeleton/Skeleton';

import styles from './Card.module.css';

type CardItemSkeletonProps = {
  className?: string;
};

const defaultProps: CardItemSkeletonProps = {
  className: '',
};

const CardItemSkeleton: React.FC<CardItemSkeletonProps> = ({
  className,
}) => {

  return (
    <div className={`${styles.cardItem} sm:bg-light-black sm:rounded-md py-4 ${className}`}>
      <div className={styles.cardImage}>
        <Skeleton height="100%" />
      </div>
      <div className="px-2 sm:px-4 text-center sm:text-left mt-1 sm:mt-2">
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  );
};

CardItemSkeleton.defaultProps = defaultProps;

export default CardItemSkeleton;

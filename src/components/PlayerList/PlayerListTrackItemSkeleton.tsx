import Skeleton from '../Skeleton/Skeleton';

type PlayerListTrackItemSkeletonProps = {
  className?: string;
};

const defaultProps: PlayerListTrackItemSkeletonProps = {
  className: '',
};

const PlayerListTrackItemSkeleton: React.FC<PlayerListTrackItemSkeletonProps> = ({
  className,
}) => {
  return (
    <div className={`rounded-md px-2 ${className}`} data-wrapper>
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
  );
};

PlayerListTrackItemSkeleton.defaultProps = defaultProps;

export default PlayerListTrackItemSkeleton;

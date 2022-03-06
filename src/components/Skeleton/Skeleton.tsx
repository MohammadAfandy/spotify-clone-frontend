import ReactSkeleton, { SkeletonProps } from 'react-loading-skeleton';

const Skeleton: React.FC<SkeletonProps & {
  type?: 'dark' | 'light';
}> = ({
  className,
  type = 'dark',
  ...props
}) => {

  return (
    <ReactSkeleton
      className={`${className}`}
      style={type === 'dark' ? ({
        backgroundColor: '#202020',
        backgroundImage: 'linear-gradient(90deg, #202020, #444, #202020)',
      }) : ({
        backgroundColor: 'rgba(255,255,255, .3)',
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,.3), #eee, rgba(255,255,255,.3))',
      })}
      {...props}
    />
  )
};

export default Skeleton;

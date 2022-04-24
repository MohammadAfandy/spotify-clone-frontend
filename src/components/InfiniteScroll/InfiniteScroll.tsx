import ReactInfiniteScroll, { Props } from 'react-infinite-scroll-component';

type InfiniteScrollProps = Omit<Props, 'loader'> & {
  loader?: React.ReactNode;
};

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  loader = false,
  ...rest
}) => {
  return (
    <ReactInfiniteScroll
      loader={loader}
      scrollableTarget="main-container"
      style={{ overflow: 'unset' }}
      {...rest}
    >
      {children}
    </ReactInfiniteScroll>
  )
};

export default InfiniteScroll;

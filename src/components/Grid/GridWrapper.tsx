type GridWrapperProps = {
  className?: string;
};

const defaultProps: GridWrapperProps = {
  className: '',
};

const GridWrapper: React.FC<GridWrapperProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={`grid-wrapper grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-4 auto-rows-auto ${className}`}
    >
      {children}
    </div>
  )
};

GridWrapper.defaultProps = defaultProps;

export default GridWrapper;

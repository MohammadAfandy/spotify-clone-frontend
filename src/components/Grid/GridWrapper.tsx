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
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${className}`}
    >
      {children}
    </div>
  )
};

GridWrapper.defaultProps = defaultProps;

export default GridWrapper;

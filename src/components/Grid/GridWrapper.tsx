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
      className={`grid-wrapper ${className}`}
    >
      {children}
    </div>
  )
};

GridWrapper.defaultProps = defaultProps;

export default GridWrapper;

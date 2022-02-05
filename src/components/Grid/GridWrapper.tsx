type GridWrapperProps = {
  className?: string;
};

const GridWrapper: React.FC<GridWrapperProps> = ({
  children,
  className
}) => {

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  );
};

export default GridWrapper;

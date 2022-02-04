import { GRID_COUNT } from '../../utils/constants';

type GridWrapperProps = {
  className?: string;
};

const GridWrapper: React.FC<GridWrapperProps> = ({
  children,
  className
}) => {

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${GRID_COUNT} gap-4 ${className}`}>
      {children}
    </div>
  );
};

export default GridWrapper;

const GridWrapper: React.FC = ({ children }) => {

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {children}
    </div>
  );
};

export default GridWrapper;

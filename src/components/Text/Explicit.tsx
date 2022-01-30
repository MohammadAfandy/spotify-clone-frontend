type ExplicitProps = {
  className?: string;
};

const defaultProps: ExplicitProps = {
  className: '',
};

const Explicit: React.FC<ExplicitProps> = ({ className }) => {
  return (
    <span className={`bg-gray-300 border border-gray-500 text-black rounded-xs px-1 text-xxs mr-2 font-bold ${className}`}>
      E
    </span>
  );
};

Explicit.defaultProps = defaultProps;

export default Explicit;

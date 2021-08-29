type ButtonProps = {
  className?: string;
  text: string;
  color?: string;
  fill?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const defaultProps: ButtonProps = {
  className: '',
  text: '',
  color: '',
  fill: '',
};

const Button: React.FC<ButtonProps> = ({
  className,
  text,
  color,
  fill,
  onClick,
}) => {
  const colors: { [key: string]: string } = {
    default: 'text-white',
    red: 'text-red-300',
    green: 'text-green-300',
  };
  const bgColors: { [key: string]: string } = {
    default: 'bg-transparent',
    red: 'bg-red-500',
    green: 'bg-green-500',
  };
  const selectedColor = colors[color as string] || colors.default;
  const selectedBgColor = bgColors[fill as string] || bgColors.default;
  return (
    <button
      onClick={onClick}
      className={`border-2 rounded-3xl px-10 py-1 font-semibold transition duration-300 ease-in-out transform hover:scale-105 ${selectedColor} ${selectedBgColor} ${className}`}
    >
      {text}
    </button>
  );
};

Button.defaultProps = defaultProps;

export default Button;

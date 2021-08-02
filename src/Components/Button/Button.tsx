type ButtonProps = {
  className?: string;
  text: string;
  color?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const defaultProps: ButtonProps = {
  className: '',
  text: '',
  color: '',
};

const Button: React.FC<ButtonProps> = ({ className, text, color, onClick }) => {
  const colors: { [key: string]: string } = {
    default: 'text-white',
    red: 'text-red-300',
    green: 'text-green-300',
  };
  const selectedColor = colors[color as string] || colors.default;
  return (
    <button
      onClick={onClick}
      className={`border-2 rounded-3xl px-10 py-1 font-semibold transition duration-300 ease-in-out transform hover:scale-105 ${selectedColor} ${className}`}
    >
      {text}
    </button>
  );
};

Button.defaultProps = defaultProps;

export default Button;

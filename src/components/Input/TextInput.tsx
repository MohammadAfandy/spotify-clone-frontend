type TextInputProps = {
  className?: string;
  value: string;
  placeholder: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const defaultProps: TextInputProps = {
  className: '',
  value: '',
  placeholder: '',
};

const TextInput: React.FC<TextInputProps> = ({
  className,
  value,
  placeholder,
  onChange,
}) => {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      className={`bg-light-black-2 text-white font-bold p-3 mb-4 rounded-xl outline-none ${className}`}
      onChange={onChange}
    />
  );
};

TextInput.defaultProps = defaultProps;

export default TextInput;

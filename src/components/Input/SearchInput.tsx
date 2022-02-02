import { MdSearch } from 'react-icons/md';

type SearchInputProps = {
  className?: string;
  value: string;
  placeholder: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const defaultProps: SearchInputProps = {
  className: '',
  value: '',
  placeholder: '',
};

const SearchInput: React.FC<SearchInputProps> = ({
  className,
  value,
  placeholder,
  onChange,
}) => {
  return (
    <div
      className={`rounded-md flex items-center bg-white text-black py-1 px-3 ${className}`}
    >
      <MdSearch className="h-6 w-6" />
      <input
        className={`outline-none w-full ${className}`}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
      />
    </div>
  );
};

SearchInput.defaultProps = defaultProps;

export default SearchInput;

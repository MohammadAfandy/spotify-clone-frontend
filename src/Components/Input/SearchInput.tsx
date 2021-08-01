import { Search } from 'react-feather';

type SearchInputProps = {
  className?: string,
  value: string,
  placeholder: string,
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const defaultProps: SearchInputProps = {
  className: '',
  value: '',
  placeholder: '',
};

const SearchInput: React.FC<SearchInputProps> = ({ className, value, placeholder, onChange }) => {
  return (
    <div className={`rounded-md flex items-center bg-white text-black py-1 px-3 w-80 ${className}`}>
      <Search className="mr-4" />
      <input
        className={`outline-none w-full ${className}`}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
      />
    </div>
  )
}

SearchInput.defaultProps = defaultProps;

export default SearchInput

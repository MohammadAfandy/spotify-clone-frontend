import { useHistory } from 'react-router-dom';

type TextLinkProps = {
  className?: string;
  text: string;
  url: string;
  afterClick?: () => void;
};

const defaultProps: TextLinkProps = {
  className: '',
  text: '',
  url: '',
  afterClick: () => {},
};

const TextLink: React.FC<TextLinkProps> = ({
  className,
  text,
  url,
  afterClick,
}) => {
  const history = useHistory();

  const handleClick = () => {
    history.push(url);
    if (afterClick) afterClick();
  }

  return (
    <span
      className={`hover:underline cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {text}
    </span>
  );
};

TextLink.defaultProps = defaultProps;

export default TextLink;

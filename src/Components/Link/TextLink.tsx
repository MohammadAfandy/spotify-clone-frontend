import { useHistory } from 'react-router-dom';

type TextLinkProps = {
  className?: string,
  text: string,
  url: string,
};

const defaultProps: TextLinkProps = {
  className: '',
  text: '',
  url: '',
};

const TextLink: React.FC<TextLinkProps> = ({
  className,
  text,
  url,
}) => {
  const history = useHistory();
  return (
    <span
      className={`hover:underline cursor-pointer ${className}`}
      onClick={() => history.push(url)}
    >
      {text}
    </span>
  )
}

TextLink.defaultProps = defaultProps;

export default TextLink;

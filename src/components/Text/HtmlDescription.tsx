import reactStringReplace from 'react-string-replace';
import { Text } from 'domhandler/lib/node';
import parse, { DOMNode, HTMLReactParserOptions } from 'html-react-parser';

import TimeStamp from './TimeStamp';
import { hmsToSeconds } from '../../utils/helpers';

type HtmlDescriptionProps = {
  className?: string;
  description: string;
  uri: string;
};

const defaultProps: HtmlDescriptionProps = {
  className: '',
  description: '',
  uri: '',
};

const isTextElement = (domNode: DOMNode): domNode is Text => {
  return domNode.type === 'text';
};

const HtmlDescription: React.FC<HtmlDescriptionProps> = ({
  className,
  description,
  uri,
}) => {
  const regexTimestamp = /((?:\d+:)?[0-5]?\d:[0-5]?\d)/g;
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (isTextElement(domNode)) {
        return (
          <>
            {reactStringReplace(domNode.data, regexTimestamp, (match, i) => (
              <TimeStamp
                key={i}
                uri={uri}
                miliseconds={hmsToSeconds(match) * 1000}
              >
                {match}
              </TimeStamp>
            ))}
          </>
        );
      }
    },
  };

  return (
    <div className={`html-description ${className}`}>
      {parse(description, options)}
    </div>
  );
};

HtmlDescription.defaultProps = defaultProps;

export default HtmlDescription;

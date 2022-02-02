import { Fragment } from 'react';
import { FiMusic } from 'react-icons/fi';
import { ellipsis } from '../../utils/helpers';

type PlayerListHeaderProps = {
  image: string;
  type: string;
  name: string;
  description?: string;
  footer?: Array<React.ReactNode | string>;
};

const defaultProps: PlayerListHeaderProps = {
  image: '',
  type: '',
  name: '',
  description: '',
  footer: [],
};

const PlayerListHeader: React.FC<PlayerListHeaderProps> = ({
  image,
  type,
  name,
  description,
  footer,
}) => {
  return (
    <div className="flex flex-col items-center sm:flex-row sm:items-end mb-3 pb-3 border-b-2 border-opacity-10">
      {image ? (
        <img src={image} alt={name} className="w-52 h-52 sm:mr-6 rounded-md" />
      ) : (
        <div className="flex justify-center items-center w-52 h-52 sm:mr-6 rounded-md bg-light-black-2">
          <FiMusic className="w-24 h-24" />
        </div>
      )}
      <div className="font-bold text-center sm:text-left mt-4 sm:mt-0">
        <div className="mb-2 text-lg">{type}</div>
        <div className="mb-4 text-4xl">{name}</div>
        <div className="mb-2 text-sm font-light">
          {description && ellipsis(description, 150)}
        </div>
        <div className="text-sm">
          {footer &&
            footer.map((foot, idx) => (
              <Fragment key={idx}>
                {foot}
                {idx !== footer.length - 1 && ' • '}
              </Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};

PlayerListHeader.defaultProps = defaultProps;

export default PlayerListHeader;

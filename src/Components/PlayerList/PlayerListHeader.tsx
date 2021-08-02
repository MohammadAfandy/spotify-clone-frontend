import { Fragment } from 'react';
import { Music } from 'react-feather';
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
    <div className="flex items-end mb-6">
      {image ? (
        <img src={image} alt={name} className="w-52 h-52 mr-6 rounded-md" />
      ) : (
        <div className="flex justify-center items-center w-52 h-52 mr-6 rounded-md bg-light-black-2">
          <Music className="w-24 h-24" />
        </div>
      )}
      <div className="font-bold">
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

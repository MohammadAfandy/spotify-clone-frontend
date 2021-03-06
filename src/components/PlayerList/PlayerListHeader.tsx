import { Fragment } from 'react';
import { FiMusic } from 'react-icons/fi';
import { ellipsis } from '../../utils/helpers';

import Skeleton from '../Skeleton/Skeleton';

type PlayerListHeaderProps = {
  image: string;
  type: string;
  name: string;
  description?: string;
  footer?: Array<React.ReactNode | string>;
  isLoading?: boolean;
};

const defaultProps: PlayerListHeaderProps = {
  image: '',
  type: '',
  name: '',
  description: '',
  footer: [],
  isLoading: false,
};

const PlayerListHeader: React.FC<PlayerListHeaderProps> = ({
  image,
  type,
  name,
  description,
  footer,
  isLoading,
}) => {

  const LoadingComponent = (
    <>
      <div className="h-52 w-52 sm:mr-6 rounded-md">
        <Skeleton height="100%" />
      </div>
      <div className="flex flex-col w-full items-center sm:items-start gap-3 mt-4 sm:mt-0">
        <Skeleton width="30%" />
        <Skeleton height={30} width="70%" />
        <Skeleton width="60%" />
        <Skeleton width="80%" />
      </div>
    </>
  );

  const ImageComponent = image ? (
    <img src={image} alt={name} className="w-52 h-52 sm:mr-6 rounded-md" />
  ) : (
    <div className="flex justify-center items-center w-52 h-52 sm:mr-6 rounded-md bg-light-black-2">
      <FiMusic className="w-24 h-24" />
    </div>
  );

  return (
    <div className="flex flex-col items-center sm:flex-row sm:items-end mb-3 pb-3 border-b-2 border-opacity-10">
      {isLoading && LoadingComponent}
      {!isLoading && (
        <>
          {ImageComponent}
          <div className="font-bold text-center sm:text-left mt-4 sm:mt-0">
            <div className="mb-2 text-lg">{type}</div>
            <div className="mb-4 text-4xl">{name}</div>
            <div className="mb-2 text-sm font-light">
              {description && ellipsis(description, 150)}
            </div>
            <div className="text-sm">
              {footer && footer.map((foot, idx) => (
                <Fragment key={idx}>
                  {foot}
                  {idx !== footer.length - 1 && ' • '}
                </Fragment>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

PlayerListHeader.defaultProps = defaultProps;

export default PlayerListHeader;

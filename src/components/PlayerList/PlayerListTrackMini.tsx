import { Fragment } from 'react';
import { Play, Plus } from 'react-feather';
import Track from '../../types/Track';
import Episode from '../../types/Episode';
import { getSmallestImage, duration } from '../../utils/helpers';

import TextLink from '../Text/TextLink';

type PlayerListTrackMiniProps = {
  track: Track & Episode;
  handlePlayTrack: (event: React.MouseEvent) => void;
  showAddLibrary?: boolean;
  onAddToPlaylist?: (event: React.MouseEvent) => void;
};

const defaultProps: PlayerListTrackMiniProps = {
  track: {} as Track & Episode,
  handlePlayTrack: (event: React.MouseEvent) => {},
  showAddLibrary: false,
  onAddToPlaylist: (event: React.MouseEvent) => {},
};

const PlayerListTrackMini: React.FC<PlayerListTrackMiniProps> = ({
  track,
  handlePlayTrack,
  showAddLibrary,
  onAddToPlaylist,
}) => {
  return (
    <div className="group grid grid-cols-12 gap-6 w-full p-2 text-sm hover:bg-gray-100 hover:bg-opacity-25 rounded-md">
      <div className="col-span-2 md:col-span-1 relative w-12">
        <img
          src={
            track.album
              ? getSmallestImage(track.album.images)
              : getSmallestImage(track.images)
          }
          alt={track.name}
          className="opacity-20 canhover:opacity-100 canhover:group-hover:opacity-20 w-full"
        />
        <Play
          className="block canhover:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 canhover:group-hover:block"
          onClick={handlePlayTrack}
          data-tip="play"
          data-for="login-tooltip"
          data-event="click"
        />
      </div>
      <div className="col-span-8 md:col-span-10 flex flex-col justify-end truncate">
        <div className="font-semibold truncate">{track.name}</div>
        <div className="font-light truncate">
          {track.artists &&
            track.artists.map((artist, idx) => (
              <Fragment key={idx}>
                <TextLink text={artist.name} url={'/artist/' + artist.id} />
                {idx !== track.artists.length - 1 && ', '}
              </Fragment>
            ))}
        </div>
      </div>
      <div className="col-span-2 md:col-span-1 flex items-center">
        {showAddLibrary ? (
          <Plus onClick={onAddToPlaylist} />
        ) : (
          duration(track.duration_ms)
        )}
      </div>
    </div>
  );
};

PlayerListTrackMini.defaultProps = defaultProps;

export default PlayerListTrackMini;

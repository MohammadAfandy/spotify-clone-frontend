import { Play } from 'react-feather';
import Track from '../../types/Track';
import Episode from '../../types/Episode';
import { getSmallestImage, duration } from '../../utils/helpers';

import Button from '../Button/Button';
import TextLink from '../Link/TextLink';

type PlayerListTrackMiniProps = {
  track: Track & Episode,
  handlePlayTrack: (event: React.MouseEvent) => void,
  showAddLibrary?: boolean,
  onAddToPlaylist?: (event: React.MouseEvent) => void,
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
    <div className="group flex items-center w-full p-2 text-sm hover:bg-indigo-100 hover:bg-opacity-25 cursor-pointer rounded-md">
      <div className="relative w-12 mr-4">
        <img
          src={track.album ? getSmallestImage(track.album.images) : getSmallestImage(track.images)}
          alt={track.name}
          className="group-hover:opacity-20"
        />
        <Play
          className="hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:block"
          onClick={handlePlayTrack}
        />
      </div>
      <div className="flex flex-col justify-end mr-auto">
        <div className="font-semibold">{track.name}</div>
        <div className="font-light">
          {track.artists && track.artists.map((artist, idx) => (
            <>
              <TextLink
                text={artist.name}
                url={'/artist/' + artist.id}
              />
              {idx !== track.artists.length - 1 && ', '}
            </>
          ))}
        </div>
      </div>
      <div className="flex items-center mr-8">
        {showAddLibrary ? (
          <Button
            text="ADD"
            onClick={onAddToPlaylist}
          />
        ) : duration(track.duration_ms)}
      </div>
    </div>
  );
};

PlayerListTrackMini.defaultProps = defaultProps;

export default PlayerListTrackMini;

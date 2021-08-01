import InfiniteScroll from 'react-infinite-scroll-component';
import { useContext } from 'react';
import Track from '../../types/Track';
import { Clock } from 'react-feather';
import { PlayerContext } from '../../context/player-context';

import PlayerListTrackItem from './PlayerListTrackItem';

type PlayerListTrackNewProps = {
  tracks: Track[],
  showAlbum?: boolean,
  showDateAdded?: boolean,
  onRemoveFromPlaylist?: (trackId: string) => void,
  handlePlayTrack: (offset: number, positionMs: number) => void,
  handleNext: () => void,
  hasMore: boolean,
};

const defaultProps: PlayerListTrackNewProps = {
  tracks: [],
  showAlbum: false,
  showDateAdded: false,
  onRemoveFromPlaylist: undefined,
  handlePlayTrack: (offset: number, positionMs: number) => {},
  handleNext: () => {},
  hasMore: false,
};

const PlayerListTrackNew: React.FC<PlayerListTrackNewProps> = ({
  tracks,
  showAlbum,
  showDateAdded,
  onRemoveFromPlaylist,
  handlePlayTrack,
  handleNext,
  hasMore,
}) => {
  let number = 0;
  const {
    currentTrack,
  } = useContext(PlayerContext);
  return (
    <div className="flex flex-col w-full">
      <div className="text-sm">
        <div className="flex border-b border-gray-500 py-2">
          <div className="flex justify-center" style={{ flexBasis: '5%' }}>#</div>
          <div className="flex mr-auto">TITLE</div>
          {showAlbum && <div className="flex" style={{ flexBasis: '30%' }}>ALBUM</div>}
          {showDateAdded && <div className="flex" style={{ flexBasis: '15%' }}>DATE ADDED</div>}
          <div className="" style={{ flexBasis: '5%' }}></div>
          {onRemoveFromPlaylist && <div className="" style={{ flexBasis: '5%' }}></div>}
          <div className="flex" style={{ flexBasis: '5%' }}>
            <Clock className="w-4" />
          </div>
        </div>
      </div>
      <div className="">
        {tracks && (
          <InfiniteScroll
            dataLength={tracks.length}
            next={handleNext}
            hasMore={hasMore}
            loader={<h4>Loading ...</h4>}
            scrollableTarget="main-container"
          >
            {/* sometimes, the track object is null */}
            {tracks.map((track, idx) => {
              if (track.id != null) {
                number++;
                return (
                  <PlayerListTrackItem
                    track={track}
                    offset={idx}
                    number={number}
                    showAlbum={showAlbum}
                    showDateAdded={showDateAdded}
                    onRemoveFromPlaylist={onRemoveFromPlaylist}
                    currentTrack={currentTrack}
                    handlePlayTrack={handlePlayTrack}
                  />
                )
              }
              return null;
            })}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

PlayerListTrackNew.defaultProps = defaultProps;

export default PlayerListTrackNew;

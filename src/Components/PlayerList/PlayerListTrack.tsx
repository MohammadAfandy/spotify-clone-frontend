import InfiniteScroll from 'react-infinite-scroll-component';
import Track from '../../types/Track';
import { Clock } from 'react-feather';

import PlayerListTrackItem from './PlayerListTrackItem';

type PlayerListTrackProps = {
  tracks: Track[];
  currentTrack: Track;
  showAlbum?: boolean;
  showDateAdded?: boolean;
  onRemoveFromPlaylist?: (trackId: string) => void;
  handlePlayTrack: (offset: number, positionMs: number) => void;
  handleNext: () => void;
  hasMore: boolean;
  isIncludeEpisode?: boolean;
};

const defaultProps: PlayerListTrackProps = {
  tracks: [],
  currentTrack: {} as Track,
  showAlbum: false,
  showDateAdded: false,
  onRemoveFromPlaylist: undefined,
  handlePlayTrack: (offset: number, positionMs: number) => {},
  handleNext: () => {},
  hasMore: false,
  isIncludeEpisode: false,
};

const PlayerListTrack: React.FC<PlayerListTrackProps> = ({
  tracks,
  currentTrack,
  showAlbum,
  showDateAdded,
  onRemoveFromPlaylist,
  handlePlayTrack,
  handleNext,
  hasMore,
  isIncludeEpisode,
}) => {
  let number = 0;
  return (
    <div className="flex flex-col w-full">
      <div className="text-sm">
        <div className="flex border-b border-gray-500 py-2">
          <div className="flex justify-center mr-2" style={{ flexBasis: '5%' }}>
            #
          </div>
          <div className="flex flex-grow">TITLE</div>
          {showAlbum && (
            <div className="hidden lg:flex mr-2" style={{ flexBasis: '30%' }}>
              {!isIncludeEpisode && `ALBUM`}
              {isIncludeEpisode && `ALBUM OR PODCAST`}
            </div>
          )}
          {showDateAdded && (
            <div className="hidden md:flex mr-2" style={{ flexBasis: '15%' }}>
              DATE ADDED
            </div>
          )}
          <div className="flex mr-2" style={{ flexBasis: '5%' }}></div>
            {onRemoveFromPlaylist && (
              <div className=" mr-2" style={{ flexBasis: '5%' }}></div>
            )}
          <div className="flex mr-2" style={{ flexBasis: '5%' }}>
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
                    key={track.id}
                    track={track}
                    offset={idx}
                    number={number}
                    showAlbum={showAlbum}
                    showDateAdded={showDateAdded}
                    onRemoveFromPlaylist={onRemoveFromPlaylist}
                    currentTrack={currentTrack}
                    handlePlayTrack={handlePlayTrack}
                  />
                );
              }
              return null;
            })}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

PlayerListTrack.defaultProps = defaultProps;

export default PlayerListTrack;

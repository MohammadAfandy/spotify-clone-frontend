import InfiniteScroll from 'react-infinite-scroll-component';
import Track from '../../types/Track';
import { MdAccessTime } from 'react-icons/md';

import PlayerListTrackItem from './PlayerListTrackItem';

import styles from './PlayerListTrack.module.css';

type PlayerListTrackProps = {
  tracks: Track[];
  currentTrack: Track;
  isPlaying?: boolean;
  showAlbum?: boolean;
  showDateAdded?: boolean;
  onRemoveFromPlaylist?: (trackId: string) => void;
  handlePlayTrack: (offset: number, positionMs: number) => void;
  handlePauseTrack: () => void;
  handleNext: () => void;
  hasMore: boolean;
  isIncludeEpisode?: boolean;
};

const defaultProps: PlayerListTrackProps = {
  tracks: [],
  currentTrack: {} as Track,
  isPlaying: false,
  showAlbum: false,
  showDateAdded: false,
  onRemoveFromPlaylist: undefined,
  handlePlayTrack: (offset: number, positionMs: number) => {},
  handlePauseTrack: () => {},
  handleNext: () => {},
  hasMore: false,
  isIncludeEpisode: false,
};

const PlayerListTrack: React.FC<PlayerListTrackProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  showAlbum,
  showDateAdded,
  onRemoveFromPlaylist,
  handlePlayTrack,
  handlePauseTrack,
  handleNext,
  hasMore,
  isIncludeEpisode,
}) => {
  let number = 0;
  return (
    <div className={styles.playerGrid + " flex flex-col w-full"}>
      <div className="border-b-2 border-opacity-10 px-2" data-wrapper>
        <div className="text-center col-start-1 col-end-1">
          #
        </div>
        <div className="col-start-2 col-end-2">TITLE</div>
        {showAlbum && (
          <div className="hidden lg:block col-start-3 col-end-3">
            {!isIncludeEpisode && `ALBUM`}
            {isIncludeEpisode && `ALBUM OR PODCAST`}
          </div>
        )}
        {showDateAdded && (
          <div className="hidden md:block col-start-4 col-end-4">
            DATE ADDED
          </div>
        )}
        <div className="col-start-5 col-end-5"></div>
        <div className="col-start-6 col-end-6">
          <MdAccessTime className="h-4 w-4" />
        </div>
        <div className="col-start-7 col-end-7"></div>
      </div>
      {tracks && (
        <InfiniteScroll
          dataLength={tracks.length}
          next={handleNext}
          hasMore={hasMore}
          loader={<h4>Loading ...</h4>}
          scrollableTarget="main-container"
          style={{ overflow: 'unset' }}
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
                  isPlaying={isPlaying}
                  handlePlayTrack={handlePlayTrack}
                  handlePauseTrack={handlePauseTrack}
                />
              );
            }
            return null;
          })}
        </InfiniteScroll>
      )}
    </div>
  );
};

PlayerListTrack.defaultProps = defaultProps;

export default PlayerListTrack;

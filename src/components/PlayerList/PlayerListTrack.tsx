import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch } from 'react-redux';
import { togglePlay } from '../../store/player-slice';

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
  uris: string[];
  onRemoveFromPlaylist?: (trackId: string) => void;
  handleAddTrackToPlaylist?: (trackId: string) => void;
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
  uris: [],
  onRemoveFromPlaylist: undefined,
  handleAddTrackToPlaylist: undefined,
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
  uris,
  onRemoveFromPlaylist,
  handleNext,
  hasMore,
  isIncludeEpisode,
}) => {
  const dispatch = useDispatch();
  const handlePlayTrack = (
    selectedOffset: number,
    selectedPositionMs: number
  ) => {
    dispatch(togglePlay({
      uris,
      offset: selectedOffset,
      positionMs: selectedPositionMs,
    }));
  };

  let number = 0;
  const TrackLoading = (
    [...Array(4)].map((_, idx) => (
      <PlayerListTrackItem key={idx} isLoading />
    ))
  );
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
        <div className="hidden sm:block col-start-5 col-end-5"></div>
        <div className="hidden sm:block col-start-6 col-end-6">
          <MdAccessTime className="h-4 w-4" />
        </div>
        <div className="col-start-7 col-end-7"></div>
      </div>
      {tracks && (
        <InfiniteScroll
          dataLength={tracks.length}
          next={handleNext}
          hasMore={hasMore}
          loader={TrackLoading}
          scrollableTarget="main-container"
          style={{ overflow: 'unset' }}
        >
          {/* sometimes, the track object is null */}
          {tracks.map((track, idx) => {
            if (track.id != null) {
              number++;
              return (
                <PlayerListTrackItem
                  key={track.id + '-' + idx}
                  track={track}
                  offset={idx}
                  number={number}
                  showAlbum={showAlbum}
                  showDateAdded={showDateAdded}
                  onRemoveFromPlaylist={onRemoveFromPlaylist}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  handlePlayTrack={handlePlayTrack}
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

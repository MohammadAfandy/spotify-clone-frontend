import { useEffect, useContext } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { AuthContext } from '../../context/auth-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  togglePlay,
  toggleResume,
  togglePause,
  changeIsSaved
} from '../../store/player-slice';
import {
  addToSavedTrack,
  addTrackToPlaylist,
  PlaylistTrackParams,
  removeFromSavedTrack,
  SavedTrackParams,
  setSavedTrackIds
} from '../../store/playlist-slice';

import Track from '../../types/Track';
import { MdAccessTime } from 'react-icons/md';

import PlayerListTrackItem from './PlayerListTrackItem';

import styles from './PlayerListTrack.module.css';

type PlayerListTrackProps = {
  tracks: Track[];
  showAlbum?: boolean;
  showDateAdded?: boolean;
  uris: string[];
  handleNext: () => void;
  hasMore: boolean;
  isIncludeEpisode?: boolean;
  handleRemoveFromPlaylist?: ({ trackUri, position }: { trackUri: string, position?: number }) => void;
};

const defaultProps: PlayerListTrackProps = {
  tracks: [],
  showAlbum: false,
  showDateAdded: false,
  uris: [],
  handleNext: () => {},
  hasMore: false,
  isIncludeEpisode: false,
  handleRemoveFromPlaylist: undefined,
};

const PlayerListTrack: React.FC<PlayerListTrackProps> = ({
  tracks,
  showAlbum,
  showDateAdded,
  uris,
  handleNext,
  hasMore,
  isIncludeEpisode,
  handleRemoveFromPlaylist,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initialSavedTracks = tracks.filter((track) => track.is_saved).map((track) => track.id);
    dispatch(setSavedTrackIds(initialSavedTracks));
  }, [tracks, dispatch]);

  const { user } = useContext(AuthContext);

  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const isPlaying = useSelector((state: RootState) => state.player.isPlaying);
  const playlists = useSelector((state: RootState) => state.playlist.items);
  const savedTrackIds = useSelector((state: RootState) => state.playlist.savedTrackIds);

  const handlePlayTrack = ({
    offset,
    uri,
  }: {
    offset: number,
    uri: string,
  }) => {
    if (currentTrack && uri === currentTrack.uri) {
      dispatch(toggleResume());
    } else {
      dispatch(togglePlay({
        uris,
        offset,
      }));
    }
  };

  const handlePauseTrack = () => {
    dispatch(togglePause());
  };

  const handleAddTrackToPlaylist = ({ playlistId, trackUri }: PlaylistTrackParams) => {
    dispatch(addTrackToPlaylist({ playlistId, trackUri }));
  };

  const handleAddToSavedTrack = ({ type, trackId }: SavedTrackParams) => {
    dispatch(addToSavedTrack({ type, trackId }));
    currentTrack.id === trackId && dispatch(changeIsSaved(true));
  };

  const handleRemoveFromSavedTrack = ({ type, trackId }: SavedTrackParams) => {
    dispatch(removeFromSavedTrack({ type, trackId }));
    currentTrack.id === trackId && dispatch(changeIsSaved(false));
  };

  let number = 0;
  const TrackLoading = (
    [...Array(1)].map((_, idx) => (
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
                  isSavedTrack={savedTrackIds.includes(track.id)}
                  offset={idx}
                  number={number}
                  showAlbum={showAlbum}
                  showDateAdded={showDateAdded}
                  currentTrack={currentTrack as Track}
                  isPlaying={isPlaying}
                  playlists={playlists}
                  userId={user.id}
                  handlePlayTrack={handlePlayTrack}
                  handlePauseTrack={handlePauseTrack}
                  handleAddTrackToPlaylist={handleAddTrackToPlaylist}
                  handleRemoveFromPlaylist={handleRemoveFromPlaylist}
                  handleAddToSavedTrack={handleAddToSavedTrack}
                  handleRemoveFromSavedTrack={handleRemoveFromSavedTrack}
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

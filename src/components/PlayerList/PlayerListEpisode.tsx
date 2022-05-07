import { useContext } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../context/auth-context';
import { RootState } from '../../store';
import { changeIsSaved, togglePause, togglePlay, toggleResume } from '../../store/player-slice';
import {
  addToSavedTrack,
  addTrackToPlaylist,
  PlaylistTrackParams,
  removeFromSavedTrack,
  SavedTrackParams,
} from '../../store/playlist-slice';
import Episode from '../../types/Episode';

import PlayerListEpisodeItem from './PlayerListEpisodeItem';

type PlayerListEpisodeProps = {
  episodes: Episode[];
  uris: string[];
  handleNext: () => void;
  hasMore: boolean;
};

const defaultProps: PlayerListEpisodeProps = {
  episodes: [],
  uris: [],
  handleNext: () => {},
  hasMore: false,
};

const PlayerListEpisode: React.FC<PlayerListEpisodeProps> = ({
  episodes,
  uris,
  handleNext,
  hasMore,
}) => {
  const dispatch = useDispatch();

  const { user } = useContext(AuthContext);

  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const isPlaying = useSelector((state: RootState) => state.player.isPlaying);
  const playlists = useSelector((state: RootState) => state.playlist.items);
  const savedTrackIds = useSelector((state: RootState) => state.playlist.savedTrackIds);

  const handlePlayEpisode = ({
    position,
    uri,
    positionMs,
  }: {
    position: number,
    uri: string,
    positionMs: number,
  }) => {
    if (currentTrack && uri === currentTrack.uri) {
      dispatch(toggleResume());
    } else {
      dispatch(togglePlay({
        uris,
        offset: uri,
        positionMs,
      }));
    }
  };

  const handlePauseEpisode = () => {
    dispatch(togglePause());
  };

  const handleAddEpisodeToPlaylist = ({ playlistId, trackUri }: PlaylistTrackParams) => {
    dispatch(addTrackToPlaylist({ playlistId, trackUri }));
  };

  const handleAddToSavedEpisode = ({ type, trackId }: SavedTrackParams) => {
    dispatch(addToSavedTrack({ type, trackId }));
    currentTrack.id === trackId && dispatch(changeIsSaved(true));
  };

  const handleRemoveFromSavedEpisode = ({ type, trackId }: SavedTrackParams) => {
    dispatch(removeFromSavedTrack({ type, trackId }));
    currentTrack.id === trackId && dispatch(changeIsSaved(false));
  };

  const EpisodeLoading = (
    [...Array(3)].map((_, idx) => (
      <PlayerListEpisodeItem key={idx} isLoading />
    ))
  );

  return (
    <div className="flex flex-col">
      {episodes && (
        <InfiniteScroll
          dataLength={episodes.length}
          next={handleNext}
          hasMore={hasMore}
          loader={EpisodeLoading}
          scrollableTarget="main-container"
        >
          {episodes.map((episode, idx) => (
            <PlayerListEpisodeItem
              key={episode.id}
              episode={episode}
              offset={idx}
              number={idx + 1}
              isSavedEpisode={savedTrackIds.includes(episode.id)}
              currentEpisode={currentTrack as Episode}
              isPlaying={isPlaying}
              playlists={playlists}
              userId={user.id}
              handlePlayEpisode={handlePlayEpisode}
              handlePauseEpisode={handlePauseEpisode}
              handleAddToSavedEpisode={handleAddToSavedEpisode}
              handleRemoveFromSavedEpisode={handleRemoveFromSavedEpisode}
              handleAddEpisodeToPlaylist={handleAddEpisodeToPlaylist}
            />
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

PlayerListEpisode.defaultProps = defaultProps;

export default PlayerListEpisode;

import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { PlayerContext } from '../context/player-context';
import useFetchTracks from '../hooks/useFetchTracks';
import { LIKED_SONG_IMAGE } from '../utils/constants';
import { duration } from '../utils/helpers';

import PlayerListHeader from '../components/PlayerList/PlayerListHeader';
import PlayerListTrack from '../components/PlayerList/PlayerListTrack';
import PlayButton from '../components/Button/PlayButton';

const CollectionTrackPage: React.FC = () => {
  const { user } = useContext(AuthContext);

  const { currentTrack, togglePlay } = useContext(PlayerContext);

  const { setNextUrl, tracks, pageData } = useFetchTracks('/me/tracks');

  const handlePlayFromStart = () => {
    togglePlay([`spotify:user:${user.id}:collection`], 0);
  };

  const handlePlayTrack = (
    selectedOffset: number,
    selectedPositionMs: number
  ) => {
    const trackUris = tracks.map((v) => v.uri);
    togglePlay(trackUris, selectedOffset, selectedPositionMs);
  };

  const totalDuration = tracks.reduce((acc, curr) => {
    return acc + curr.duration_ms;
  }, 0);

  return (
    <div className="px-4 py-4">
      {tracks.length > 0 ? (
        <div className="px-4 py-4">
          <PlayerListHeader
            image={LIKED_SONG_IMAGE}
            name="Liked Songs"
            type="PLAYLIST"
            footer={[
              user.display_name,
              `${pageData.total} songs, ${duration(totalDuration, true)}`,
            ]}
          />
          <div className="flex items-center justify-center sm:justify-start">
            <PlayButton
              className="w-16 h-16 mr-6"
              onClick={handlePlayFromStart}
            />
          </div>
          <PlayerListTrack
            tracks={tracks}
            showAlbum
            showDateAdded
            currentTrack={currentTrack}
            handlePlayTrack={handlePlayTrack}
            handleNext={() => setNextUrl(pageData.next)}
            hasMore={!!pageData.next}
          />
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default CollectionTrackPage;
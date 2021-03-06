import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { togglePlay } from '../store/player-slice';
import { AuthContext } from '../context/auth-context';
import useFetchTracks from '../hooks/useFetchTracks';
import { LIKED_SONG_IMAGE } from '../utils/constants';
import { duration } from '../utils/helpers';

import PlayerListHeader from '../components/PlayerList/PlayerListHeader';
import PlayerListTrack from '../components/PlayerList/PlayerListTrack';
import PlayButton from '../components/Button/PlayButton';

const CollectionTrackPage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);

  const { setNextUrl, tracks, pageData, isLoading } = useFetchTracks('/me/tracks');

  const handlePlayFromStart = () => {
    dispatch(togglePlay({
      uris: [`spotify:user:${user.id}:collection`],
      offset: 0,
    }));
  };

  const totalDuration = tracks.reduce((acc, curr) => {
    return acc + curr.duration_ms;
  }, 0);

  return (
    <div className="sm:p-4 p-2">
      <PlayerListHeader
        image={LIKED_SONG_IMAGE}
        name="Liked Songs"
        type="PLAYLIST"
        footer={[
          user.display_name,
          `${pageData.total} songs, ${duration(totalDuration, true)}`,
        ]}
        isLoading={isLoading}
      />
      <div className="flex items-center justify-center sm:justify-start mb-4">
        <PlayButton
          className="w-16 h-16"
          onClick={handlePlayFromStart}
        />
      </div>
      <PlayerListTrack
        tracks={tracks}
        showAlbum
        showDateAdded
        uris={[`spotify:user:${user.id}:collection`]}
        handleNext={() => setNextUrl(pageData.next)}
        hasMore={!!pageData.next}
      />
    </div>
  );
};

export default CollectionTrackPage;

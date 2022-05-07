import { useContext } from 'react';
import useFetchTracks from '../hooks/useFetchTracks';
import { AuthContext } from '../context/auth-context';
import { useDispatch } from 'react-redux';
import { togglePlay } from '../store/player-slice';
import { EPISODE_LOGO_IMAGE } from '../utils/constants';

import PlayerListHeader from '../components/PlayerList/PlayerListHeader';
import PlayerListEpisode from '../components/PlayerList/PlayerListEpisode';
import PlayButton from '../components/Button/PlayButton';

const CollectionEpisodePage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);

  const { setNextUrl, tracks: episodes, pageData, isLoading } = useFetchTracks('/me/episodes');

  const handlePlayFromStart = () => {
    const episodeUris = episodes.map((v) => v.uri);
    dispatch(togglePlay({
      uris: episodeUris,
      offset: 0,
    }));
  };

  return (
    <div className="sm:p-4 p-2">
      <PlayerListHeader
        image={EPISODE_LOGO_IMAGE}
        name="Your Episodes"
        type="PLAYLIST"
        footer={[user.display_name, `${pageData.total} episodes`]}
        isLoading={isLoading}
      />
      <div className="flex items-center justify-center sm:justify-start mb-4">
        <PlayButton
          className="w-16 h-16"
          onClick={handlePlayFromStart}
        />
      </div>
      <PlayerListEpisode
        episodes={episodes}
        uris={episodes.map((v) => v.uri)}
        handleNext={() => setNextUrl(pageData.next)}
        hasMore={!!pageData.next}
      />
    </div>
  );
};

export default CollectionEpisodePage;

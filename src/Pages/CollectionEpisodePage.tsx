import { useContext } from 'react';
import useFetchEpisodes from '../hooks/useFetchEpisodes';
import { AuthContext } from '../context/auth-context';
import { PlayerContext } from '../context/player-context';
import { EPISODE_LOGO_IMAGE } from '../utils/constants';

import PlayerListHeader from '../components/PlayerList/PlayerListHeader';
import PlayerListEpisode from '../components/PlayerList/PlayerListEpisode';
import PlayButton from '../components/Button/PlayButton';

const CollectionEpisodePage: React.FC = () => {
  const { user } = useContext(AuthContext);

  const { togglePlay } = useContext(PlayerContext);

  const { setNextUrl, episodes, pageData } = useFetchEpisodes('/me/episodes');

  const handlePlayFromStart = () => {
    const episodeUris = episodes.map((v) => v.uri);
    togglePlay(episodeUris, 0);
  };

  const handlePlayEpisode = (
    selectedOffset: number,
    selectedPositionMs: number
  ) => {
    const episodeUris = episodes.map((v) => v.uri);
    togglePlay(episodeUris, selectedOffset, selectedPositionMs);
  };

  return (
    <div className="px-4 py-4">
      <div className="px-4 py-4">
        <PlayerListHeader
          image={EPISODE_LOGO_IMAGE}
          name="Your Episodes"
          type="PLAYLIST"
          footer={[user.display_name, `${pageData.total} episodes`]}
        />
        <div className="flex items-center mb-4 justify-center sm:justify-start">
          <PlayButton
            className="w-16 h-16 mr-6"
            onClick={handlePlayFromStart}
          />
        </div>
        <PlayerListEpisode
          episodes={episodes}
          handlePlayEpisode={handlePlayEpisode}
          handleNext={() => setNextUrl(pageData.next)}
          hasMore={!!pageData.next}
        />
      </div>
    </div>
  );
};

export default CollectionEpisodePage;

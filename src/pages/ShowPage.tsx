import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Show from '../types/Show';
import ApiSpotify from '../utils/api-spotify';
import { AuthContext } from '../context/auth-context';
import { PlayerContext } from '../context/player-context';
import useFetchTracks from '../hooks/useFetchTracks';

import PlayerListHeader from '../components/PlayerList/PlayerListHeader';
import PlayerListEpisode from '../components/PlayerList/PlayerListEpisode';
import FolllowButton from '../components/Button/FollowButton';

const ShowPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [show, setShow] = useState<Show>(Object);
  const [isFollowed, setIsFollowed] = useState(false);

  const { user } = useContext(AuthContext);
  const { togglePlay } = useContext(PlayerContext);

  useEffect(() => {
    const fetchShow = async () => {
      const [dataShow, dataFollowed] = await Promise.all([
        ApiSpotify.get('/shows/' + params.id),
        ApiSpotify.get('/me/shows/contains', {
          params: {
            ids: params.id,
          },
        }),
      ]);

      setShow(dataShow.data);
      setIsFollowed(dataFollowed.data[0]);
    };
    fetchShow();
  }, [params.id, user.id]);

  const { setNextUrl, tracks: episodes, pageData } = useFetchTracks(
    '/shows/' + params.id + '/episodes'
  );

  const handleFollow = async () => {
    let response;
    if (isFollowed) {
      response = await ApiSpotify.delete('/me/shows', {
        params: {
          ids: show.id,
        },
      });
    } else {
      response = await ApiSpotify.put('/me/shows', {}, {
        params: {
          ids: show.id,
        },
      });
    }
    if (response.status === 200) {
      setIsFollowed((prevState) => !prevState);
    }
  };

  const handlePlayEpisode = (
    selectedOffset: number,
    selectedPositionMs: number
  ) => {
    const episodeUris = episodes.map((v) => v.uri);
    togglePlay(episodeUris, selectedOffset, selectedPositionMs);
  };

  return (
    <div className="">
      {show.id ? (
        <div className="px-4 py-4">
          <PlayerListHeader
            image={show.images && show.images[0].url}
            name={show.name}
            type="PODCAST"
            footer={[show.publisher, `${show.total_episodes} episodes`]}
          />
          <div className="flex items-center mb-8 justify-center sm:justify-start">
            <FolllowButton
              isFollowed={isFollowed}
              onClick={handleFollow}
            />
          </div>

          <div className="flex flex-col-reverse md:grid grid-cols-12 gap-6">
            <div className="md:col-span-8">
              <div className="text-lg font-bold mb-4">All Episode</div>
              <PlayerListEpisode
                episodes={episodes}
                handlePlayEpisode={handlePlayEpisode}
                handleNext={() => setNextUrl(pageData.next)}
                hasMore={!!pageData.next}
              />
            </div>
            <div className="md:col-span-4">
              <div className="text-lg font-bold mb-4">About</div>
              <div className="font-light">{show.description}</div>
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default ShowPage;

import { useState, useEffect, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Episode from '../types/Episode';
import ApiSpotify from '../utils/api-spotify';
import { useDispatch } from 'react-redux';
import { togglePlay } from '../store/player-slice';
import { AuthContext } from '../context/auth-context';
import {
  MdAddCircle,
  MdCheck,
} from 'react-icons/md';

import PlayerListHeader from '../components/PlayerList/PlayerListHeader';
import PlayButton from '../components/Button/PlayButton';
import Button from '../components/Button/Button';
import TextLink from '../components/Text/TextLink';
import { duration, formatDate } from '../utils/helpers';

const EpisodePage: React.FC = () => {
  const dispatch = useDispatch();
  const params = useParams<{ id: string }>();
  const history = useHistory();
  const [episode, setEpisode] = useState<Episode>(Object);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        setIsLoading(true);
        const [dataEpisode, dataSaved] = await Promise.all([
          ApiSpotify.get('/episodes/' + params.id),
          ApiSpotify.get('/me/episodes/contains', {
            params: {
              ids: params.id,
            },
          }),
        ]);
  
        setEpisode(dataEpisode.data);
        setIsSaved(dataSaved.data[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEpisode();
  }, [params.id, user.id]);

  const handleSave = async () => {
    let response;
    if (isSaved) {
      response = await ApiSpotify.delete('/me/episodes', {
        params: {
          ids: episode.id,
        },
      });
    } else {
      response = await ApiSpotify.put('/me/episodes', {}, {
        params: {
          ids: episode.id,
        },
      });
    }
    if (response.status === 200) {
      setIsSaved((prevState) => !prevState);
    }
  };

  const handlePlayEpisode = () => {
    dispatch(togglePlay({
      uris: [episode.uri],
    }));
  };

  return (
    <div className="px-4 py-4">
      <PlayerListHeader
        image={episode.images && episode.images[0]?.url}
        name={episode.name}
        type="PODCAST EPISODE"
        footer={[
          <TextLink
            text={episode.show?.name}
            url={'/show/' + episode.show?.id}
          />,
        ]}
        isLoading={isLoading}
      />
      <div className="mb-4">
        <div className="text-sm">
          {formatDate(episode.release_date, 'MMM YY')} · {duration(episode.duration_ms, true, true)}
        </div>
      </div>
      <div className="flex items-center justify-center sm:justify-start mb-4">
        <PlayButton
          className="w-16 h-16 mr-6"
          onClick={handlePlayEpisode}
        />
        {isSaved ? (
          <MdCheck
            className="mr-4 w-10 h-10 cursor-pointer text-green-400"
            onClick={handleSave}
          />
        ) : (
          <MdAddCircle
            className="mr-4 w-10 h-10 cursor-pointer"
            onClick={handleSave}
          />
        )}
      </div>

      <div className="">
        <div className="w-8/12">
          <div className="text-lg font-bold mb-4">Episode Description</div>
          <div className="font-light mb-4">{episode.description}</div>
          <Button
            text="SEE ALL EPISODES"
            onClick={() => history.push('/show/' + episode.show.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default EpisodePage;

import { useState, useEffect, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Episode from '../types/Episode';
import ApiSpotify from '../utils/api-spotify';
import { useDispatch, useSelector } from 'react-redux';
import { changeIsSaved, togglePlay } from '../store/player-slice';
import { AuthContext } from '../context/auth-context';
import {
  MdAddCircle,
  MdCheckCircle,
} from 'react-icons/md';

import PlayerListHeader from '../components/PlayerList/PlayerListHeader';
import PlayButton from '../components/Button/PlayButton';
import Button from '../components/Button/Button';
import TextLink from '../components/Text/TextLink';
import { duration, formatDate } from '../utils/helpers';
import { addToSavedTrack, removeFromSavedTrack, setSavedTrackIds } from '../store/playlist-slice';
import { RootState } from '../store';
import HtmlDescription from '../components/Text/HtmlDescription';

const EpisodePage: React.FC = () => {
  const dispatch = useDispatch();
  const params = useParams<{ id: string }>();
  const history = useHistory();
  const [episode, setEpisode] = useState<Episode>(Object);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { user } = useContext(AuthContext);

  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const savedTrackIds = useSelector((state: RootState) => state.playlist.savedTrackIds);

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
        if (dataSaved.data[0]) setSavedTrackIds(dataEpisode.data.id);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEpisode();
  }, [params.id, user.id]);

  const handleSave = () => {
    dispatch(addToSavedTrack({ type: 'episode', trackId: episode.id }));
    currentTrack.id === episode.id && dispatch(changeIsSaved(true));
  };

  const handleRemove = () => {
    dispatch(removeFromSavedTrack({ type: 'episode', trackId: episode.id }));
    currentTrack.id === episode.id && dispatch(changeIsSaved(false));
  };

  const handlePlayEpisode = () => {
    dispatch(togglePlay({
      uris: [episode.uri],
      offset: 0,
    }));
  };

  return (
    <div className="sm:p-4 p-2">
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
        <div className="text-sm text-center sm:text-left">
          {formatDate(episode.release_date, 'MMM YY')} · {duration(episode.duration_ms, true, true)}
        </div>
      </div>
      <div className="flex items-center justify-center sm:justify-start mb-4">
        <PlayButton
          className="w-16 h-16 mr-6"
          onClick={handlePlayEpisode}
        />
        {savedTrackIds.includes(episode.id) ? (
          <MdCheckCircle
            className="mr-4 w-10 h-10 cursor-pointer text-green-400"
            onClick={handleRemove}
          />
        ) : (
          <MdAddCircle
            className="mr-4 w-10 h-10 cursor-pointer"
            onClick={handleSave}
          />
        )}
      </div>

      <div className="w-full sm:w-8/12 md:w-6/12">
        <div className="text-xl font-bold mb-4">Episode Description</div>
        <HtmlDescription
          className="mb-4"
          description={episode.html_description}
          uri={episode.uri}
        />
        <div className="text-center sm:text-left">
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

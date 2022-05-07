import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '../utils/toast';
import { useDispatch } from 'react-redux';
import { togglePlay } from '../store/player-slice';
import { AuthContext } from '../context/auth-context';
import Album from '../types/Album';
import ApiSpotify from '../utils/api-spotify';
import { duration, makeRequest } from '../utils/helpers';
import useFetchTracks from '../hooks/useFetchTracks';

import PlayerListHeader from '../components/PlayerList/PlayerListHeader';
import PlayerListTrack from '../components/PlayerList/PlayerListTrack';
import PlayButton from '../components/Button/PlayButton';
import TextLink from '../components/Text/TextLink';
import FolllowButton from '../components/Button/FollowButton';

const AlbumPage: React.FC = () => {
  const dispatch = useDispatch();
  const params = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album>(Object);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { isLoggedIn } = useContext(AuthContext);

  const { setNextUrl, tracks, pageData } = useFetchTracks(
    '/albums/' + params.id + '/tracks'
  );

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        setIsLoading(true);
        const dataAlbum = await makeRequest('/albums/' + params.id, {}, isLoggedIn);
        setAlbum(dataAlbum.data);

        if (isLoggedIn) {
          const dataFollowed = await ApiSpotify.get('/me/albums/contains', {
            params: {
              ids: params.id,
            },
          });
          setIsFollowed(dataFollowed.data[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbum();
  }, [params.id, isLoggedIn]);

  const handleFollow = async () => {
    let response;
    let toastMessage = '';
    if (isFollowed) {
      response = await ApiSpotify.delete('/me/albums', {
        params: {
          ids: album.id,
        },
      });
      toastMessage = 'Removed from Your Library';
    } else {
      response = await ApiSpotify.put('/me/albums', {}, {
        params: {
          ids: album.id,
        },
      });
      toastMessage = 'Saved to Your Library';
    }
    if (response.status === 200) {
      setIsFollowed((prevState) => !prevState);
      toast.info(toastMessage);
    }
  };

  const handlePlayFromStart = () => {
    dispatch(togglePlay({
      uris: [album.uri],
      offset: 0,
    }));
  };

  const totalDuration = tracks.reduce((acc, curr) => {
    return acc + curr.duration_ms;
  }, 0);

  const artists = album.artists || [];
  return (
    <div className="sm:p-4 p-2">
      <div className="mb-4">
        <PlayerListHeader
          image={album.images && album.images[0]?.url}
          name={album.name}
          type={album.album_type?.toUpperCase()}
          footer={[
            ...artists.map((artist) => (
              <TextLink text={artist.name} url={'/artist/' + artist.id} />
            )),
            `${album.total_tracks} songs, ${duration(totalDuration, true)}`,
          ]}
          isLoading={isLoading}
        />
      </div>
      <div className="flex items-center justify-center sm:justify-start mb-4">
        <PlayButton
          className="w-16 h-16 mr-6"
          onClick={handlePlayFromStart}
        />
        <FolllowButton
          isFollowed={isFollowed}
          onClick={handleFollow}
        />
      </div>
      <PlayerListTrack
        tracks={tracks}
        uris={[album.uri]}
        handleNext={() => setNextUrl(pageData.next)}
        hasMore={!!pageData.next}
      />
    </div>
  );
};

export default AlbumPage;

import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { PlayerContext } from '../context/player-context';
import { AuthContext } from '../context/auth-context';
import Album from '../types/Album';
import ApiSpotify from '../utils/api-spotify';
import { duration, makeRequest } from '../utils/helpers';
import useFetchTracks from '../hooks/useFetchTracks';

import PlayerListHeader from '../components/PlayerList/PlayerListHeader';
import PlayerListTrack from '../components/PlayerList/PlayerListTrack';
import PlayButton from '../components/Button/PlayButton';
import TextLink from '../components/Link/TextLink';
import FolllowButton from '../components/Button/FollowButton';

const AlbumPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album>(Object);
  const [isFollowed, setIsFollowed] = useState(false);

  const { currentTrack, togglePlay } = useContext(PlayerContext);
  const { isLoggedIn } = useContext(AuthContext);

  const { setNextUrl, tracks, pageData } = useFetchTracks(
    '/albums/' + params.id + '/tracks'
  );

  useEffect(() => {
    const fetchAlbum = async () => {
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

    };
    fetchAlbum();
  }, [params.id, isLoggedIn]);

  const handleFollow = async () => {
    let response;
    if (isFollowed) {
      response = await ApiSpotify.delete('/me/albums', {
        params: {
          ids: album.id,
        },
      });
    } else {
      response = await ApiSpotify.put('/me/albums', null, {
        params: {
          ids: album.id,
        },
      });
    }
    if (response.status === 200) {
      setIsFollowed((prevState) => !prevState);
    }
  };

  const handlePlayFromStart = () => {
    togglePlay([album.uri], 0);
  };

  const handlePlayTrack = (
    selectedOffset: number,
    selectedPositionMs: number
  ) => {
    togglePlay([album.uri], selectedOffset, selectedPositionMs);
  };

  const totalDuration = tracks.reduce((acc, curr) => {
    return acc + curr.duration_ms;
  }, 0);

  return (
    <div className="">
      {album.id ? (
        <div className="px-4 py-4">
          <PlayerListHeader
            image={album.images && album.images[0]?.url}
            name={album.name}
            type={album.album_type?.toUpperCase()}
            footer={[
              ...album.artists.map((artist) => (
                <TextLink text={artist.name} url={'/artist/' + artist.id} />
              )),
              `${album.total_tracks} songs, ${duration(totalDuration, true)}`,
            ]}
          />
          <div className="flex items-center justify-center sm:justify-start">
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

export default AlbumPage;
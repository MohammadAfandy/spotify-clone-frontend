import { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Playlist from '../types/Playlist';
import Track from '../types/Track';
import Episode from '../types/Episode';
import ApiSpotify from '../utils/api-spotify';
import { AuthContext } from '../context/auth-context';
import { useDispatch } from 'react-redux';
import { togglePlay } from '../store/player-slice';
import { getUserPlaylist } from '../store/playlist-slice';
import { getHighestImage, duration, makeRequest } from '../utils/helpers';
import useFetchTracks from '../hooks/useFetchTracks';

import PlayerListHeader from '../components/PlayerList/PlayerListHeader';
import PlayerListTrack from '../components/PlayerList/PlayerListTrack';
import PlayerListTrackMini from '../components/PlayerList/PlayerListTrackMini';
import PlayButton from '../components/Button/PlayButton';
import LikeButton from '../components/Button/LikeButton';
import SearchInput from '../components/Input/SearchInput';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';
import PlayListForm from '../components/Form/PlayListForm';
import { MdClose } from 'react-icons/md';

const initialPlaylistForm = {
  id: '',
  name: '',
  description: '',
  image: '',
  isPublic: false,
  isOwn: false,
  previewImage: '',
};

const PlaylistPage: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const params = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist>(Object);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isOwnPlaylist, setIsOwnPlaylist] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [suggested, setSuggested] = useState<Track[]>([]);
  const [isShowFindPlaylist, setIsShowFindPlaylist] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [playlistForm, setPlaylistForm] = useState(initialPlaylistForm);

  const { isLoggedIn, user } = useContext(AuthContext);

  const { setNextUrl, tracks, pageData, forceUpdate } = useFetchTracks(
    '/playlists/' + params.id + '/tracks'
  );

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setIsLoading(true);
        const dataPlaylist = await makeRequest('/playlists/' + params.id, {}, isLoggedIn);
        if (isLoggedIn) {
          const dataFollowed = await ApiSpotify.get('/playlists/' + params.id + '/followers/contains', {
            params: {
              ids: user.id,
            },
          });
          setIsFollowed(dataFollowed.data[0]);
        }
  
        setPlaylist(dataPlaylist.data);
        setIsOwnPlaylist(dataPlaylist.data.owner.id === user.id);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!isOpenModal) fetchPlaylist();
  }, [params.id, user.id, isLoggedIn, isOpenModal]);

  useEffect(() => {
    const fetchSearch = async () => {
      if (searchText.trim() !== '') {
        const response = await ApiSpotify.get('/search', {
          params: {
            q: searchText,
            type: 'track,episode',
            limit: 20,
          },
        });

        // sometimes the api return null in the items array
        const suggestedTracks = response.data.tracks.items.filter(
          (v: Track) => v != null
        );
        const suggestedEpisodes = response.data.episodes.items.filter(
          (v: Track) => v != null
        );
        const allSuggested = suggestedTracks.concat(suggestedEpisodes);
        setSuggested(
          allSuggested.filter((v: Track) => {
            return tracks.map((pl) => pl.uri).includes(v.uri) === false;
          })
        );
      } else {
        setSuggested([]);
      }
    };
    const timer = setTimeout(() => {
      fetchSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, tracks]);

  const handleFollow = async () => {
    let response;
    if (isFollowed) {
      response = await ApiSpotify.delete(
        '/playlists/' + params.id + '/followers'
      );
    } else {
      response = await ApiSpotify.put('/playlists/' + params.id + '/followers');
    }
    if (response.status === 200) {
      setIsFollowed((prevState) => !prevState);
      dispatch(getUserPlaylist());
    }
  };

  const handlePlayFromStart = () => {
    dispatch(togglePlay({
      uris: [playlist.uri],
    }));
  };

  const handlePlaySuggestedTrack = (uri: string) => {
    dispatch(togglePlay({
      uris: [uri],
    }));
  };

  const handleAddTrackToPlaylist = async (trackUri: string) => {
    const params = {
      uris: trackUri,
    };
    await ApiSpotify.post('/playlists/' + playlist.id + '/tracks', {}, {
      params,
    });
    forceUpdate();
  };

  const totalDuration = tracks.reduce((acc, curr) => {
    return acc + curr.duration_ms;
  }, 0);

  

  const handleRemoveFromPlaylist = async ({
    playlistId,
    uri,
    position,
  }: {
    playlistId: string,
    uri: string,
    position?: number,
  }) => {
    const body = {
      tracks: [
        {
          uri,
          positions: position !== undefined ? [position] : undefined,
        },
      ],
    };
    await ApiSpotify.delete('/playlists/' + playlist.id + '/tracks', {
      data: body,
    });
    forceUpdate();
  };

  const handleEditPlaylist = async () => {
    const response = await ApiSpotify.get('/playlists/' + params.id);
    setPlaylistForm((prevState) => ({
      ...prevState,
      id: response.data.id,
      name: response.data.name,
      description: response.data.description,
      image: getHighestImage(response.data.images),
      isPublic: response.data.public,
      isOwn: response.data.owner.id === user.id,
    }));
    setIsOpenModal(true);
  };

  const handleCloseModal = () => {
    setPlaylistForm((prevState) => ({
      ...prevState,
      ...initialPlaylistForm,
    }));
    setIsOpenModal(false);
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <PlayerListHeader
          image={getHighestImage(playlist.images)}
          name={playlist.name}
          type="PLAYLIST"
          description={playlist.description}
          footer={[
            playlist.owner?.display_name,
            `${playlist.followers?.total.toLocaleString()} likes`,
            `${playlist.tracks?.total} songs, ${duration(
              totalDuration,
              true
            )}`,
          ]}
          isLoading={isLoading}
        />
      </div>
      <div className="flex items-center justify-center sm:justify-start mb-4">
        <PlayButton
          className="w-16 h-16"
          onClick={handlePlayFromStart}
        />
        {isOwnPlaylist ? (
          <Button
            className="ml-6"
            text="Edit Playlist"
            onClick={handleEditPlaylist}
          />
        ) : (
          <LikeButton
            className="w-8 h-8 ml-6"
            onClick={handleFollow}
            isActive={isFollowed}
          />
        )}
      </div>
      <div className="mb-4">
        <PlayerListTrack
          tracks={tracks}
          showAlbum
          showDateAdded
          uris={[playlist.uri]}
          handleNext={() => setNextUrl(pageData.next)}
          hasMore={!!pageData.next}
          isIncludeEpisode
          handleRemoveFromPlaylist={handleRemoveFromPlaylist}
        />
      </div>

      {isOwnPlaylist && !isShowFindPlaylist && (
        <div
          className="flex w-full justify-end cursor-pointer"
          onClick={() => setIsShowFindPlaylist(true)}
        >
          Find More
        </div>
      )}

      {isOwnPlaylist && (isShowFindPlaylist) && (
        <div className="mb-4 py-2 border-t-2 border-opacity-10 border-gray-500">
          <div className="flex justify-between items-center">
            <div className="font-bold text-xl mb-2">
              Let's find something for your playlist
            </div>
            <MdClose className="w-4 h-4" onClick={() => setIsShowFindPlaylist(false)} />
          </div>
          <div className="font-bold text-xl mb-4">
            <SearchInput
              className="bg-light-black-2 text-white w-3/4 md:w-96 text-sm"
              placeholder="Search for songs or episodes"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onClearValue={(e) => setSearchText('')}
            />
          </div>
          {suggested.length > 0 && (
            <>
              {suggested.map((suggest) => (
                <PlayerListTrackMini
                  key={suggest.id}
                  track={suggest as Track & Episode}
                  handlePlayTrack={() =>
                    handlePlaySuggestedTrack(suggest.uri)
                  }
                  showAddLibrary
                  onAddToPlaylist={() =>
                    handleAddTrackToPlaylist(suggest.uri)
                  }
                />
              ))}
            </>
          )}
        </div>
      )}

      <Modal
        show={isOpenModal}
        title="Playlist"
        handleCloseModal={handleCloseModal}
      >
        <PlayListForm
          id={playlistForm.id}
          name={playlistForm.name}
          description={playlistForm.description}
          image={playlistForm.image}
          isPublic={playlistForm.isPublic}
          isOwn={playlistForm.isOwn}
          previewImage={playlistForm.previewImage}
          onSave={handleCloseModal}
          onDelete={() => {
            handleCloseModal();
            history.push('/collection/playlists')
          }}
        />
      </Modal>
    </div>
  );
};

export default PlaylistPage;

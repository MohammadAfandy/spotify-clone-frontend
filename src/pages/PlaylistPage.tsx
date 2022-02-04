import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Playlist from '../types/Playlist';
import Track from '../types/Track';
import Episode from '../types/Episode';
import ApiSpotify from '../utils/api-spotify';
import { AuthContext } from '../context/auth-context';
import { PlayerContext } from '../context/player-context';
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
  const params = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist>(Object);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isOwnPlaylist, setIsOwnPlaylist] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [suggested, setSuggested] = useState<Track[]>([]);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [playlistForm, setPlaylistForm] = useState(initialPlaylistForm);

  const { isLoggedIn, user, refreshPlaylists } = useContext(AuthContext);

  const { currentTrack, isPlaying, togglePlay, togglePause } = useContext(PlayerContext);

  const { setNextUrl, tracks, pageData, forceUpdate } = useFetchTracks(
    '/playlists/' + params.id + '/tracks'
  );
  

  useEffect(() => {
    const fetchPlaylist = async () => {
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
      refreshPlaylists();
    }
  };

  const handlePlayFromStart = () => {
    togglePlay([playlist.uri], 0);
  };

  const handlePlayTrack = (
    selectedOffset: number,
    selectedPositionMs: number
  ) => {
    togglePlay([playlist.uri], selectedOffset, selectedPositionMs);
  };

  const handlePauseTrack = () => {
    togglePause();
  };

  const handlePlaySuggestedTrack = (uri: string) => {
    togglePlay([uri], 0, 0);
  };

  const handleAddTrackToPlaylist = async (track: Track) => {
    const params = {
      uris: track.uri,
    };
    await ApiSpotify.post('/playlists/' + playlist.id + '/tracks', null, {
      params,
    });
    forceUpdate();
  };

  const totalDuration = tracks.reduce((acc, curr) => {
    return acc + curr.duration_ms;
  }, 0);

  const handleRemoveFromPlaylist = async (trackUri: string) => {
    const body = {
      tracks: [
        {
          uri: trackUri,
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
      {playlist.id ? (
        <>
          <div className="mb-4">
            <PlayerListHeader
              image={getHighestImage(playlist.images)}
              name={playlist.name}
              type="PLAYLIST"
              description={playlist.description}
              footer={[
                playlist.owner.display_name,
                `${playlist.followers.total.toLocaleString()} likes`,
                `${playlist.tracks.total} songs, ${duration(
                  totalDuration,
                  true
                )}`,
              ]}
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
          {tracks.length > 0 && (
            <div className="mb-4">
              <PlayerListTrack
                tracks={tracks}
                showAlbum
                showDateAdded
                onRemoveFromPlaylist={
                  isOwnPlaylist ? handleRemoveFromPlaylist : undefined
                }
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                handlePlayTrack={handlePlayTrack}
                handlePauseTrack={handlePauseTrack}
                handleNext={() => setNextUrl(pageData.next)}
                hasMore={!!pageData.next}
                isIncludeEpisode
              />
            </div>
          )}

          {isOwnPlaylist && (
            <div className="mb-4 py-2 border-t-2 border-opacity-10 border-gray-500">
              <div className="font-bold text-xl mb-2">
                Let's find something for your playlist
              </div>
              <div className="font-bold text-xl">
                <div className="mb-4">
                  <SearchInput
                    className="bg-light-black-2 text-white w-96 text-sm"
                    placeholder="Search for songs or episodes"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
                {suggested.length > 0 && (
                  <>
                    {suggested.map((suggest) => (
                      <PlayerListTrackMini
                        track={suggest as Track & Episode}
                        handlePlayTrack={() =>
                          handlePlaySuggestedTrack(suggest.uri)
                        }
                        showAddLibrary
                        onAddToPlaylist={() =>
                          handleAddTrackToPlaylist(suggest)
                        }
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        ''
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
          onSuccess={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default PlaylistPage;

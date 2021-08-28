import { useEffect, useState, useContext } from 'react';
import { Edit2, Home, List, Music, Plus, Search, Trash } from 'react-feather';
import { AuthContext } from '../../context/auth-context';
import ApiSpotify from '../../utils/api-spotify';
import { EPISODE_LOGO_IMAGE, LIKED_SONG_IMAGE } from '../../utils/constants';
import { getHighestImage, toBase64 } from '../../utils/helpers';

import NavbarLink from './NavbarLink';
import NavbarItem from './NavbarItem';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';

const Navbar: React.FC = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  // form playlist
  const [playlistId, setPlaylistId] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [playlistImage, setPlaylistImage] = useState('');
  const [playlistIsPublic, setPlaylistIsPublic] = useState(false);
  const [isOwnPlaylist, setIsOwnPlaylist] = useState(false);

  const [previewImage, setPreviewImage] = useState('');

  const {
    isLoggedIn,
    user,
    playlists,
    refreshPlaylists
  } = useContext(AuthContext);

  useEffect(() => {
    if (isLoggedIn) {
      refreshPlaylists();
    }
  }, [isLoggedIn, refreshPlaylists]);

  const resetFormPlaylist = () => {
    setPlaylistName('');
    setPlaylistDescription('');
    setPlaylistImage('');
    setPlaylistId('');
    setPlaylistIsPublic(false);
    setIsOwnPlaylist(false);

    setPreviewImage('');
  };

  const handleSavePlaylist = async () => {
    if (playlistName.trim() === '') {
      return alert('Playlist name cannot empty');
    }
    let savedPlaylistId = '';
    const body = {
      name: playlistName,
      description: playlistDescription,
      public: playlistIsPublic,
    };
    if (playlistId) {
      // updating playlist
      await ApiSpotify.put('/playlists/' + playlistId, body);
      savedPlaylistId = playlistId;
    } else {
      // create new playlist
      const response = await ApiSpotify.post(
        '/users/' + user.id + '/playlists',
        body
      );
      savedPlaylistId = response.data.id;
    }

    if (previewImage) {
      await ApiSpotify.put(
        '/playlists/' + savedPlaylistId + '/images',
        previewImage.replace('data:image/jpeg;base64,', ''),
        {
          headers: {
            'Content-Type': 'image/jpeg',
          },
        }
      );
    }
    handleCloseModal();
    refreshPlaylists();
  };

  // delete here just meant we unfollow our playlist, because no endpoint to delete playlist
  // https://stackoverflow.com/questions/11015369/delete-spotify-playlist-programmatically
  const handleDeletePlaylist = async () => {
    await ApiSpotify.delete('/playlists/' + playlistId + '/followers');
    handleCloseModal();
    refreshPlaylists();
  };

  const handleEditPlaylist = async (
    event: React.MouseEvent,
    playlistId: string
  ) => {
    event.preventDefault();
    const response = await ApiSpotify.get('/playlists/' + playlistId);
    setPlaylistId(response.data.id);
    setPlaylistName(response.data.name);
    setPlaylistDescription(response.data.description);
    setPlaylistImage(getHighestImage(response.data.images));
    setPlaylistIsPublic(response.data.public);
    setIsOwnPlaylist(response.data.owner.id === user.id);
    setIsOpenModal(true);
  };

  const handleCloseModal = () => {
    resetFormPlaylist();
    setIsOpenModal(false);
  };

  // unfortunately, we cannot delete image from our playlist, we only can change it
  const handleDeleteImage = async () => {
    setPreviewImage('');
    setPlaylistImage('');
  };

  const handleUploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 256000) {
        return alert('File size too big. max 256 KB');
      }
      if (file.type !== 'image/jpeg') {
        return alert('File must be a jpeg');
      }
      const image = await toBase64(file);
      if (typeof image === 'string') {
        setPreviewImage(image);
      }
    }
  };

  const imageContainer = (
    imageUri: string,
    alt: string,
    showDelete: boolean
  ) => (
    <>
      {showDelete && (
        <div
          className="absolute top-2 right-2 group-hover:block hidden rounded-xl bg-light-black-2 p-2 cursor-pointer z-10"
          onClick={handleDeleteImage}
        >
          <Trash className="w-4 h-4" />
        </div>
      )}
      <img
        src={imageUri}
        alt={alt}
        className="w-full h-full group-hover:opacity-20"
        draggable="false"
      />
    </>
  );

  return (
    <nav
      className="fixed flex flex-col bg-black w-52 pr-2 pt-5"
      style={{ height: 'calc(100vh - 6rem)' }}
    >
      <div className="px-6 mb-8 text-2xl">Spotify Clone</div>
      <div className="mb-4">
        <ul>
          <NavbarLink to="/" Icon={<Home />} text="Home" />
          <NavbarLink to="/search" Icon={<Search />} text="Search" />
          <div
            data-tip="library"
            data-for="login-tooltip"
            data-event="click"
          >
            {isLoggedIn ? (
              <NavbarLink
                to="/collection/playlists"
                Icon={<List />}
                text="Your Library"
              />
            ) : (
              <NavbarItem
                Icon={<List />}
                text="Your Library"
              />
            )}
          </div>
        </ul>
      </div>
      <div className="mb-2">
        <ul>
          <div
            data-tip="create-playlist"
            data-for="login-tooltip"
            data-event="click"
          >
            <NavbarItem
              Icon={<Plus />}
              text="Create Playlist"
              onClick={() => setIsOpenModal(true)}
            />
          </div>
          <div
            data-tip="collection"
            data-for="login-tooltip"
            data-event="click"
          >
            {isLoggedIn ? (
              <NavbarLink
                to="/collection/tracks"
                image={LIKED_SONG_IMAGE}
                text="Liked Song"
              />
            ) : (
              <NavbarItem
                image={LIKED_SONG_IMAGE}
                text="Liked Song"
              />
            )}
          </div>
          <div
            data-tip="collection"
            data-for="login-tooltip"
            data-event="click"
          >
            {isLoggedIn ? (
              <NavbarLink
                to="/collection/episodes:"
                image={EPISODE_LOGO_IMAGE}
                text="Your Episode"
              />
            ) : (
              <NavbarItem
                image={EPISODE_LOGO_IMAGE}
                text="Your Episode"
              />
            )}
          </div>
        </ul>
      </div>
      <div className="mb-4 border-t-white border-t-2 border-opacity-30" />
      <div className="overflow-auto h-48">
        <ul>
          {playlists.map((playlist) => (
            <NavbarLink
              key={playlist.id}
              to={'/playlist/' + playlist.id}
              text={playlist.name}
              onClickEdit={(e) => handleEditPlaylist(e, playlist.id)}
              editable={playlist.owner.id === user.id}
            />
          ))}
        </ul>
      </div>

      <Modal
        show={isOpenModal}
        title="Create Playlist"
        handleCloseModal={handleCloseModal}
      >
        <div className="flex h-52">
          <div
            className={`group relative flex justify-center items-center w-80 h-48 bg-light-black-2 rounded-md mr-4`}
          >
            <label htmlFor="input-image">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:block hidden cursor-pointer z-10 w-full text-center">
                <Edit2 className="w-8 h-8 mx-auto" />
                Choose Photo
              </div>
            </label>
            <input
              className="hidden"
              id="input-image"
              type="file"
              accept="image/jpeg"
              onChange={handleUploadImage}
            />
            {previewImage ? (
              imageContainer(previewImage, 'preview', true)
            ) : playlistImage ? (
              imageContainer(playlistImage, playlistName, false)
            ) : (
              <Music className="w-24 h-24 group-hover:hidden block" />
            )}
          </div>
          <div className="flex flex-col w-full">
            <input
              onChange={(e) => setPlaylistName(e.target.value)}
              value={playlistName}
              type="text"
              placeholder="My Playlist"
              className="bg-light-black-2 font-bold p-3 mb-4 rounded-xl outline-none"
            />
            <textarea
              onChange={(e) => setPlaylistDescription(e.target.value)}
              value={playlistDescription}
              style={{ resize: 'none' }}
              placeholder="Add an optional Description"
              className="h-full font-bold bg-light-black-2 p-3 mb-4 rounded-xl outline-none"
            />
          </div>
        </div>
        <div className="text-right mr-2 mb-2">
          <input
            type="checkbox"
            id="is-public"
            checked={playlistIsPublic}
            onChange={(e) => setPlaylistIsPublic(e.target.checked)}
          />
          <label htmlFor="is-public"> Add to Profile</label>
        </div>
        <div className="text-xs mb-2">
          By proceeding, you agree to give Spotify access to the image you
          choose to upload. Please make sure you have the right to upload the
          image.
        </div>
        <div className="flex justify-end">
          {playlistId && isOwnPlaylist && (
            <Button
              className="mr-2"
              text="Delete"
              onClick={handleDeletePlaylist}
              color="red"
            />
          )}
          <Button text="Save" onClick={handleSavePlaylist} color="green" />
        </div>
      </Modal>
    </nav>
  );
};

export default Navbar;

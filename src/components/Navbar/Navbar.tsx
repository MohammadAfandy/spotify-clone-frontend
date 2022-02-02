import { useEffect, useState, useContext } from 'react';
import {
  MdHomeFilled,
  MdSearch,
  MdOutlineQueueMusic,
  MdAddBox,
  MdClose,
} from 'react-icons/md';
import { AuthContext } from '../../context/auth-context';
import ApiSpotify from '../../utils/api-spotify';
import { EPISODE_LOGO_IMAGE, LIKED_SONG_IMAGE } from '../../utils/constants';
import { getHighestImage } from '../../utils/helpers';

import NavbarLink from './NavbarLink';
import NavbarItem from './NavbarItem';
import Modal from '../Modal/Modal';
import PlayListForm from '../Form/PlayListForm';
// import Button from '../Button/Button';

import styles from './Navbar.module.css';

type NavbarProps = {
  isNavOpen: boolean;
  handleIsNavOpen: (state: boolean) => void;
};

const initialPlaylistForm = {
  id: '',
  name: '',
  description: '',
  image: '',
  isPublic: false,
  isOwn: false,
  previewImage: '',
};

const Navbar: React.FC<NavbarProps> = ({ isNavOpen, handleIsNavOpen }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [playlistForm, setPlaylistForm] = useState(initialPlaylistForm);

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

  const handleEditPlaylist = async (
    event: React.MouseEvent,
    playlistId: string
  ) => {
    event.preventDefault();
    const response = await ApiSpotify.get('/playlists/' + playlistId);
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
    <nav className={`content-area ${styles.navbar} ${isNavOpen ? styles.open : ''}`}>
      <div className="flex items-center px-6 mb-8 text-2xl">
        <div className="mr-auto">Spotify Clone</div>
        <MdClose
          className="block sm:hidden"
          onClick={() => handleIsNavOpen(false)}
        />
      </div>
      <div className="mb-4">
        <ul>
          <NavbarLink
            to="/"
            Icon={<MdHomeFilled className="w-6 h-6" />}
            text="Home"
            onClick={() => handleIsNavOpen(false)}
          />
          <NavbarLink
            to="/search"
            Icon={<MdSearch className="w-6 h-6" />}
            text="Search"
            onClick={() => handleIsNavOpen(false)}
          />
          <div
            data-tip="library"
            data-for="login-tooltip"
            data-event="click"
            data-place="right"
          >
            {isLoggedIn ? (
              <NavbarLink
                to="/collection/playlists"
                Icon={<MdOutlineQueueMusic className="w-6 h-6" />}
                text="Your Library"
                onClick={() => handleIsNavOpen(false)}
              />
            ) : (
              <NavbarItem
                Icon={<MdOutlineQueueMusic className="w-6 h-6" />}
                text="Your Library"
                onClick={() => handleIsNavOpen(false)}
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
            data-place="right"
          >
            <NavbarItem
              Icon={<MdAddBox className="w-6 h-6" />}
              text="Create Playlist"
              onClick={() => {
                setIsOpenModal(true);
                handleIsNavOpen(false);
              }}
            />
          </div>
          <div
            data-tip="collection"
            data-for="login-tooltip"
            data-event="click"
            data-place="right"
          >
            {isLoggedIn ? (
              <NavbarLink
                to="/collection/tracks"
                image={LIKED_SONG_IMAGE}
                text="Liked Song"
                onClick={() => handleIsNavOpen(false)}
              />
            ) : (
              <NavbarItem
                image={LIKED_SONG_IMAGE}
                text="Liked Song"
                onClick={() => handleIsNavOpen(false)}
              />
            )}
          </div>
          <div
            data-tip="collection"
            data-for="login-tooltip"
            data-event="click"
            data-place="right"
          >
            {isLoggedIn ? (
              <NavbarLink
                to="/collection/episodes"
                image={EPISODE_LOGO_IMAGE}
                text="Your Episode"
                onClick={() => handleIsNavOpen(false)}
              />
            ) : (
              <NavbarItem
                image={EPISODE_LOGO_IMAGE}
                text="Your Episode"
                onClick={() => handleIsNavOpen(false)}
              />
            )}
          </div>
        </ul>
      </div>
      <div className="mb-4 border-t-white border-t-2 border-opacity-30" />
      <div className="overflow-auto">
        <ul>
          {playlists.map((playlist) => (
            <NavbarLink
              key={playlist.id}
              to={'/playlist/' + playlist.id}
              text={playlist.name}
              onClickEdit={(e) => handleEditPlaylist(e, playlist.id)}
              editable={playlist.owner.id === user.id}
              onClick={() => handleIsNavOpen(false)}
            />
          ))}
        </ul>
      </div>

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
    </nav>
  );
};

export default Navbar;

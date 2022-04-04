import { useEffect, useState, useContext } from 'react';
import {
  MdHomeFilled,
  MdSearch,
  MdLibraryMusic,
  MdAddBox,
  MdOutlineRecommend,
} from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import { getUserPlaylist } from '../../store/playlist-slice';
import { RootState } from '../../store';
import { AuthContext } from '../../context/auth-context';
import ApiSpotify from '../../utils/api-spotify';
import { APP_NAME, EPISODE_LOGO_IMAGE, LIKED_SONG_IMAGE } from '../../utils/constants';
import { getHighestImage } from '../../utils/helpers';

import NavbarLink from './NavbarLink';
import NavbarItem from './NavbarItem';
import Modal from '../Modal/Modal';
import PlayListForm, { initialPlaylistForm } from '../Form/PlayListForm';

import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [playlistForm, setPlaylistForm] = useState(initialPlaylistForm);

  const playlists = useSelector((state: RootState) => state.playlist.items);
  const {
    isLoggedIn,
    user,
  } = useContext(AuthContext);

  useEffect(() => {
    let interval:NodeJS.Timer;
    if (isLoggedIn) {
      dispatch(getUserPlaylist());
      interval = setInterval(() => {
        dispatch(getUserPlaylist());
      }, 30 * 1000);
    }

    return () => clearInterval(interval);
  }, [isLoggedIn, dispatch]);

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
    <nav className={`content-area ${styles.navbar}`}>
      <div className="flex items-center px-6 mb-4 text-2xl">
        <div className="mr-auto">{APP_NAME}</div>
      </div>
      <div className="mb-4">
        <ul>
          <NavbarLink
            to="/"
            Icon={<MdHomeFilled className="w-6 h-6" />}
            text="Home"
          />
          <NavbarLink
            to="/search"
            Icon={<MdSearch className="w-6 h-6" />}
            text="Search"
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
                Icon={<MdLibraryMusic className="w-6 h-6" />}
                text="Your Library"
              />
            ) : (
              <NavbarItem
                Icon={<MdLibraryMusic className="w-6 h-6" />}
                text="Your Library"
              />
            )}
          </div>
          <NavbarLink
            to="/recommendations"
            Icon={<MdOutlineRecommend className="w-6 h-6" />}
            text="Recommendations"
          />
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
            data-place="right"
          >
            {isLoggedIn ? (
              <NavbarLink
                to="/collection/episodes"
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
      <div className="overflow-auto">
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
          onDelete={handleCloseModal}
        />
      </Modal>
    </nav>
  );
};

export default Navbar;

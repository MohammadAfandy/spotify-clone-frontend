import { useState, useContext } from 'react';
import { FiMusic } from 'react-icons/fi';
import { MdModeEditOutline, MdDeleteOutline } from 'react-icons/md';
import { AuthContext } from '../../context/auth-context';
import { toBase64 } from '../../utils/helpers';
import ApiSpotify from '../../utils/api-spotify';
import Button from '../Button/Button';

type PlayListFormProps = {
  className?: string;
  id?: string;
  name?: string;
  description?: string;
  image?: string;
  isPublic?: boolean;
  isOwn?: boolean;
  previewImage?: string;
  onSuccess?: () => void;
};

const defaultProps: PlayListFormProps = {
  className: '',
  id: '',
  name: '',
  description: '',
  image: '',
  isPublic: false,
  isOwn: false,
  previewImage: '',
  onSuccess: () => {},
};

const PlayListForm: React.FC<PlayListFormProps> = ({
  className,
  id,
  name,
  description,
  image,
  isPublic,
  isOwn,
  previewImage,
  onSuccess,
}) => {

  // form playlist
  const [playlistName, setPlaylistName] = useState(name);
  const [playlistDescription, setPlaylistDescription] = useState(description);
  const [playlistImage, setPlaylistImage] = useState(image);
  const [playlistIsPublic, setPlaylistIsPublic] = useState(isPublic);

  const [playlistPreviewImage, setPlaylistPreviewImage] = useState(previewImage);

  const {
    user,
    refreshPlaylists
  } = useContext(AuthContext);

  const handleSavePlaylist = async () => {
    if (!playlistName || playlistName.trim() === '') {
      return alert('Playlist name cannot empty');
    }
    let savedPlaylistId = '';
    const body = {
      name: playlistName,
      description: playlistDescription,
      public: playlistIsPublic,
    };
    if (id) {
      // updating playlist
      await ApiSpotify.put('/playlists/' + id, body);
      savedPlaylistId = id;
    } else {
      // create new playlist
      const response = await ApiSpotify.post(
        '/users/' + user.id + '/playlists',
        body
      );
      savedPlaylistId = response.data.id;
    }

    if (playlistPreviewImage) {
      await ApiSpotify.put(
        '/playlists/' + savedPlaylistId + '/images',
        playlistPreviewImage.replace('data:image/jpeg;base64,', ''),
        {
          headers: {
            'Content-Type': 'image/jpeg',
          },
        }
      );
    }
    refreshPlaylists();
    if (onSuccess) onSuccess();
  };

  // delete here just meant we unfollow our playlist, because no endpoint to delete playlist
  // https://stackoverflow.com/questions/11015369/delete-spotify-playlist-programmatically
  const handleDeletePlaylist = async () => {
    await ApiSpotify.delete('/playlists/' + id + '/followers');
    refreshPlaylists();
    if (onSuccess) onSuccess();
  };

  // unfortunately, we cannot delete image from our playlist, we only can change it
  const handleDeleteImage = async () => {
    setPlaylistPreviewImage('');
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
        setPlaylistPreviewImage(image);
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
          className="absolute top-2 right-2 group-hover:block hidden rounded-md bg-light-black-2 p-2 cursor-pointer z-10"
          onClick={handleDeleteImage}
        >
          <MdDeleteOutline className="w-4 h-4" />
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
    <>
      <div className="flex flex-col items-center sm:flex-row sm:items-start">
        <div
          className="group relative flex justify-center items-center w-52 sm:w-80 h-48 bg-light-black-2 rounded-md sm:mr-4"
        >
          <label htmlFor="input-image">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:block hidden cursor-pointer z-10 w-full text-center">
              <MdModeEditOutline className="w-8 h-8 mx-auto" />
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
          {playlistPreviewImage ? (
            imageContainer(playlistPreviewImage, 'preview', true)
          ) : playlistImage ? (
            imageContainer(playlistImage, playlistName || '', false)
          ) : (
            <FiMusic className="w-3/4 h-3/4 group-hover:hidden block" />
          )}
        </div>
        <div className="flex flex-col w-full mt-4 sm:mt-0">
          <input
            onChange={(e) => setPlaylistName(e.target.value)}
            value={playlistName}
            type="text"
            placeholder="My Playlist"
            className="bg-light-black-2 font-bold p-3 mb-4 rounded-md outline-none"
          />
          <textarea
            onChange={(e) => setPlaylistDescription(e.target.value)}
            value={playlistDescription}
            style={{ resize: 'none' }}
            placeholder="Add an optional Description"
            className="h-full font-bold bg-light-black-2 p-3 mb-4 rounded-md outline-none"
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
      <div className="flex justify-center sm:justify-end mt-4">
        {id && isOwn && (
          <Button
            className="mr-2"
            text="Delete"
            onClick={handleDeletePlaylist}
            color="red"
          />
        )}
        <Button
          text="Save"
          onClick={handleSavePlaylist}
          color="green"
        />
      </div>
    </>
  );
};

PlayListForm.defaultProps = defaultProps;

export default PlayListForm;

import { useState, useEffect, useContext, Fragment } from 'react';
import {
  MdAddCircle,
  MdPlayArrow,
  MdPause,
  MdCheck,
  MdOutlineMoreVert,
} from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';
import {
  SubMenu,
  MenuDivider,
  MenuButton,
  MenuItem,
} from '@szhsin/react-menu';
import Track from '../../types/Track';
import ApiSpotify from '../../utils/api-spotify';
import { getSmallestImage, duration, fromNow } from '../../utils/helpers';

import LikeButton from '../Button/LikeButton';
import ContextMenu from '../ContextMenu/ContextMenu';
import Explicit from '../Text/Explicit';
import TextLink from '../Text/TextLink';

type PlayerListTrackItemProps = {
  track: Track;
  offset: number;
  number: number;
  currentTrack: Track;
  isPlaying?: boolean;
  showAlbum?: boolean;
  showDateAdded?: boolean;
  onRemoveFromPlaylist?: (trackId: string) => void;
  handlePlayTrack: (offset: number, positionMs: number) => void;
  handlePauseTrack: () => void;
};

const defaultProps: PlayerListTrackItemProps = {
  track: {} as Track,
  offset: 0,
  number: 0,
  currentTrack: {} as Track,
  isPlaying: false,
  showAlbum: false,
  showDateAdded: false,
  onRemoveFromPlaylist: undefined,
  handlePlayTrack: (offset: number, positionMs: number) => {},
  handlePauseTrack: () => {},
};

const PlayerListTrackItem: React.FC<PlayerListTrackItemProps> = ({
  track,
  offset,
  number,
  currentTrack,
  isPlaying,
  showAlbum,
  showDateAdded,
  onRemoveFromPlaylist,
  handlePlayTrack,
  handlePauseTrack,
}) => {
  const history = useHistory();
  const [isSaved, setIsSaved] = useState(track.is_saved);
  const {
    user,
    playlists,
  } = useContext(AuthContext);

  useEffect(() => {
    setIsSaved(track.is_saved);
  }, [track.is_saved]);

  const handleAddToSavedTrack = async (id: string) => {
    const params = {
      ids: id,
    };
    let response;
    if (isSaved) {
      response = await ApiSpotify.delete('/me/tracks', { params });
    } else {
      response = await ApiSpotify.put('/me/tracks', {}, { params });
    }
    if (response.status === 200) {
      setIsSaved((prevState) => !prevState);
    }
  };

  const handleAddToSavedEpisode = async (id: string) => {
    const params = {
      ids: id,
    };
    let response;
    if (isSaved) {
      response = await ApiSpotify.delete('/me/episodes', { params });
    } else {
      response = await ApiSpotify.put('/me/episodes', {}, { params });
    }
    if (response.status === 200) {
      setIsSaved((prevState) => !prevState);
    }
  };

  const handleAddTrackToPlaylist = async (playlistId: string, trackUris: string) => {
    const params = {
      uris: trackUris,
    };
    await ApiSpotify.post('/playlists/' + playlistId + '/tracks', null, {
      params,
    });
  };

  return (
    <div className="hover:bg-gray-100 hover:bg-opacity-25 rounded-md px-2" data-wrapper>
      <div className="group flex justify-center items-center col-start-1 col-end-1">
        {currentTrack && track.uri === currentTrack.uri ? (
          <img
            src={
              'https://open.scdn.co/cdn/images/equaliser-animated-green.73b73928.gif'
            }
            alt="playing"
            className="hidden canhover:block canhover:group-hover:hidden"
          />
        ) : (
          <div className="hidden canhover:block canhover:group-hover:hidden">{number}</div>
        )}
        {(isPlaying && currentTrack && track.uri === currentTrack.uri) ? (
          <MdPause
            className="w-6 h-6 cursor-pointer block canhover:hidden canhover:group-hover:block"
            onClick={handlePauseTrack}
            data-tip="play"
            data-for="login-tooltip"
            data-event="click"
          />
        ) : (
          <MdPlayArrow
            className="w-6 h-6 cursor-pointer block canhover:hidden canhover:group-hover:block"
            onClick={() => handlePlayTrack(offset, 0)}
            data-tip="play"
            data-for="login-tooltip"
            data-event="click"
          />
        )}
      </div>
      <div className="flex items-center flex-grow min-w-0 col-start-2 col-end-2">
        {showAlbum && track.album && (
          <img
            src={getSmallestImage(track.album.images)}
            alt={track.album.name}
            className="w-10 mr-2"
          />
        )}
        <div className="flex flex-col justify-end truncate">
          {track.type === 'track' && (
            <div className="truncate">{track.name}</div>
          )}
          {track.type === 'episode' && (
            <>
              <TextLink
                className="truncate hidden sm:flex"
                text={track.name}
                url={'/episode/' + track.id}
              />
              <div className="truncate flex sm:hidden">
                {track.name}
              </div>
            </>
          )}
          <div className="flex font-light truncate">
            {track.explicit && <Explicit />}
            {track.artists &&
              track.artists.map((artist, idx) => (
                <Fragment key={artist.id}>
                  <TextLink
                    className="hidden sm:block"
                    text={artist.name}
                    url={
                      (track.type === 'track' ? '/artist/' : '/show/') +
                      artist.id
                    }
                  />
                  <div className="block sm:hidden">
                    {artist.name}
                  </div>
                  {idx !== track.artists.length - 1 && ', '}
                </Fragment>
              ))}
          </div>
        </div>
      </div>
      {showAlbum && track.album && (
        <div className="hidden lg:flex items-center min-w-0 col-start-3 col-end-3">
          <TextLink
            className="truncate"
            text={track.album.name}
            url={'/album/' + track.album.id}
          />
        </div>
      )}
      {showDateAdded && (
        <div className="hidden md:flex items-center col-start-4 col-end-4">
          {fromNow(track.added_at)}
        </div>
      )}
      <div className="hidden sm:flex items-center col-start-5 col-end-5">
        {track.type === 'track' && (
          <LikeButton
            isActive={isSaved}
            onClick={() => handleAddToSavedTrack(track.id)}
          />
        )}
        {track.type === 'episode' &&
          (isSaved ? (
            <MdCheck
              className="cursor-pointer text-green-400"
              onClick={() => handleAddToSavedEpisode(track.id)}
            />
          ) : (
            <MdAddCircle
              className="cursor-pointer"
              onClick={() => handleAddToSavedEpisode(track.id)}
            />
          ))
        }
      </div>
      <div className="hidden sm:flex items-center col-start-6 col-end-6">
        {duration(track.duration_ms)}
      </div>
      <div className="flex items-center col-start-7 col-end-7">
        <ContextMenu
          menuButton={(
            <MenuButton>
              <MdOutlineMoreVert className="relative cursor-pointer" />
            </MenuButton>
          )}
          direction="left"
        >
          <SubMenu label="Go to artist">
            {track.artists && track.artists.map((artist) => (
              <MenuItem
                key={artist.id}
                onClick={() => history.push((track.type === 'track' ? '/artist/' : '/show/') + artist.id)}
              >
                {artist.name}
              </MenuItem>
            ))}
          </SubMenu>
          <MenuItem onClick={() => history.push('/album/' + track.album.id)}>Go to album</MenuItem>
          <MenuDivider />
          <MenuItem onClick={() => handleAddToSavedTrack(track.id)}>
            {isSaved ? 'Remove from your Liked Songs' : 'Save to your Liked Songs'}
          </MenuItem>
          {onRemoveFromPlaylist && (
            <MenuItem onClick={() => onRemoveFromPlaylist(track.uri)}>
              Remove from this playlist
            </MenuItem>
          )}
          <SubMenu label="Add to playlist">
            {playlists
              .filter((playlist) => playlist.owner.id === user.id)
              .map((playlist) => (
                <MenuItem
                  key={playlist.id}
                  onClick={() => handleAddTrackToPlaylist(playlist.id, track.uri)}
                >
                  {playlist.name}
                </MenuItem>
              )
            )}
          </SubMenu>
        </ContextMenu>
      </div>
    </div>
  );
};

PlayerListTrackItem.defaultProps = defaultProps;

export default PlayerListTrackItem;

import { useEffect, Fragment } from 'react';
import {
  MdPlayArrow,
  MdPause,
  MdOutlineMoreVert,
} from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import {
  MenuDivider,
  MenuButton,
} from '@szhsin/react-menu';
import Track from '../../types/Track';
import { getSmallestImage, duration, fromNow, ucwords } from '../../utils/helpers';
import Playlist from '../../types/Playlist';
import Episode from '../../types/Episode';

import LikeButton from '../Button/LikeButton';
import ContextMenu from '../ContextMenu/ContextMenu';
import ContextSubMenu from '../ContextMenu/ContextSubMenu';
import ContextMenuItem from '../ContextMenu/ContextMenuItem';
import Explicit from '../Text/Explicit';
import TextLink from '../Text/TextLink';
import Skeleton from '../Skeleton/Skeleton';
import ReactTooltip from 'react-tooltip';
import { PlaylistTrackParams, SavedTrackParams } from '../../store/playlist-slice';

type PlayerListTrackItemProps = {
  track?: Track & Episode;
  isSavedTrack?: boolean;
  offset?: number;
  number?: number;
  currentTrack?: Track & Episode;
  isPlaying?: boolean;
  showAlbum?: boolean;
  showDateAdded?: boolean;
  playlists?: Playlist[];
  userId?: string;
  handlePlayTrack?: ({ offset, uri }: { offset: number, uri: string }) => void;
  handlePauseTrack?: () => void;
  handleAddTrackToPlaylist?: (args: PlaylistTrackParams) => void;
  handleRemoveFromPlaylist?: ({ trackUri, position }: { trackUri: string, position?: number }) => void;
  handleAddToSavedTrack?: (args: SavedTrackParams) => void;
  handleRemoveFromSavedTrack?: (args: SavedTrackParams) => void;
  isLoading?: boolean;
};

const defaultProps: PlayerListTrackItemProps = {
  track: {} as Track & Episode,
  isSavedTrack: false,
  offset: 0,
  number: 0,
  currentTrack: {} as Track & Episode,
  isPlaying: false,
  showAlbum: false,
  showDateAdded: false,
  playlists: [],
  userId: '',
  handlePlayTrack: ({ offset, uri }: { offset: number, uri: string }) => {},
  handlePauseTrack: () => {},
  handleAddTrackToPlaylist: undefined,
  handleRemoveFromPlaylist: undefined,
  handleAddToSavedTrack: undefined,
  handleRemoveFromSavedTrack: undefined,
  isLoading: false,
};

const PlayerListTrackItem: React.FC<PlayerListTrackItemProps> = ({
  track,
  isSavedTrack,
  offset,
  number,
  currentTrack,
  isPlaying,
  showAlbum,
  showDateAdded,
  playlists,
  userId,
  handlePlayTrack,
  handlePauseTrack,
  handleAddTrackToPlaylist,
  handleRemoveFromPlaylist,
  handleAddToSavedTrack,
  handleRemoveFromSavedTrack,
  isLoading,
}) => {
  const history = useHistory();

  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);

  const saveTrack = (track: Track) => {
    const params = {
      type: track.type,
      trackId: track.id,
    };
    if (isSavedTrack) {
      handleRemoveFromSavedTrack && handleRemoveFromSavedTrack(params);
    } else {
      handleAddToSavedTrack && handleAddToSavedTrack(params);
    }
  }

  const LoadingComponent = (
    <div className="rounded-md px-2" data-wrapper>
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
    </div>
  );

  return (
    <>
      {isLoading && LoadingComponent}
      {!isLoading && track && (
        <div className="hover:bg-gray-100 hover:bg-opacity-25 rounded-md px-2" data-wrapper>
          <div className="group flex justify-center items-center col-start-1 col-end-1">
            {currentTrack && track.uri === currentTrack.uri ? (
              <img
                src={
                  'https://open.scdn.co/cdn/images/equaliser-animated-green.73b73928.gif'
                }
                alt="playing"
                className="hidden canhover:block canhover:group-hover:hidden"
                loading="lazy"
              />
            ) : (
              <div className="hidden canhover:block canhover:group-hover:hidden">{number}</div>
            )}
            {(isPlaying && currentTrack && track.uri === currentTrack.uri) ? (
              <MdPause
                className="w-6 h-6 cursor-pointer block canhover:hidden canhover:group-hover:block"
                onClick={handlePauseTrack}
                data-tip="play"
                data-for="play-tooltip"
                data-event="click"
              />
            ) : (
              <MdPlayArrow
                className="w-6 h-6 cursor-pointer block canhover:hidden canhover:group-hover:block"
                onClick={(e) => handlePlayTrack && handlePlayTrack({ offset: offset || 0, uri: track.uri })}
                data-tip="play"
                data-for="play-tooltip"
                data-event="click"
              />
            )}
          </div>
          <div className="flex items-center flex-grow min-w-0 col-start-2 col-end-2">
            {showAlbum && (
              <img
                src={track.type === 'track' ? getSmallestImage(track.album.images) : getSmallestImage(track.images)}
                alt={track.type === 'track' ? track.album.name : track.show.name}
                className="w-10 mr-2"
                loading="lazy"
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
                {track.type === 'track' && track.artists &&
                  track.artists.map((artist, idx) => (
                    <Fragment key={artist.id}>
                      <TextLink
                        className="hidden sm:block"
                        text={artist.name}
                        url={'/artist/' + artist.id}
                      />
                      <div className="block sm:hidden">
                        {artist.name}
                      </div>
                      {idx !== track.artists.length - 1 && <span>,&nbsp;</span>}
                    </Fragment>
                  ))
                }
                {track.type === 'episode' && track.show && (
                  <TextLink
                    className="hidden sm:block"
                    text={track.show.name}
                    url={'/show/' + track.show.id}
                  />
                )}
              </div>
            </div>
          </div>
          {showAlbum && track.type === 'track' && track.album && (
            <div className="hidden lg:flex items-center min-w-0 col-start-3 col-end-3">
              <TextLink
                className="truncate"
                text={track.album.name}
                url={'/album/' + track.album.id}
              />
            </div>
          )}
          {showAlbum && track.type === 'episode' && track.show && (
            <div className="hidden lg:flex items-center min-w-0 col-start-3 col-end-3">
              <TextLink
                className="truncate"
                text={track.show.name}
                url={'/show/' + track.show.id}
              />
            </div>
          )}
          {showDateAdded && (
            <div className="hidden md:flex items-center col-start-4 col-end-4">
              {fromNow(track.added_at)}
            </div>
          )}
          <div className="hidden sm:flex items-center col-start-5 col-end-5">
            <LikeButton
              className="w-6 h-6"
              isActive={isSavedTrack}
              type={track.type}
              onClick={() => saveTrack(track)}
            />
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
              {track.type === 'track' && (
                <ContextSubMenu label="Go to artist">
                  {track.artists && track.artists.map((artist) => (
                    <ContextMenuItem
                      key={artist.id}
                      onClick={() => history.push((track.type === 'track' ? '/artist/' : '/show/') + artist.id)}
                    >
                      {artist.name}
                    </ContextMenuItem>
                  ))}
                </ContextSubMenu>
              )}
              {track.type === 'episode' && track.show && (
                <ContextMenuItem onClick={() => history.push('/show/' + track.show.id)}>
                  Go to podcast
                </ContextMenuItem>
              )}
              {track.type === 'track' && (
                <ContextMenuItem onClick={() => history.push('/album/' + track.album.id)}>
                  Go to album
                </ContextMenuItem>
              )}
              <MenuDivider />
              {userId && (
                <ContextMenuItem onClick={() => saveTrack(track)}>
                  {isSavedTrack ? `Remove from your Liked ${ucwords(track.type)}s` : `Save to your Liked ${ucwords(track.type)}s`}
                </ContextMenuItem>
              )}
              {userId && handleRemoveFromPlaylist && (
                <ContextMenuItem onClick={() => handleRemoveFromPlaylist({ trackUri: track.uri, position: offset })}>
                  Remove from this playlist
                </ContextMenuItem>
              )}
              {userId && (
                <ContextSubMenu label="Add to playlist">
                  {playlists && playlists
                    .filter((playlist) => playlist.owner.id === userId)
                    .map((playlist) => (
                      <ContextMenuItem
                        key={playlist.id}
                        onClick={() => handleAddTrackToPlaylist && handleAddTrackToPlaylist({ playlistId: playlist.id, trackUri: track.uri })}
                      >
                        {playlist.name}
                      </ContextMenuItem>
                    )
                  )}
                </ContextSubMenu>
              )}
            </ContextMenu>
          </div>
        </div>
      )}
    </>
  );
};

PlayerListTrackItem.defaultProps = defaultProps;

export default PlayerListTrackItem;

import { useEffect, Fragment } from 'react';
import {
  MdAddCircle,
  MdPlayArrow,
  MdPause,
  MdCheck,
  MdOutlineMoreVert,
} from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import {
  MenuDivider,
  MenuButton,
} from '@szhsin/react-menu';
import Track from '../../types/Track';
import { getSmallestImage, duration, fromNow } from '../../utils/helpers';
import Playlist from '../../types/Playlist';

import LikeButton from '../Button/LikeButton';
import ContextMenu from '../ContextMenu/ContextMenu';
import ContextSubMenu from '../ContextMenu/ContextSubMenu';
import ContextMenuItem from '../ContextMenu/ContextMenuItem';
import Explicit from '../Text/Explicit';
import TextLink from '../Text/TextLink';
import Skeleton from '../Skeleton/Skeleton';
import ReactTooltip from 'react-tooltip';

type PlayerListTrackItemProps = {
  track?: Track;
  isSavedTrack?: boolean;
  offset?: number;
  number?: number;
  currentTrack?: Track;
  isPlaying?: boolean;
  showAlbum?: boolean;
  showDateAdded?: boolean;
  onRemoveFromPlaylist?: (trackId: string, position?: number) => void;
  playlists?: Playlist[];
  userId?: string;
  handlePlayTrack?: ({ offset, uri }: { offset: number, uri: string }) => void;
  handlePauseTrack?: () => void;
  handleAddToPlaylist?: ({ playlistId, uris }: { playlistId: string, uris: string }) => void;
  handleRemoveFromPlaylist?: ({ playlistId, uri, position }: { playlistId: string, uri: string, position?: number }) => void;
  handleAddToSavedTrack?: ({ id, type, isSaved }: { id: string, type: 'episode' | 'track', isSaved: boolean }) => void;
  isLoading?: boolean;
};

const defaultProps: PlayerListTrackItemProps = {
  track: {} as Track,
  isSavedTrack: false,
  offset: 0,
  number: 0,
  currentTrack: {} as Track,
  isPlaying: false,
  showAlbum: false,
  showDateAdded: false,
  onRemoveFromPlaylist: undefined,
  playlists: [],
  userId: '',
  handlePlayTrack: ({ offset, uri }: { offset: number, uri: string }) => {},
  handlePauseTrack: () => {},
  handleAddToPlaylist: ({ playlistId, uris }: { playlistId: string, uris: string }) => {},
  handleRemoveFromPlaylist: ({ playlistId, uri, position }: { playlistId: string, uri: string, position?: number }) => {},
  handleAddToSavedTrack: ({ id, type, isSaved }: { id: string, type: 'episode' | 'track', isSaved: boolean }) => {},
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
  onRemoveFromPlaylist,
  playlists,
  userId,
  handlePlayTrack,
  handlePauseTrack,
  handleAddToPlaylist,
  handleRemoveFromPlaylist,
  handleAddToSavedTrack,
  isLoading,
}) => {
  const history = useHistory();

  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);

  const saveTrack = (track: Track) => {
    handleAddToSavedTrack && handleAddToSavedTrack({
      id: track.id,
      type: track.type,
      isSaved: isSavedTrack as boolean,
    });
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
            {showAlbum && track.album && (
              <img
                src={getSmallestImage(track.album.images)}
                alt={track.album.name}
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
                      {idx !== track.artists.length - 1 && <span>,&nbsp;</span>}
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
                isActive={isSavedTrack}
                onClick={() => saveTrack(track)}
              />
            )}
            {track.type === 'episode' &&
              (isSavedTrack ? (
                <MdCheck
                  className="cursor-pointer text-green-400"
                  onClick={() => saveTrack(track)}
                />
              ) : (
                <MdAddCircle
                  className="cursor-pointer"
                  onClick={() => saveTrack(track)}
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
              <ContextMenuItem onClick={() => history.push('/album/' + track.album.id)}>Go to album</ContextMenuItem>
              <MenuDivider />
              {userId && (
                <ContextMenuItem onClick={() => saveTrack(track)}>
                  {isSavedTrack ? 'Remove from your Liked Songs' : 'Save to your Liked Songs'}
                </ContextMenuItem>
              )}
              {handleRemoveFromPlaylist && (
                <ContextMenuItem onClick={() => handleRemoveFromPlaylist({ playlistId: '', uri: track.uri, position: offset })}>
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
                        onClick={() => handleAddToPlaylist && handleAddToPlaylist({ playlistId: playlist.id, uris: track.uri })}
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

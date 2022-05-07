import { MenuButton } from '@szhsin/react-menu';
import {
  MdPlayCircle,
  MdAddCircle,
  MdCheckCircle,
  MdPauseCircle,
  MdOutlineMoreHoriz,
  MdCheck,
} from 'react-icons/md';
import { PlaylistTrackParams, SavedTrackParams } from '../../store/playlist-slice';
import Episode from '../../types/Episode';
import Playlist from '../../types/Playlist';
import {
  getHighestImage,
  formatDate,
  duration,
} from '../../utils/helpers';
import ContextMenu from '../ContextMenu/ContextMenu';
import ContextMenuItem from '../ContextMenu/ContextMenuItem';
import ContextSubMenu from '../ContextMenu/ContextSubMenu';

import Skeleton from '../Skeleton/Skeleton';
import Explicit from '../Text/Explicit';
import TextLink from '../Text/TextLink';
import RangeInput from '../Input/RangeInput';

type PlayerListEpisodeItemProps = {
  episode?: Episode;
  offset?: number;
  number?: number;
  isSavedEpisode?: boolean;
  currentEpisode?: Episode;
  isPlaying?: boolean,
  playlists?: Playlist[];
  userId?: string;
  handlePlayEpisode?: ({ position, uri, positionMs }: { position: number, uri: string, positionMs: number }) => void;
  handlePauseEpisode?: () => void;
  handleAddEpisodeToPlaylist?: (args: PlaylistTrackParams) => void;
  handleAddToSavedEpisode?: (args: SavedTrackParams) => void;
  handleRemoveFromSavedEpisode?: (args: SavedTrackParams) => void;
  isLoading?: boolean;
};

const defaultProps: PlayerListEpisodeItemProps = {
  episode: {} as Episode,
  offset: 0,
  number: 0,
  isSavedEpisode: false,
  currentEpisode: {} as Episode,
  isPlaying: false,
  playlists: [],
  userId: '',
  handlePlayEpisode: undefined,
  handlePauseEpisode: undefined,
  handleAddEpisodeToPlaylist: undefined,
  handleAddToSavedEpisode: undefined,
  handleRemoveFromSavedEpisode: undefined,
  isLoading: false,
};

const PlayerListEpisodeItem: React.FC<PlayerListEpisodeItemProps> = ({
  episode,
  offset,
  number,
  isSavedEpisode,
  currentEpisode,
  isPlaying,
  userId,
  playlists,
  handlePlayEpisode,
  handlePauseEpisode,
  handleAddEpisodeToPlaylist,
  handleAddToSavedEpisode,
  handleRemoveFromSavedEpisode,
  isLoading,
}) => {

  const saveEpisode = (episode: Episode) => {
    const params = {
      type: episode.type,
      trackId: episode.id,
    };
    if (isSavedEpisode) {
      handleRemoveFromSavedEpisode && handleRemoveFromSavedEpisode(params);
    } else {
      handleAddToSavedEpisode && handleAddToSavedEpisode(params);
    }
  }

  const LoadingComponent = (
    <>
      <div className="mr-4 w-24 h-24 rounded-xl">
        <Skeleton height="100%" />
      </div>
      <div className="flex flex-col gap-3 w-full">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    </>
  );

  return (
    <div
      className="group flex items-center px-2 py-4 border-t-2 border-opacity-10 hover:bg-gray-500 hover:bg-opacity-25"
    >
      {isLoading && LoadingComponent}
      {!isLoading && episode && (
        <>
          <img
            src={getHighestImage(episode.images)}
            alt={episode.name}
            className="mr-4 w-24 h-24 rounded-xl"
          />
          <div className="flex flex-col w-full">
            <div className="flex">
              <TextLink
                className="mb-2 mr-auto"
                text={episode.name}
                url={'/episode/' + episode.id}
              />
              <div className="text-center mr-4 w-8 h-8">
                <ContextMenu
                  menuButton={(
                    <MenuButton>
                      <MdOutlineMoreHoriz className="relative cursor-pointer" />
                    </MenuButton>
                  )}
                  direction="left"
                >
                  {userId && (
                    <ContextMenuItem onClick={() => saveEpisode(episode)}>
                      {isSavedEpisode ? 'Remove from your Liked Episodes' : 'Save to your Liked Episodes'}
                    </ContextMenuItem>
                  )}
                  {userId && (
                    <ContextSubMenu label="Add to playlist">
                      {playlists && playlists
                        .filter((playlist) => playlist.owner.id === userId)
                        .map((playlist) => (
                          <ContextMenuItem
                            key={playlist.id}
                            onClick={() => handleAddEpisodeToPlaylist && handleAddEpisodeToPlaylist({ playlistId: playlist.id, trackUri: episode.uri })}
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
            {episode.show && (
              <TextLink
                className="mb-2"
                text={episode.show.name}
                url={'/show/' + episode.show.id}
              />
            )}
            <div className="mb-2 text-sm font-light line-clamp-2">
              {episode.description}
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <div className="flex items-center mr-auto">
                {(isPlaying && currentEpisode && episode.uri === currentEpisode.uri) ? (
                  <MdPauseCircle
                    className="mr-4 w-8 h-8 cursor-pointer"
                    onClick={handlePauseEpisode}
                    data-tip="play"
                    data-for="play-tooltip"
                    data-event="click"
                  />
                ) : (
                  <MdPlayCircle
                    className="mr-4 w-8 h-8 cursor-pointer"
                    onClick={() => handlePlayEpisode && number && handlePlayEpisode({
                      position: offset || 0,
                      uri: episode.uri,
                      positionMs: episode.resume_point.resume_position_ms,
                    })}
                    data-tip="play"
                    data-for="play-tooltip"
                    data-event="click"
                  />
                )}
                {episode.explicit && <Explicit />}
                <div className="flex items-center">
                  <div>
                    {formatDate(episode.release_date, 'MMM DD')}
                  </div>
                  <div className="ml-1 sm:ml-2">
                    {' • '}
                  </div>
                  {episode.resume_point?.fully_played
                    ? (
                      <div className="ml-1 sm:ml-2 flex items-center">
                        Played
                        <MdCheck
                          className="ml-1 sm:ml-2 w-4 h-4 sm:w-6 sm:h-6 cursor-pointer text-green-400"
                        />
                      </div>
                    )
                    : episode.resume_point?.resume_position_ms > 0
                      ? (
                        <div className="ml-1 sm:ml-2">
                          <div>
                            {duration(episode.duration_ms - episode.resume_point?.resume_position_ms, true, false) + ' left'}
                          </div>
                          <div className="hidden sm:block">
                            <RangeInput
                              max={episode.duration_ms || 100}
                              value={episode.resume_point?.resume_position_ms}
                              disabled
                            />
                          </div>
                        </div>
                      )
                      : (
                        <div className="ml-1 sm:ml-2">
                          {duration(episode.duration_ms, true, false)}
                        </div>
                      )
                  }
                </div>
              </div>
              <div className="flex items-center">
                {isSavedEpisode ? (
                  <MdCheckCircle
                    className="mr-4 w-8 h-8 cursor-pointer text-green-400"
                    onClick={() => saveEpisode(episode)}
                  />
                ) : (
                  <MdAddCircle
                    className="mr-4 w-8 h-8 cursor-pointer"
                    onClick={() => saveEpisode(episode)}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

PlayerListEpisodeItem.defaultProps = defaultProps;

export default PlayerListEpisodeItem;

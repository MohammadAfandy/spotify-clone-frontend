import { useState, useEffect, Fragment } from 'react';
import { Play, PlusCircle, Trash, Check } from 'react-feather';
import Track from '../../types/Track';
import ApiSpotify from '../../utils/api-spotify';
import { getSmallestImage, duration, fromNow } from '../../utils/helpers';

import LikeButton from '../Button/LikeButton';
import TextLink from '../Link/TextLink';

type PlayerListTrackItemProps = {
  track: Track;
  offset: number;
  number: number;
  currentTrack: Track;
  showAlbum?: boolean;
  showDateAdded?: boolean;
  onRemoveFromPlaylist?: (trackId: string) => void;
  handlePlayTrack: (offset: number, positionMs: number) => void;
};

const defaultProps: PlayerListTrackItemProps = {
  track: {} as Track,
  offset: 0,
  number: 0,
  currentTrack: {} as Track,
  showAlbum: false,
  showDateAdded: false,
  onRemoveFromPlaylist: undefined,
  handlePlayTrack: (offset: number, positionMs: number) => {},
};

const PlayerListTrackItem: React.FC<PlayerListTrackItemProps> = ({
  track,
  offset,
  number,
  currentTrack,
  showAlbum,
  showDateAdded,
  onRemoveFromPlaylist,
  handlePlayTrack,
}) => {
  const [isSaved, setIsSaved] = useState(track.is_saved);

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
      response = await ApiSpotify.put('/me/tracks', null, { params });
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
      response = await ApiSpotify.put('/me/episodes', null, { params });
    }
    if (response.status === 200) {
      setIsSaved((prevState) => !prevState);
    }
  };

  return (
    <div className="flex py-2 hover:bg-gray-100 hover:bg-opacity-25 rounded-md text-sm">
      <div
        className="group flex justify-center items-center mr-2"
        style={{ flexBasis: '5%' }}
      >
        {currentTrack && track.uri === currentTrack.uri ? (
          <img
            src={
              'https://open.scdn.co/cdn/images/equaliser-animated-green.73b73928.gif'
            }
            alt="playing"
            className="block group-hover:hidden"
          />
        ) : (
          <div className="block group-hover:hidden">{number}</div>
        )}
        <Play
          className="w-6 h-6 cursor-pointer hidden group-hover:block"
          onClick={() => handlePlayTrack(offset, 0)}
        />
      </div>
      <div className="flex items-center flex-grow min-w-0">
        {showAlbum && track.album && (
          <img
            src={getSmallestImage(track.album.images)}
            alt={track.album.name}
            className="mr-2 w-10"
          />
        )}
        <div className="flex flex-col justify-end truncate">
          {track.type === 'track' && (
            <div className="truncate">{track.name}</div>
          )}
          {track.type === 'episode' && (
            <TextLink
              className="truncate"
              text={track.name}
              url={'/episode/' + track.id}
            />
          )}
          <div className="font-light truncate">
            {track.artists &&
              track.artists.map((artist, idx) => (
                <Fragment key={artist.id}>
                  <TextLink
                    text={artist.name}
                    url={
                      (track.type === 'track' ? '/artist/' : '/show/') +
                      artist.id
                    }
                  />
                  {idx !== track.artists.length - 1 && ', '}
                </Fragment>
              ))}
          </div>
        </div>
      </div>
      {showAlbum && track.album && (
        <div
          className="flex items-center min-w-0 mr-2"
          style={{ flexBasis: '30%' }}
        >
          <TextLink
            className="truncate"
            text={track.album.name}
            url={'/album/' + track.album.id}
          />
        </div>
      )}
      {showDateAdded && (
        <div className="flex items-center mr-2" style={{ flexBasis: '15%' }}>
          {fromNow(track.added_at)}
        </div>
      )}
      <div className="flex items-center mr-2" style={{ flexBasis: '5%' }}>
        {track.type === 'track' && (
          <LikeButton
            isActive={isSaved}
            onClick={() => handleAddToSavedTrack(track.id)}
          />
        )}
        {track.type === 'episode' &&
          (isSaved ? (
            <Check
              className="cursor-pointer text-green-400"
              onClick={() => handleAddToSavedEpisode(track.id)}
            />
          ) : (
            <PlusCircle
              className="cursor-pointer"
              onClick={() => handleAddToSavedEpisode(track.id)}
            />
          ))}
      </div>
      {onRemoveFromPlaylist && (
        <div className="flex items-center mr-2" style={{ flexBasis: '5%' }}>
          <Trash
            className="cursor-pointer"
            onClick={() => onRemoveFromPlaylist(track.uri)}
          />
        </div>
      )}
      <div className="flex items-center mr-2" style={{ flexBasis: '5%' }}>
        {duration(track.duration_ms)}
      </div>
    </div>
  );
};

PlayerListTrackItem.defaultProps = defaultProps;

export default PlayerListTrackItem;

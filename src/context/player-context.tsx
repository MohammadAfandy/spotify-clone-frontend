import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';

import Track from '../types/Track';
import ApiSpotify from '../utils/api-spotify';
import { getArtistNames } from '../utils/helpers';

type PlayerContextObj = {
  offset: number;
  changeOffset: (offset: number) => void;
  positionMs: number;
  changePositionMs: (positionMs: number) => void;
  currentTrack: Track;
  changeCurrentTrack: (currentTrack: Track) => void;
  isPlaying: boolean;
  changeIsPlaying: (isPlaying: boolean) => void;
  currentUri: string;
  changeCurrentUri: (currentUri: string) => void;

  togglePlay: (uris: string[], offset: number, positionMs?: number) => void;
  togglePause: () => void;
};

export const PlayerContext = React.createContext<PlayerContextObj>({
  offset: 0,
  changeOffset: (offset: number) => {},
  positionMs: 0,
  changePositionMs: (positionMs: number) => {},
  currentTrack: {} as Track,
  changeCurrentTrack: (currentTrack: Track) => {},
  isPlaying: false,
  changeIsPlaying: (isPlaying: boolean) => {},
  currentUri: '',
  changeCurrentUri: (currentUri: string) => {},

  togglePlay: (uris: string[], offset: number, positionMs?: number) => {},
  togglePause: () => {},
});

const PlayerProvider: React.FC = ({ children }) => {
  const [currentUri, setCurrentUri] = useState<string>('');
  const [offset, setOffset] = useState<number>(0);
  const [positionMs, setPositionMs] = useState<number>(0);
  const [currentTrack, setCurrentTrack] = useState<Track>({} as Track);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const changeCurrentTrack = useCallback((currentTrack: Track) => {
    setCurrentTrack(currentTrack);
  }, []);
  
  const changeIsPlaying = useCallback((isPlaying: boolean) => {
    setIsPlaying(isPlaying);
  }, []);

  const changeCurrentUri = useCallback((currentUri: string) => {
    setCurrentUri(currentUri);
  }, []);

  const contextValue = {
    offset,
    changeOffset: (offset: number) => setOffset(offset),
    positionMs,
    changePositionMs: (positionMs: number) => setPositionMs(positionMs),
    currentTrack,
    changeCurrentTrack,
    isPlaying,
    changeIsPlaying,
    currentUri,
    changeCurrentUri,

    togglePlay: async (uris: string[], offset: number, positionMs = 0) => {
      let newUris = [];
      let newContextUri = '';
      let noOffset = false;
      const availableUris = [
        'album',
        'artist',
        'playlist',
        'show',
        'track',
        'episode',
        'user',
      ];
      for (const uri of uris) {
        const [, type] = uri.split(':');
        if (availableUris.includes(type) === false) {
          throw new Error('Invalid Uri : ' + uri);
        }
        if (type === 'track' || type === 'episode') {
          newUris.push(uri);
        } else {
          if (newUris.length) {
            throw new Error('Cannot mix track / episode with another type');
          }
          if (newContextUri) {
            throw new Error('Can only contain 1 uri if not track / episode');
          }
          if (type === 'artist') {
            noOffset = true;
          }
          newContextUri = uri;
        }
      }
      const body = {
        uris: newUris.length ? newUris : undefined,
        context_uri: newContextUri || undefined,
        offset: noOffset
          ? undefined
          : {
              position: offset,
            },
        position_ms: positionMs,
      };

      try {
        const response = await ApiSpotify.put('/me/player/play', body);
        if (response.status === 204) {
          setPositionMs(positionMs);
          setOffset(offset);
        }
      } catch (error) {
        console.error(error);
      }
    },

    togglePause: async () => {
      await ApiSpotify.put('/me/player/pause');
    },
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      <Helmet defer={false}>
        <title>
          {isPlaying && currentTrack?.uri
            ? `${currentTrack.name} • ${getArtistNames(currentTrack.artists)}`
            : 'Spotify Clone'}
        </title>
      </Helmet>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;

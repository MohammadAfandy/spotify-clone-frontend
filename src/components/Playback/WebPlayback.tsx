import React, {
  useState,
  useEffect,
  Fragment,
  useRef,
  useCallback,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  getCookie,
  setCookie,
  getSmallestImage,
  duration as durationFn,
  randomAlphaNumeric,
  sleep,
  getArtistNames,
} from '../../utils/helpers';
import {
  changeIsPlaying,
  changeCurrentTrack,
  changePositionMs,
  changeIsSaved,
  toggleResume,
  togglePause,
} from '../../store/player-slice';
import {
  addToSavedTrack,
  removeFromSavedTrack,
  SavedTrackParams,
} from '../../store/playlist-slice';
import { RootState } from '../../store';
import ApiSpotify from '../../utils/api-spotify';
import ApiBackend from '../../utils/api-backend';
import Device from '../../types/Device';
import RepeatMode from '../../types/RepeatMode';
import Player from '../../types/Player';
import PlaybackState from '../../types/PlaybackState';
import {
  MdPlayCircle,
  MdPlayArrow,
  MdPause,
  MdPauseCircle,
  MdSkipPrevious,
  MdSkipNext,
  MdShuffle,
  MdRepeat,
  MdRepeatOne,
  MdMic,
  MdDevices,
  MdVolumeOff,
  MdVolumeDown,
  MdVolumeUp,
  MdForward10,
  MdReplay10,
  MdQueueMusic,
} from 'react-icons/md';
import { FiMaximize2 } from 'react-icons/fi';
import FullPlayer from './FullPlayer';
import useWindowSize from '../../hooks/useWindowSize';
import { ACCESS_TOKEN_AGE, APP_NAME, PLAYER_NAME } from '../../utils/constants';

import Button from '../Button/Button';
import TextLink from '../Text/TextLink';
import FullScreen from '../FullScreen/FullScreen';
import DeviceSelector from './DeviceSelector';
import LikeButton from '../Button/LikeButton';
import ControlButton from './ControlButton';
import RangeInput from '../Input/RangeInput';

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

window.Spotify = window.Spotify || {};

const CURRENT_PLAYER_NAME = `${PLAYER_NAME} - ${randomAlphaNumeric(4)}`;

const mapRepeatMode: RepeatMode = [
  { state: 'off', mode: 0, text: '' },
  { state: 'context', mode: 1, text: '•' },
  { state: 'track', mode: 2, text: '1' },
];

const skipStep = 10;

const getVolumeFromStorage = () => {
  const volume = Number(localStorage.getItem('volume'));
  if (volume !== 0){
    return Number((volume / 100).toFixed(2));
  }

  return 1;
}

const WebPlayback: React.FC = () => {
  const dispatch = useDispatch();
  const trackRef = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const location = useLocation();
  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const isPlaying = useSelector((state: RootState) => state.player.isPlaying);
  const isSaved = useSelector((state: RootState) => state.player.isSaved);

  const [player, setPlayer] = useState<Player>(undefined);
  const [error, setError] = useState('');

  const [isPlayerActive, setIsPlayerActive] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [activeDevice, setActiveDevice] = useState<Device | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [devices, setDevices] = useState<Device[]>([]);
  const [positionMs, setPositionMs] = useState(0);
  const [contextUri, setContextUri] = useState('');

  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [isMobilePlayer, setIsMobilePlayer] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [isOverFlow, setIsOverflow] = useState(false);
  const [isEnableReverseDuration, setIsEnableReverseDuration] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  useEffect(() => {
    const getSavedTrack = async () => {
      const response = await ApiSpotify.get(`/me/${currentTrack.type}s/contains`, {
        params: {
          ids: currentTrack.id,
        },
      });

      dispatch(changeIsSaved(response.data[0]));
    };

    if (currentTrack.id) getSavedTrack();
  }, [dispatch, currentTrack.id, currentTrack.type]);

  useEffect(() => {
    setIsOverflow(trackRef.current ? trackRef.current.clientWidth < trackRef.current.scrollWidth : false);
    setIsMobilePlayer(!!(windowWidth && windowWidth < 1024));
  }, [currentTrack.id, windowWidth, windowHeight]);

  const transferPlayback = useCallback(async (device_id: string): Promise<void> => {
    await ApiSpotify.put('/me/player', { device_ids: [device_id] });
    getUserDevices();
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    document.body.appendChild(script);

    let initPlayer: Player;
    window.onSpotifyWebPlaybackSDKReady = () => {
      initPlayer = new window.Spotify.Player({
        name: CURRENT_PLAYER_NAME,
        getOAuthToken: async (cb: (token: string) => {}) => {
          const response = await ApiBackend.post('/refresh_token', {}, {
            withCredentials: true,
          }).catch(console.error);
          const accessToken = response?.data?.access_token;
          if (accessToken) {
            setCookie('access_token', accessToken, { expires: ACCESS_TOKEN_AGE });
            cb(accessToken);
          } else {
            console.error('Failed to get token');
          }
        },
        volume: getVolumeFromStorage(),
      });

      if (initPlayer) {
        setPlayer(initPlayer);

        initPlayer.addListener('initialization_error', (state) => {
          setError(state.message);
          setIsPlayerActive(false);
          console.error('initialization_error', state.message);
        });
        initPlayer.addListener('authentication_error', (state) => {
          setError(state.message);
          setIsPlayerActive(false);
          console.error('authentication_error', state.message);
        });
        initPlayer.addListener('account_error', (state) => {
          setError(state.message);
          setIsPlayerActive(false);
          console.error('account_error', state.message);
        });
        initPlayer.addListener('playback_error', (state) => {
          // setError(state.message);
          console.error('playback_error', state.message);
        });

        initPlayer.addListener('player_state_changed', (state: PlaybackState) => {
          // console.info('player_state_changed', state);
          if (state) {
            try {
              const {
                duration,
                position,
                paused,
                shuffle,
                repeat_mode,
                track_window,
                context,
              } = state;
              const {
                current_track,
              } = track_window;
              setDuration(duration);
              setPositionMs(position);
              setShuffle(shuffle);
              setRepeatMode(repeat_mode);
              setIsPlayerActive(true);
              setContextUri(context?.uri || '');

              const currentDeviceId = getCookie('device_id');
              if (currentDeviceId) {
                setActiveDevice({
                  id: currentDeviceId,
                  is_active: true,
                  is_private_session: false,
                  is_restricted: false,
                  name: CURRENT_PLAYER_NAME,
                  type: 'Computer',
                  volume_percent: 100,
                });
              }

              dispatch(changeIsPlaying(!paused));
              dispatch(changeCurrentTrack(current_track));
              dispatch(changePositionMs(position));

              initPlayer?.getVolume().then((volume) => {
                saveVolume(volume * 100);
              });

            } catch (error) {
              console.error(error);
            }
          } else {
            setIsPlayerActive(false);
            getUserDevices();
          }
        });

        initPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
          setError('');
          setDeviceId(device_id);
          setCookie('device_id', device_id);
          getUserDevices();
          console.info('Ready with Device ID', device_id);
        });

        initPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          const err_msg = 'Device ID has gone offline';
          setError(err_msg);
          console.info(err_msg, device_id);
        });
    
        initPlayer.connect();
      }
    };

    return () => {
      if (initPlayer) initPlayer.disconnect();
    };
  }, [dispatch]);

  const handlePlay = async (event: React.MouseEvent): Promise<void> => {
    event.stopPropagation();
    if (isPlayerActive) {
      player && player.togglePlay();
    } else {
      if (isPlaying) {
        dispatch(togglePause());
        getPlaybackState();
      } else {
        dispatch(toggleResume());
        getPlaybackState();
      }
    }
  };

  const handlePrev = async (event: React.MouseEvent): Promise<void> => {
    event.stopPropagation();
    if (isPlayerActive) {
      if (positionMs <= 3000) {
        player && player.previousTrack();
      } else {
        player && player.seek(0);
      }
    } else {
      await ApiSpotify.post('/me/player/previous');
      getPlaybackState();
    }
  };

  const handleNext = async (event: React.MouseEvent): Promise<void> => {
    event.stopPropagation();
    if (isPlayerActive) {
      player && player.nextTrack();
    } else {
      await ApiSpotify.post('/me/player/next');
      getPlaybackState();
    }
  };

  const handleSeek = async (event: React.MouseEvent | React.TouchEvent, position_ms: number): Promise<void> => {
    event.stopPropagation();
    if (position_ms < 0) position_ms = 0;
    if (isPlayerActive) {
      player && player.seek(position_ms);
    } else {
      await ApiSpotify.put('/me/player/seek', {}, { params: {
        position_ms,
      }});
      setPositionMs(position_ms);
      await sleep(1000);
      getPlaybackState();
    }
  };

  const handleVolume = async (event: React.MouseEvent | React.TouchEvent, volume_percent: number): Promise<void> => {
    event.stopPropagation();
    saveVolume(volume_percent);
    if (isPlayerActive) {
      player && player.setVolume(volume_percent / 100);
    } else {
      await ApiSpotify.put('/me/player/volume', {}, { params: {
        volume_percent,
      }});
      await sleep(2000);
      getPlaybackState();
    }
  };

  const saveVolume = (volumePercent: number): void => {
    localStorage.setItem('volume', volumePercent.toString());
    setVolume(volumePercent);
  }

  const handleRepeatMode = async (event: React.MouseEvent): Promise<void> => {
    event.stopPropagation();
    let state = '';
    const currentModeIndex = mapRepeatMode.findIndex(
      (v) => v.mode === repeatMode
    );
    if (mapRepeatMode[currentModeIndex + 1]) {
      state = mapRepeatMode[currentModeIndex + 1].state;
    } else {
      state = mapRepeatMode[0].state;
    }
    await ApiSpotify.put('/me/player/repeat', {}, { params: { state } });
    if (!isPlayerActive) {
      getPlaybackState();
    }
  };

  const handleShuffle = async (event: React.MouseEvent): Promise<void> => {
    event.stopPropagation();
    await ApiSpotify.put('/me/player/shuffle', {}, {
      params: { state: !shuffle },
    });
    if (!isPlayerActive) {
      getPlaybackState();
    }
  };

  const handleSelectDevice = async (
    event: React.MouseEvent,
    selectedDeviceId: string
  ): Promise<void> => {
    event.stopPropagation();
    await transferPlayback(selectedDeviceId);
  };

  const getUserDevices = async () => {
    const response = await ApiSpotify.get('/me/player/devices');
    const devices = response.data.devices;
    setDevices(devices);
    setActiveDevice(devices.find((device: Device) => device.is_active));
  };

  const handleSaveTrack = async (event: React.MouseEvent) => {
    event.stopPropagation();

    const params: SavedTrackParams = {
      type: currentTrack.type,
      trackId: currentTrack.id,
    } 

    if (isSaved) {
      dispatch(removeFromSavedTrack(params));
      dispatch(changeIsSaved(false));
    } else {
      dispatch(addToSavedTrack(params));
      dispatch(changeIsSaved(true));
    }

  };

  const getPlaybackState = useCallback(async (): Promise<void> => {
    const { data: responseData } = await ApiSpotify.get('/me/player', {
      params: { additional_types: 'track,episode' }
    });
    if (!responseData) {
      if (deviceId) transferPlayback(deviceId);
    } else {
      const {
        item,
        progress_ms,
        device,
        shuffle_state,
        repeat_state,
        is_playing,
        context,
        timestamp,
      } = responseData;

      // probably device just get transferred and don't hold reliable data
      if (timestamp === 0) return;

      const {
        duration_ms,
        type,
      } = item;

      setDuration(duration_ms);
      setPositionMs(progress_ms);
      setShuffle(shuffle_state);
      setRepeatMode(mapRepeatMode.find((v) => v.state === repeat_state)?.mode || 0);
      saveVolume(device.volume_percent);

      // episode have different structure from track
      let newTrack;
      if (type === 'episode') {
        newTrack = {
          id: item.id,
          duration_ms: item.duration_ms,
          is_playable: item.is_playable,
          name: item.name,
          type: item.type,
          uri: item.uri,
          album: {
            name: item.show.name,
            uri: item.show.uri,
            images: item.images,
          },
          artists: [{
            name: item.show.name,
            uri: item.show.uri,
          }],
        };
      } else {
        newTrack = item;
      }
      setContextUri(context?.uri || '');

      dispatch(changeIsPlaying(is_playing));
      dispatch(changeCurrentTrack(newTrack));
      dispatch(changePositionMs(progress_ms));
    }
  }, [deviceId, transferPlayback, dispatch]);

  // get player state from another device if our device is not the current active device
  // because event player_state_changed not fired when we are not in local playback / device
  useEffect(() => {
    const setPlayBackState = () => {
      if (!isPlayerActive && deviceId) {
        getPlaybackState();
      }
    };
    setPlayBackState();
    const interval = setInterval(() => {
      setPlayBackState();
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [isPlayerActive, deviceId, getPlaybackState]);

  useEffect(() => {
      getUserDevices();
      const interval = setInterval(() => {
        getUserDevices();
      }, 30 * 1000);

      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const intervalSecond = 1000; // 1s
      const interval = setInterval(() => {
        const newPositionMs = positionMs + intervalSecond;
        if (newPositionMs >= duration) {
          getPlaybackState();
        }
        setPositionMs(newPositionMs);
        if (location.pathname === '/lyric') {
          dispatch(changePositionMs(newPositionMs));
        }
      }, intervalSecond);

      return () => clearInterval(interval);
    }
  }, [positionMs, isPlaying, duration, getPlaybackState, location.pathname, dispatch]);

  const handleOpenLyric = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleAfterClickLink();
    history.push('/lyric');
  };

  const handleOpenQueue = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleAfterClickLink();

    if (contextUri.startsWith('spotify:user')) {
      history.push('/collection/tracks');
      return;
    }

    const [, type, id] = contextUri.split(':');
    if (type && id) {
      history.push(`/${type}/${id}`);
      return;
    }

    console.info('Queue still not supported :(');
  };

  const handleshowFullPlayer = () => {
    setShowFullScreen(true);
    setShowFullPlayer(true);
  }

  const handleShowDeviceSelector = async (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowFullScreen(false);
    if (showFullPlayer) {
      await sleep(300);
    }
    setShowDeviceSelector(true);
    setShowFullScreen(true);
  };

  const handleCloseScreen = useCallback(async () => {
    setShowFullScreen(false);
    if (showFullPlayer && showDeviceSelector) {
      setShowFullPlayer(false);
      await sleep(300);
      setShowFullPlayer(true);
      setShowFullScreen(true);
    } else {
      setShowFullPlayer(false)
    }
    setShowDeviceSelector(false);
  }, [showFullPlayer, showDeviceSelector]);

  
  useEffect(() => {
    const unblock = history.block((location, action) => {
      // when in mobile and back button pressed, close full screen player
      if (action === 'POP' && showFullScreen) {
        handleCloseScreen();
        return false;
      } else {
        unblock();
      }
    });

    return () => unblock();
  }, [history, showFullScreen, handleCloseScreen]);

  const handleAfterClickLink = () => {
    setShowFullScreen(false);
    setShowFullPlayer(false);
  }

  return (
    <div className="h-full w-full border-t-2 border-light-black-1 bg-light-black text-xs">
      <Helmet defer={false}>
        <title>
          {isPlaying && currentTrack?.uri
            ? `${currentTrack.name} • ${getArtistNames(currentTrack.artists)}`
            : APP_NAME}
        </title>
      </Helmet>
      {error && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="mb-2 text-red-400">{error}</div>
          <Button
            className=""
            text="Reload Page"
            onClick={() => window.location.reload()}
            color="green"
          />
        </div>
      )}
      {!error && !deviceId && (
        <div className="flex flex-col items-center justify-center h-full">
          Loading ...
        </div>
      )}
      {!error && deviceId && !showFullPlayer && (
        <div className="flex flex-col w-full h-full justify-center items-between">
          <div
            className="grid grid-cols-12 gap-4 items-center"
            onClick={isMobilePlayer ? handleshowFullPlayer : undefined}
          >
            <div className="flex items-center col-span-9 lg:col-span-4">
              <div ref={trackRef} className="flex items-center whitespace-nowrap overflow-x-hidden">
                {currentTrack && currentTrack.uri && (
                  <>
                    <img
                      src={getSmallestImage(currentTrack.album?.images)}
                      alt={currentTrack.album?.name}
                      className="w-16 lg:w-24 pl-2 lg:pl-4 pr-2 lg:pr-4 z-10 bg-light-black"
                    />
                    <div className={`flex flex-col mr-2 relative ${isOverFlow ? 'animate-marquee' : ''}`}>
                      {currentTrack.type === 'track' && (
                        <div className="font-semibold text-sm">
                          {currentTrack.name}
                        </div>
                      )}
                      {(currentTrack.type === 'episode' && isMobilePlayer) && (
                        <div className="font-semibold text-sm">
                          {currentTrack.name}
                        </div>
                      )}
                      {(currentTrack.type === 'episode' && !isMobilePlayer) && (
                        <TextLink
                          className="font-semibold text-sm"
                          text={currentTrack.name}
                          url={'/episode/' + currentTrack.id}
                        />
                      )}
                      <div className="font-light">
                        {isMobilePlayer && (
                          <div>{currentTrack.artists?.map((artist) => artist.name).join(', ')}</div>
                        )}
                        {!isMobilePlayer && currentTrack.artists?.map((artist, idx) => (
                          <Fragment key={artist.uri}>
                            <TextLink
                              text={artist.name}
                              url={
                                (currentTrack.type === 'track'
                                  ? '/artist/'
                                  : '/show/') + artist.uri.split(':')[2]
                              }
                            />
                            {idx !== currentTrack.artists.length - 1 && ', '}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <ControlButton
                Icon={LikeButton}
                isActive={isSaved}
                type={currentTrack.type}
                className="hidden lg:flex ml-2"
                onClick={handleSaveTrack}
              />
            </div>

            <div className="hidden lg:flex flex-col items-center justify-around col-span-4">
              <div className="flex justify-center items-center">
                <ControlButton
                  Icon={MdShuffle}
                  className={`mx-3 ${shuffle ? 'text-green-400' : ''}`}
                  onClick={handleShuffle}
                />
                <ControlButton
                  Icon={MdSkipPrevious}
                  className="mx-3"
                  onClick={handlePrev}
                />
                <ControlButton
                  Icon={MdReplay10}
                  className="mx-3"
                  onClick={(e) => handleSeek(e, positionMs - (skipStep * 1000))}
                />
                <ControlButton
                  Icon={isPlaying ? MdPauseCircle : MdPlayCircle}
                  className="mx-3 h-10 w-10 sm:h-10 sm:w-10"
                  onClick={handlePlay}
                />
                <ControlButton
                  Icon={MdForward10}
                  className="mx-3"
                  onClick={(e) => handleSeek(e, positionMs + (skipStep * 1000))}
                />
                <ControlButton
                  Icon={MdSkipNext}
                  className="mx-3"
                  onClick={handleNext}
                />
                <ControlButton
                  Icon={repeatMode === 2 ? MdRepeatOne : MdRepeat}
                  className={`mx-3 ${repeatMode !== 0 ? 'text-green-400' : ''}`}
                  onClick={handleRepeatMode}
                />
              </div>
              <div className="flex justify-center items-center w-full mt-1">
                <div className="w-6 mr-2">{durationFn(positionMs)}</div>
                <RangeInput
                  className="w-full mr-2"
                  max={duration}
                  value={positionMs}
                  onChange={(e) => setPositionMs(Number(e.target.value))}
                  onMouseUp={(e: React.MouseEvent<HTMLInputElement>) =>
                    handleSeek(e, Number(e.currentTarget.value))
                  }
                  onTouchEnd={(e: React.TouchEvent<HTMLInputElement>) =>
                    handleSeek(e, Number(e.currentTarget.value))
                  }
                />
                <div
                  className="w-6 cursor-pointer"
                  onClick={() => setIsEnableReverseDuration((prevState) => !prevState)}
                >
                  {isEnableReverseDuration ? `-${durationFn(duration - positionMs)}` : durationFn(duration)}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-center pr-2 lg:pr-4 h-full col-span-3 lg:col-span-4">
              <div className="flex mb-2">
                <ControlButton
                  Icon={LikeButton}
                  isActive={isSaved}
                  type={currentTrack.type}
                  className="mr-4 flex lg:hidden"
                  onClick={handleSaveTrack}
                />
                {currentTrack && currentTrack.type === 'track' && (
                  <ControlButton
                    Icon={MdMic}
                    className="mr-4 hidden lg:flex"
                    onClick={handleOpenLyric}
                  />
                )}
                <ControlButton
                  Icon={MdQueueMusic}
                  className="mr-4 hidden lg:flex"
                  onClick={handleOpenQueue}
                />
                <ControlButton
                  Icon={MdDevices}
                  className={`mr-4 ${activeDevice && activeDevice.id !== deviceId && 'text-green-400'}`}
                  onClick={handleShowDeviceSelector}
                />
                <div className="hidden lg:flex items-center mr-4">
                  <ControlButton
                    Icon={volume <= 50 ? (volume > 0 ? MdVolumeDown : MdVolumeOff) : MdVolumeUp}
                    className="mr-4"
                    onClick={(e) => handleVolume(e, volume > 0 ? 0 : 100)}
                  />
                  <RangeInput
                    className="w-full"
                    max="100"
                    value={volume}
                    onChange={(e) => saveVolume(Number(e.target.value))}
                    onMouseUp={(e: React.MouseEvent<HTMLInputElement>) =>
                      handleVolume(e, Number(e.currentTarget.value))
                    }
                    onTouchEnd={(e: React.TouchEvent<HTMLInputElement>) =>
                      handleVolume(e, Number(e.currentTarget.value))
                    }
                  />
                </div>
                <div className="block lg:hidden">
                  <ControlButton
                    Icon={isPlaying ? MdPause : MdPlayArrow}
                    onClick={handlePlay}
                  />
                </div>
                <div className="hidden lg:block">
                  <ControlButton
                    Icon={FiMaximize2}
                    onClick={handleshowFullPlayer}
                  />
                </div>
              </div>
              {activeDevice && activeDevice.id !== deviceId && (
                <div className="hidden lg:block text-green-400 h-2">
                  Listening on {activeDevice.name}
                </div>
              )}
            </div>
          </div>

          {activeDevice && activeDevice.id !== deviceId && (
            <div className="block lg:hidden text-green-400 text-xxs text-center w-full">
              Listening on {activeDevice.name}
            </div>
          )}
        </div>
      )}

    <FullScreen
      isOpen={showFullScreen}
      handleCloseScreen={handleCloseScreen}
    >
      {showDeviceSelector && (
        <DeviceSelector
          deviceId={deviceId} 
          devices={devices} 
          handleSelectDevice={handleSelectDevice}
        />
      )}
      {showFullPlayer && !showDeviceSelector && (
        <FullPlayer
          activeDevice={activeDevice}
          deviceId={deviceId}
          shuffle={shuffle}
          repeatMode={repeatMode}
          skipStep={skipStep}
          duration={duration}
          volume={volume}
          positionMs={positionMs}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          isSaved={isSaved}
          saveVolume={saveVolume}
          handlePlay={handlePlay}
          handlePrev={handlePrev}
          handleNext={handleNext}
          setPositionMs={setPositionMs}
          handleSeek={handleSeek}
          handleVolume={handleVolume}
          handleShuffle={handleShuffle}
          handleRepeatMode={handleRepeatMode}
          handleOpenLyric={handleOpenLyric}
          handleOpenQueue={handleOpenQueue}
          handleAfterClickLink={handleAfterClickLink}
          handleShowDeviceSelector={handleShowDeviceSelector}
          handleSaveTrack={handleSaveTrack}
        />
      )}
    </FullScreen>

    </div>
  );
};

export default WebPlayback;

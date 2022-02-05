import React, {
  useState,
  useEffect,
  useContext,
  Fragment,
  useRef,
  useCallback,
} from 'react';
import { useHistory } from 'react-router-dom';
import {
  getCookie,
  setCookie,
  getSmallestImage,
  duration as durationFn,
  randomAlphaNumeric,
  sleep,
} from '../../utils/helpers';
import { PlayerContext } from '../../context/player-context';
import ApiSpotify from '../../utils/api-spotify';
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
} from 'react-icons/md';
import { FiMaximize2 } from 'react-icons/fi';
import FullPlayer from './FullPlayer';
import useWindowSize from '../../hooks/useWindowSize';
import { ACCESS_TOKEN_AGE, BACKEND_URI, PLAYER_NAME } from '../../utils/constants';

import Button from '../Button/Button';
import TextLink from '../Text/TextLink';
import FullScreen from '../FullScreen/FullScreen';
import DeviceSelector from './DeviceSelector';

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

const WebPlayback: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const {
    isPlaying,
    changeIsPlaying,
    currentTrack,
    changeCurrentTrack,
  } = useContext(PlayerContext);

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

  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [isMobilePlayer, setIsMobilePlayer] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [isOverFlow, setIsOverflow] = useState(false);
  const [isEnableReverseDuration, setIsEnableReverseDuration] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  useEffect(() => {
    if (trackRef.current) {
      if (trackRef.current.clientWidth < trackRef.current.scrollWidth) {
        setIsOverflow(true);
        return;
      }
    }
    setIsOverflow(false);
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
          const refreshToken = getCookie('refresh_token');
          if (refreshToken) {
            const response = await fetch(BACKEND_URI + '/refresh_token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
            const res = await response.json();
            const accessToken = res.access_token;
            setCookie('access_token', accessToken, { expires: ACCESS_TOKEN_AGE });
            cb(accessToken);
          } else {
            console.error('refresh token not set');
            cb(getCookie('access_token'));
          }
        },
        // volume: 1,
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
          // console.info('state from player_state_changed', state);
          if (state) {
            try {
              const {
                duration,
                position,
                paused,
                shuffle,
                repeat_mode,
                track_window,
              } = state;
              const { current_track } = track_window;
              setDuration(duration);
              setPositionMs(position);
              changeIsPlaying(!paused);
              setShuffle(shuffle);
              setRepeatMode(repeat_mode);
              changeCurrentTrack(current_track);
              setIsPlayerActive(true);

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

              initPlayer?.getVolume().then((volume) => {
                setVolume(volume * 100);
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
  }, [changeIsPlaying, changeCurrentTrack]);

  const handlePlay = async (event: React.MouseEvent): Promise<void> => {
    event.stopPropagation();
    if (isPlayerActive) {
      player && player.togglePlay();
    } else {
      if (isPlaying) {
        await ApiSpotify.put('/me/player/pause');
        getPlaybackState();
      } else {
        await ApiSpotify.put('/me/player/play');
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

  const handleSeek = async (event: React.MouseEvent, position_ms: number): Promise<void> => {
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
    if (!isPlayerActive) {
      getPlaybackState();
    }
  };

  const getUserDevices = async () => {
    const response = await ApiSpotify.get('/me/player/devices');
    const devices = response.data.devices;
    setDevices(devices);
    setActiveDevice(devices.find((device: Device) => device.is_active));
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
      } = responseData;

      const {
        duration_ms,
        type,
      } = item;

      setDuration(duration_ms);
      setPositionMs(progress_ms);
      changeIsPlaying(is_playing);
      setShuffle(shuffle_state);
      setRepeatMode(mapRepeatMode.find((v) => v.state === repeat_state)?.mode || 0);
      setVolume(device.volume_percent);

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
      changeCurrentTrack(newTrack);
    }
  }, [changeCurrentTrack, changeIsPlaying, deviceId, transferPlayback]);

  // get player state from another device if our device is not the current active device
  // because event player_state_changed not fired when we are not in local playback / device
  useEffect(() => {
    getPlaybackState(); 
    const interval = setInterval(() => {
      if (!isPlayerActive && deviceId) {
        getPlaybackState();
      }
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [isPlayerActive, deviceId, getPlaybackState]);

  const getButtonColor = (isActive: boolean): string => {
    return isActive ? 'rgb(52, 211, 153)' : 'white';
  };

  useEffect(() => {
      getUserDevices();
      const interval = setInterval(() => {
        getUserDevices();
      }, 30 * 1000);

      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const intervalSecond = 500; // 0.5s
      const interval = setInterval(() => {
        const newPositionMs = positionMs + intervalSecond;
        if (newPositionMs >= duration) {
          getPlaybackState();
        }
        setPositionMs(newPositionMs);
      }, intervalSecond);

      return () => clearInterval(interval);
    }
  }, [positionMs, isPlaying, duration, getPlaybackState]);

  const handleOpenLyric = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleAfterClickLink();
    history.push('/lyric');
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
    <div className="h-full w-full border-t-2 border-light-black-1 bg-light-black text-sm sm:text-xs">
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
            className="grid grid-cols-3 gap-4 items-center h-85%"
            onClick={isMobilePlayer ? handleshowFullPlayer : undefined}
          >
            <div ref={trackRef} className="flex items-center col-span-2 lg:col-span-1 whitespace-nowrap overflow-x-hidden">
              {currentTrack && currentTrack.uri && (
                <>
                  <img
                    src={getSmallestImage(currentTrack.album?.images)}
                    alt={currentTrack.album?.name}
                    className="pl-2 lg:pl-4 pr-4 z-10 bg-light-black"
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

            <div className="hidden lg:flex flex-col items-center justify-around">
              <div className="flex justify-center items-center">
                <MdShuffle
                  className="h-6 w-6 sm:h-5 sm:w-5 mx-3 cursor-pointer"
                  color={getButtonColor(shuffle)}
                  onClick={handleShuffle}
                />
                <MdSkipPrevious
                  className="h-6 w-6 sm:h-5 sm:w-5 mx-3 cursor-pointer"
                  onClick={handlePrev}
                />
                {currentTrack.type === 'episode' && (
                  <MdReplay10
                    className="h-6 w-6 sm:h-5 sm:w-5 mx-3 cursor-pointer"
                    onClick={(e) => handleSeek(e, positionMs - (10 * 1000))}
                  />
                )}
                {isPlaying ? (
                  <MdPauseCircle
                    className="h-10 w-10 mx-3 cursor-pointer"
                    onClick={handlePlay}
                  />
                ) : (
                  <MdPlayCircle
                    className="h-10 w-10 mx-3 cursor-pointer"
                    onClick={handlePlay}
                  />
                )}
                {currentTrack.type === 'episode' && (
                  <MdForward10
                    className="h-6 w-6 sm:h-5 sm:w-5 mx-3 cursor-pointer"
                    onClick={(e) => handleSeek(e, positionMs + (10 * 1000))}
                  />
                )}
                <MdSkipNext
                  className="h-6 w-6 sm:h-5 sm:w-5 mx-3 cursor-pointer"
                  onClick={handleNext}
                />
                {repeatMode === 2 ? (
                  <MdRepeatOne
                    className="h-6 w-6 sm:h-5 sm:w-5 mx-3 cursor-pointer"
                    color={getButtonColor(true)}
                    onClick={handleRepeatMode}
                  />
                ) : (
                  <MdRepeat
                    className="h-6 w-6 sm:h-5 sm:w-5 mx-3 cursor-pointer"
                    color={getButtonColor(repeatMode !== 0)}
                    onClick={handleRepeatMode}
                  />
                )}
              </div>
              <div className="flex justify-center items-center w-full mt-1">
                <div className="mr-2">{durationFn(positionMs)}</div>
                <input
                  type="range"
                  id="progressbar"
                  className="h-2 w-full mr-2"
                  max={duration}
                  value={positionMs}
                  onChange={(e) => setPositionMs(Number(e.target.value))}
                  onPointerUp={(e: React.MouseEvent<HTMLInputElement>) =>
                    handleSeek(e, Number(e.currentTarget.value))
                  }
                />
                <div
                  className="font-light cursor-pointer"
                  onClick={() => setIsEnableReverseDuration((prevState) => !prevState)}
                >
                  {isEnableReverseDuration ? `-${durationFn(duration - positionMs)}` : durationFn(duration)}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-center pr-2 lg:pr-4 h-full">
              <div className="flex mb-2">
                {currentTrack && currentTrack.type === 'track' && (
                  <div>
                    <MdMic
                      className="h-6 w-6 sm:h-5 sm:w-5 mr-4 cursor-pointer"
                      onClick={handleOpenLyric}
                    />
                  </div>
                )}
                <MdDevices
                  className="h-6 w-6 sm:h-5 sm:w-5 mr-4 cursor-pointer"
                  onClick={handleShowDeviceSelector}
                />
                <div className="hidden lg:flex items-center mr-4">
                  {volume > 50 && <MdVolumeUp className="h-8 w-8 sm:h-4 sm:w-4 cursor-pointer mr-2" />}
                  {volume > 0 && volume <= 50 && <MdVolumeDown className="h-8 w-8 sm:h-4 sm:w-4 cursor-pointer mr-2" />}
                  {volume <= 0 && <MdVolumeOff className="h-8 w-8 sm:h-4 sm:w-4 cursor-pointer mr-2" />}
                  <input
                    type="range"
                    id="volumeebar"
                    className="w-40 h-2 text-green-200"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    onMouseUp={(e: React.MouseEvent<HTMLInputElement>) =>
                      handleVolume(e, Number(e.currentTarget.value))
                    }
                    onTouchEnd={(e: React.TouchEvent<HTMLInputElement>) =>
                      handleVolume(e, Number(e.currentTarget.value))
                    }
                  />
                </div>
                <div className="block lg:hidden">
                  {isPlaying ? (
                    <MdPause
                      className="h-6 w-6 sm:h-5 sm:w-5 cursor-pointer"
                      onClick={handlePlay}
                    />
                  ) : (
                    <MdPlayArrow
                      className="h-6 w-6 sm:h-5 sm:w-5 cursor-pointer"
                      onClick={handlePlay}
                    />
                  )}
                </div>
                <div className="hidden lg:block">
                  <FiMaximize2
                    className="h-6 w-6 sm:h-5 sm:w-5 cursor-pointer"
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
            <div className="block lg:hidden text-green-400 text-xs text-center w-full">
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
          duration={duration}
          volume={volume}
          positionMs={positionMs}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          handlePlay={handlePlay}
          handlePrev={handlePrev}
          handleNext={handleNext}
          setPositionMs={setPositionMs}
          handleSeek={handleSeek}
          handleVolume={handleVolume}
          handleShuffle={handleShuffle}
          handleRepeatMode={handleRepeatMode}
          handleOpenLyric={handleOpenLyric}
          handleAfterClickLink={handleAfterClickLink}
          handleShowDeviceSelector={handleShowDeviceSelector}
        />
      )}
    </FullScreen>

    </div>
  );
};

export default WebPlayback;

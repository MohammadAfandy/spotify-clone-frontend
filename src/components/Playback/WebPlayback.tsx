import {
  useState,
  useEffect,
  useContext,
  Fragment,
  useRef,
} from 'react';
import { useHistory } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import {
  getCookie,
  setCookie,
  getSmallestImage,
  duration as durationFn,
} from '../../utils/helpers';
import { PlayerContext } from '../../context/player-context';
import ApiSpotify from '../../utils/api-spotify';
import Track from '../../types/Track';
import {
  Airplay,
  Mic,
  Pause,
  PauseCircle,
  Play,
  PlayCircle,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume,
} from 'react-feather';
import useWindowSize from '../../hooks/useWindowSize';
import { BACKEND_URI, PLAYER_NAME } from '../../utils/constants';

import Button from '../Button/Button';
import TextLink from '../Text/TextLink';

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

window.Spotify = window.Spotify || {};

type PlaybackState = {
  track_window: {
    current_track: Track;
    next_tracks: Track[];
    previous_tracks: Track[];
  };
  context: {
    uri: string;
  };
  disallows: {
    pausing: boolean;
    peeking_next: boolean;
    peeking_prev: boolean;
    resuming: boolean;
    seeking: boolean;
    skipping_prev: boolean;
  };
  duration: number;
  loading: boolean;
  paused: boolean;
  playback_quality: string;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  timestamp: number;
};

type Device = {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
};

type Player = {
  addListener: (type: string, callback: (arg: any) => void) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (position_ms: number) => Promise<void>;
  getVolume: () => Promise<number>;
  setVolume: (volume_percent: number) => Promise<void>;
  getCurrentState: () => Promise<PlaybackState>;
} | undefined;

const mapRepeatMode = [
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
  const [devices, setDevices] = useState([]);

  const [positionMs, setPositionMs] = useState(0);

  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [isOverFlow, setIsOverflow] = useState(false);

  useEffect(() => {
    if (trackRef.current) {
      if (trackRef.current.clientWidth < trackRef.current.scrollWidth) {
        setIsOverflow(true);
        return;
      }
    }
    setIsOverflow(false);
  }, [currentTrack.id, windowWidth, windowHeight]);

  const transferPlayback = async (device_id: string): Promise<void> => {
    await ApiSpotify.put('/me/player', { device_ids: [device_id] });
  };

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
        name: PLAYER_NAME,
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
            setCookie('access_token', accessToken);
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
              
              initPlayer?.getVolume().then((volume) => {
                setVolume(volume * 100);
              });

              // console.info('state from player_state_changed', state);
            } catch (error) {
              console.error(error);
            }
          } else {
            setIsPlayerActive(false);
          }
        });

        initPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
          setError('');
          setDeviceId(device_id);
          setCookie('device_id', device_id);
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

  const handlePlayThisDevice = async (): Promise<void> => {
    await transferPlayback(deviceId);
  };

  const handlePlay = async (): Promise<void> => {
    if (isPlayerActive) {
      player && player.togglePlay();
    } else {
      if (isPlaying) {
        await ApiSpotify.put('me/player/pause');
        getPlaybackState();
      } else {
        await ApiSpotify.put('me/player/play');
        getPlaybackState();
      }
    }
  };

  const handlePrev = async (): Promise<void> => {
    if (isPlayerActive) {
      if (positionMs <= 3000) {
        player && player.previousTrack();
      } else {
        player && player.seek(0);
      }
    } else {
      if (positionMs <= 3000) {
        await ApiSpotify.put('me/player/previous');
        getPlaybackState();
      } else {
        await ApiSpotify.put('me/player/seek', null, { params: {
          position_ms: 0,
        }});
        getPlaybackState();
      }
    }
  };

  const handleNext = async (): Promise<void> => {
    if (isPlayerActive) {
      player && player.nextTrack();
    } else {
      await ApiSpotify.post('me/player/next');
      getPlaybackState();
    }
  };

  const handleSeek = async (position_ms: number): Promise<void> => {
    if (isPlayerActive) {
      player && player.seek(position_ms);
    } else {
      await ApiSpotify.put('me/player/seek', null, { params: {
        position_ms,
      }});
      getPlaybackState();
    }
  };

  const handleVolume = async (volume_percent: number): Promise<void> => {
    if (isPlayerActive) {
      player && player.setVolume(volume_percent / 100);
    } else {
      await ApiSpotify.put('me/player/volume', null, { params: {
        volume_percent,
      }});
    }
  };

  const handleRepeatMode = async (): Promise<void> => {
    let state = '';
    const currentModeIndex = mapRepeatMode.findIndex(
      (v) => v.mode === repeatMode
    );
    if (mapRepeatMode[currentModeIndex + 1]) {
      state = mapRepeatMode[currentModeIndex + 1].state;
    } else {
      state = mapRepeatMode[0].state;
    }
    await ApiSpotify.put('me/player/repeat', null, { params: { state } });
    if (!isPlayerActive) {
      getPlaybackState();
    }
  };

  const handleShuffle = async (): Promise<void> => {
    await ApiSpotify.put('me/player/shuffle', null, {
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
    getUserDevices();
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

  const getPlaybackState = async (): Promise<void> => {
    const { data: responseData } = await ApiSpotify.get('me/player');
    if (!responseData) {
      if (deviceId) handlePlayThisDevice();
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
      } = item;
  
      setDuration(duration_ms);
      setPositionMs(progress_ms);
      changeIsPlaying(is_playing);
      setShuffle(shuffle_state);
      setRepeatMode(mapRepeatMode.find((v) => v.state === repeat_state)?.mode || 0);
      setVolume(device.volume_percent);
      changeCurrentTrack(item);
    }
  };

  // get player state from another device every 5 second if our device is not current active device
  // because event player_state_changed not fired when we are not in local playback / device
  // and currenty I'm not doing this because of rate limit
  useEffect(() => {
    getPlaybackState(); 
    const interval = setInterval(() => {
      if (!isPlayerActive && deviceId) {
        getPlaybackState();
      }
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [isPlayerActive, deviceId]);

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
        setPositionMs(positionMs + 500);
      }, intervalSecond);

      return () => clearInterval(interval);
    }
  }, [positionMs, isPlaying]);

  const PlayPauseIcon = isPlaying ? PauseCircle : PlayCircle;
  const PlayPauseIconMini = isPlaying ? Pause : Play;

  const handleOpenLyric = () => {
    history.push('/lyric');
  };

  return (
    <div className="h-full w-full border-t-2 border-gray-200 border-opacity-50 bg-black text-sm">
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
      {!error && deviceId && (
        <div className="grid grid-cols-3 gap-4 items-center h-full">
          <div ref={trackRef} className="flex items-end col-span-2 lg:col-span-1 whitespace-nowrap overflow-x-hidden">
            {currentTrack && currentTrack.uri && (
              <>
                <img
                  src={getSmallestImage(currentTrack.album.images)}
                  alt={currentTrack.album.name}
                  className="h-12 pl-2 lg:pl-10 pr-4 z-10 bg-black"
                />
                <div className={`flex flex-col mr-6 relative ${isOverFlow ? 'animate-marquee' : ''}`}>
                  {currentTrack.type === 'track' && (
                    <div className="font-semibold">
                      {currentTrack.name}
                    </div>
                  )}
                  {currentTrack.type === 'episode' && (
                    <TextLink
                      className="font-semibold"
                      text={currentTrack.name}
                      url={'/episode/' + currentTrack.id}
                    />
                  )}
                  <div className="font-light">
                    {currentTrack.artists.map((artist, idx) => (
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
              <Shuffle
                className="h-4 w-4 mr-6 cursor-pointer"
                color={getButtonColor(shuffle)}
                onClick={() => handleShuffle()}
              />
              <SkipBack
                className="h-4 w-4 mr-6 cursor-pointer"
                onClick={() => handlePrev()}
              />
              <PlayPauseIcon
                className="h-10 w-10 mr-6 cursor-pointer"
                onClick={() => handlePlay()}
              />
              <SkipForward
                className="h-4 w-4 mr-6 cursor-pointer"
                onClick={() => handleNext()}
              />
              <div className="relative">
                <Repeat
                  className="h-4 w-4 mr-6 cursor-pointer"
                  color={getButtonColor(repeatMode !== 0)}
                  onClick={() => handleRepeatMode()}
                />
                <div
                  className={`absolute left-2 top-4 bottom-0 text-xs font-light ${
                    repeatMode !== 0 ? 'text-green-400' : 'text-white'
                  }`}
                >
                  {mapRepeatMode.find((v) => v.mode === repeatMode)?.text || ''}
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center w-full">
              <div className="mr-2">{durationFn(positionMs)}</div>
              <input
                type="range"
                id="progressbar"
                className="h-2 w-full mr-2"
                max={duration}
                value={positionMs}
                onChange={(e) => setPositionMs(Number(e.target.value))}
                onPointerUp={(e: React.MouseEvent<HTMLInputElement>) =>
                  handleSeek(Number(e.currentTarget.value))
                }
              />
              <div className="group">
                <div className="group-hover:block hidden">
                  {durationFn(duration - positionMs)}
                </div>
                <div className="group-hover:hidden block">
                  {durationFn(duration)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center pr-2 lg:pr-10">
            {currentTrack && currentTrack.type === 'track' && (
              <div>
                <Mic
                  className="w-6 mr-4 cursor-pointer"
                  onClick={handleOpenLyric}
                />
              </div>
            )}
            <div data-tip data-for="device-tooltip" data-event="click focus">
              <Airplay className="w-6 mr-4 cursor-pointer" />
            </div>
            <div className="hidden lg:flex items-center">
              <Volume className="w-6 cursor-pointer" />
              <input
                type="range"
                id="volumeebar"
                className="w-40 h-2 text-green-200"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                onMouseUp={(e: React.MouseEvent<HTMLInputElement>) =>
                  handleVolume(Number(e.currentTarget.value))
                }
                onTouchEnd={(e: React.TouchEvent<HTMLInputElement>) =>
                  handleVolume(Number(e.currentTarget.value))
                }
              />
            </div>
            <div className="block lg:hidden">
              <PlayPauseIconMini
                className="w-6 mr-4 cursor-pointer"
                onClick={() => handlePlay()}
              />
            </div>
          </div>

          <ReactTooltip
            id="device-tooltip"
            backgroundColor="#2e77d0"
            globalEventOff="click"
            textColor="white"
          >
            <div className="text-lg w-60 pointer-events-auto">
              <p className="text-xl mb-2">Select Device</p>
              {/* <div className={`cursor-pointer`}>This Player</div> */}
              {devices
                // .filter(({ id }, idx, arr) => idx === arr.findIndex((v: Device) => v.id === id))
                .map(({ name, id }) => (
                  <div
                    key={id}
                    className={`cursor-pointer border-b-2 border-white border-opacity-20 mb-1 text-sm ${
                      id === activeDevice?.id ? 'text-green-200' : ''
                    }`}
                    onClick={(e) => handleSelectDevice(e, id)}
                  >
                    {name} {id === deviceId && (<b>(This Player)</b>)}
                  </div>
                ))}
            </div>
          </ReactTooltip>
        </div>
      )}
    </div>
  );
};

export default WebPlayback;

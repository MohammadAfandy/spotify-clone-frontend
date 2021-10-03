import { useState, useEffect, useContext, Fragment } from 'react';
import ReactTooltip from 'react-tooltip';
import { isMobile } from 'react-device-detect';
import {
  getCookie,
  setCookie,
  getSmallestImage,
  duration as durationFn,
  getArtistNames,
} from '../../utils/helpers';
import { PlayerContext } from '../../context/player-context';
import ApiSpotify from '../../utils/api-spotify';
import ApiBackend from '../../utils/api-backend';
import Track from '../../types/Track';
import {
  Airplay,
  Mic,
  PauseCircle,
  PlayCircle,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume,
} from 'react-feather';
import { PLAYER_NAME } from '../../utils/constants';

import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import TextLink from '../Link/TextLink';

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

const initialLyric = {
  lyric: '',
  artist: '',
  title: '',
};

const mapRepeatMode = [
  { state: 'off', mode: 0, text: '' },
  { state: 'context', mode: 1, text: '•' },
  { state: 'track', mode: 2, text: '1' },
];

const WebPlayback: React.FC = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [lyric, setLyric] = useState(initialLyric);

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

  const getUserDevices = async () => {
    const response = await ApiSpotify.get('/me/player/devices');
    const devices = response.data.devices;
    setDevices(devices);
    setActiveDevice(devices.find((device: Device) => device.is_active));
    return devices;
  };

  const transferPlayback = async (device_id: string): Promise<void> => {
    await ApiSpotify.put('/me/player', { device_ids: [device_id] });
  };

  useEffect(() => {
    getUserDevices();

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
        getOAuthToken: (cb: (token: string) => {}) => {
          cb(getCookie('access_token'));
        },
        // volume: 1,
      });

      if (initPlayer) {
        setPlayer(initPlayer);

        initPlayer.addListener('initialization_error', (state) => {
          setError(state.message);
          console.error('initialization_error', state.message);
        });
        initPlayer.addListener('authentication_error', (state) => {
          setError(state.message);
          console.error('authentication_error', state.message);
        });
        initPlayer.addListener('account_error', (state) => {
          setError(state.message);
          console.error('account_error', state.message);
        });
        initPlayer.addListener('playback_error', (state) => {
          setError(state.message);
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
              console.log('state from player_state_changed', state);
  
              initPlayer?.getVolume().then((volume) => {
                console.log('volume', volume);
                setVolume(volume * 100);
              });
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
    player && player.togglePlay();
  };

  const handlePrev = async (): Promise<void> => {
    if (positionMs <= 3000) {
      player && player.previousTrack();
    } else {
      player && player.seek(0);
    }
  };

  const handleNext = async (): Promise<void> => {
    player && player.nextTrack();
  };

  const handleSeek = async (position_ms: number): Promise<void> => {
    player && player.seek(position_ms);
  };

  const handleVolume = async (volume_percent: number): Promise<void> => {
    player && player.setVolume(volume_percent / 100);
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
  };

  const handleShuffle = async (): Promise<void> => {
    await ApiSpotify.put('me/player/shuffle', null, {
      params: { state: !shuffle },
    });
  };

  const handleSelectDevice = async (
    event: React.MouseEvent,
    selectedDeviceId: string
  ): Promise<void> => {
    event.stopPropagation();
    await transferPlayback(selectedDeviceId);
  };

  // get player state from another device every 5 second if our device is not current active device
  // because event player_state_changed not fired when we are not in local playback / device
  // and currenty I'm not doing this because of rate limit
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // if (activeDevice.id !== deviceId) {
  //       getPlaybackState();
  //     // }
  //   }, 10 * 1000);

  //   return () => clearInterval(interval);
  // // }, [activeDevice.id, deviceId]);
  // }, []);

  const getButtonColor = (isActive: boolean): string => {
    return isActive ? 'rgb(52, 211, 153)' : 'white';
  };

  useEffect(() => {
    if (isPlayerActive) {
      const intervalSecond = 10 * 1000; // 1 min
      const interval = setInterval(() => {
        getUserDevices();
      }, intervalSecond);
  
      return () => clearInterval(interval);
    }
  }, [isPlayerActive]);

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

  const handleOpenLyric = async () => {
    try {
      if (currentTrack.id) {
        setLyric(initialLyric);
        const artist = getArtistNames(currentTrack.artists);
        const title = currentTrack.name;
        const response = await ApiBackend.get('/lyrics', {
          params: {
            artist,
            title,
          },
        });
        setLyric({
          artist,
          title,
          lyric: response.data.lyric || 'No Lyrics Found.',
        });
        setIsOpenModal(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-full w-full border-t-2 border-gray-200 border-opacity-50 bg-black text-sm">
      {error && (
        <div className="flex flex-col items-center justify-center h-full">
          {error}
        </div>
      )}
      {!error && !deviceId && (
        <div className="flex flex-col items-center justify-center h-full">
          Loading ...
        </div>
      )}
      {!error && deviceId && !isPlayerActive && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="mb-2">You are not listening on this Device</div>
          <Button
            className=""
            text="Play Here"
            onClick={() => handlePlayThisDevice()}
            color="green"
          />
        </div>
      )}
      {!error && deviceId && isPlayerActive && isMobile && (
        <div className="flex flex-col m-2 h-full">
          <div className="flex items-end h-full mb-4">
            <img
              src={getSmallestImage(currentTrack.album.images)}
              alt={currentTrack.album.name}
              className="mr-4 w-12"
            />
            <div className="flex flex-col mr-6 w-60">
              {currentTrack.type === 'track' && (
                <div className="font-semibold truncate">
                  {currentTrack.name}
                </div>
              )}
              {currentTrack.type === 'episode' && (
                <TextLink
                  className="font-semibold truncate"
                  text={currentTrack.name}
                  url={'/episode/' + currentTrack.id}
                />
              )}
              <div className="font-light truncate">
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
            <PlayPauseIcon
              className="h-8 w-8 cursor-pointer"
              onClick={() => handlePlay()}
            />
          </div>
          <div className="flex justify-center items-center w-full">
            <input
              className="h-1 w-full"
              type="range"
              id="progressbar"
              max={duration}
              value={positionMs}
              onChange={(e) => setPositionMs(Number(e.target.value))}
              onMouseUp={(e: React.MouseEvent<HTMLInputElement>) =>
                handleSeek(Number(e.currentTarget.value))
              }
            />
          </div>
        </div>
      )}
      {!error && deviceId && isPlayerActive && !isMobile && (
        <div className="grid grid-cols-3 justify-center items-center h-full">
          <div className="flex items-end ml-10">
            {currentTrack && currentTrack.uri && (
              <>
                <img
                  src={getSmallestImage(currentTrack.album.images)}
                  alt={currentTrack.album.name}
                  className="mr-4 w-12"
                />
                <div className="flex flex-col mr-6 w-60">
                  {currentTrack.type === 'track' && (
                    <div className="font-semibold truncate">
                      {currentTrack.name}
                    </div>
                  )}
                  {currentTrack.type === 'episode' && (
                    <TextLink
                      className="font-semibold truncate"
                      text={currentTrack.name}
                      url={'/episode/' + currentTrack.id}
                    />
                  )}
                  <div className="font-light truncate">
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

          <div className="hidden md:flex flex-col items-center justify-around">
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
                onMouseUp={(e: React.MouseEvent<HTMLInputElement>) =>
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

          <div className="hidden md:flex justify-end items-center mr-10">
            {currentTrack && currentTrack.type === 'track' && (
              <Mic
                className="w-6 mr-6 cursor-pointer"
                onClick={handleOpenLyric}
              />
            )}
            <div data-tip data-for="device-tooltip" data-event="click focus">
              <Airplay className="w-6 mr-6 cursor-pointer" />
            </div>
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
            />
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
                // .filter(({ id }) => id !== deviceId)
                .map(({ name, id }) => (
                  <div
                    key={id}
                    className={`cursor-pointer border-b-2 border-white border-opacity-20 mb-1 text-sm ${
                      id === activeDevice?.id ? 'text-green-200' : ''
                    }`}
                    onClick={(e) => handleSelectDevice(e, id)}
                  >
                    {name}
                  </div>
                ))}
            </div>
          </ReactTooltip>
        </div>
      )}
      <Modal
        show={isOpenModal}
        title={`${lyric.artist} - ${lyric.title}`}
        handleCloseModal={() => setIsOpenModal(false)}
      >
        <div className="whitespace-pre overflow-y-auto h-105">
          {lyric.lyric}
        </div>
      </Modal>
    </div>
  );
};

export default WebPlayback;

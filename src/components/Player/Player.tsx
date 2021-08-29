import { useState, useEffect, useContext, Fragment } from 'react';
import ReactTooltip from 'react-tooltip';
import {
  getCookie,
  setCookie,
  getSmallestImage,
  sleep,
  duration as durationFn,
  getArtistNames,
} from '../../utils/helpers';
import { PlayerContext } from '../../context/player-context';
import ApiSpotify from '../../utils/api-spotify';
import ApiBackend from '../../utils/api-backend';
import Track from '../../types/Track';
import {
  Airplay,
  List,
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
import LikeButton from '../Button/LikeButton';
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

let player: {
  addListener: (type: string, callback: (arg: any) => void) => void;
  connect: () => void;
  disconnect: () => void;
};

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

const Player: React.FC = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [lyric, setLyric] = useState(initialLyric);

  const {
    isPlaying,
    changeIsPlaying,
    currentTrack,
    changeCurrentTrack,
    changePositionMs,
    changeIsError,
  } = useContext(PlayerContext);

  const [isDeviceActive, setIsDeviceActive] = useState(false);

  const [deviceId, setDeviceId] = useState('');
  const [activeDevice, setActiveDevice] = useState<Device>({} as Device);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [devices, setDevices] = useState([]);

  const [positionMs, setPositionMs] = useState(0);

  const getUserDevices = async () => {
    const response = await ApiSpotify.get('/me/player/devices');
    setDevices(response.data.devices);
  };

  const transferPlayback = async (device_id: string): Promise<void> => {
    await ApiSpotify.put('/me/player', { device_ids: [device_id] });
  };

  const playerInit = () => {
    player = new window.Spotify.Player({
      name: PLAYER_NAME,
      getOAuthToken: (cb: (token: string) => {}) => {
        cb(getCookie('access_token'));
      },
    });

    player.addListener('initialization_error', (state) => {
      changeIsError(true);
      console.error('initialization_error', state.message);
    });
    player.addListener('authentication_error', (state) => {
      console.error('authentication_error', state.message);
    });
    player.addListener('account_error', (state) => {
      console.error('account_error', state.message);
    });
    player.addListener('playback_error', (state) => {
      console.error('playback_error', state.message);
    });

    player.addListener('player_state_changed', (state: PlaybackState) => {
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
          setIsDeviceActive(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setIsDeviceActive(false);
      }
    });

    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      changeIsError(false);
      console.info('Ready with Device ID', device_id);
      setDeviceId(device_id);
      setCookie('device_id', device_id);
    });

    player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.info('Device ID has gone offline', device_id);
    });

    player.connect();
  };

  window.onSpotifyWebPlaybackSDKReady = () => playerInit();

  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      document.body.appendChild(script);
    };

    const getPlaybackState = async () => {
      const response = await ApiSpotify.get('/me/player');
      if (response.status === 200) {
        const {
          progress_ms,
          item,
          device,
          shuffle_state,
          repeat_state,
          is_playing,
        } = response.data;
        setPositionMs(progress_ms);
        setDuration(item && item.duration_ms);
        setVolume(device.volume_percent);
        setShuffle(shuffle_state);
        setRepeatMode(
          mapRepeatMode.find((v) => v.state === repeat_state)?.mode || 0
        );
        changeIsPlaying(is_playing);
        changeCurrentTrack(item);
        setActiveDevice(device);
      } else if (response.status === 204) {
        // no devices active
      }
    };
    loadScript();
    getUserDevices();
    getPlaybackState();

    return () => {
      if (player) player.disconnect();
    };
  }, [changeIsPlaying, changeCurrentTrack]);

  const handlePlayThisDevice = async (): Promise<void> => {
    await transferPlayback(deviceId);
  };

  const handlePlay = async (): Promise<void> => {
    let typeUri = 'play';
    if (isPlaying) {
      typeUri = 'pause';
    }
    try {
      await ApiSpotify.put('me/player/' + typeUri);
      if (typeUri === 'pause') {
        // save last position ms in player context
        changePositionMs(positionMs);
      }
    } catch (error) {
      console.error(error);
      if (error.response.status === 404) {
        // no device found
        if (typeUri === 'play') {
          await transferPlayback(deviceId);
          await sleep(1000);
          await ApiSpotify.put('me/player/' + typeUri);
        }
      }
    }
  };

  const handlePrev = async (): Promise<void> => {
    if (positionMs <= 3000) {
      await ApiSpotify.post('me/player/previous');
    } else {
      await ApiSpotify.put('me/player/seek', null, {
        params: { position_ms: 0 },
      });
    }
  };

  const handleNext = async (): Promise<void> => {
    await ApiSpotify.post('me/player/next');
  };

  const handleSeek = async (position_ms: number): Promise<void> => {
    await ApiSpotify.put('me/player/seek', null, { params: { position_ms } });
  };

  const handleVolume = async (volume_percent: number): Promise<void> => {
    await ApiSpotify.put('me/player/volume', null, {
      params: { volume_percent },
    });
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

  const handleSelectDevice = (
    event: React.MouseEvent,
    selectedDeviceId: string
  ): void => {
    event.stopPropagation();
    transferPlayback(selectedDeviceId);
    getUserDevices();
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
    const intervalSecond = 500; // 0.5s
    if (isPlaying) {
      const interval = setInterval(() => {
        setPositionMs(positionMs + 500);
      }, intervalSecond);

      return () => clearInterval(interval);
    }
  }, [positionMs, isPlaying]);

  const PlayPauseIcon = isPlaying ? PauseCircle : PlayCircle;

  const handleAddToSavedTrack = (id: string) => {
    console.error('Ups, not yet implemented');
  };

  const handleOpenList = () => {
    console.error('Ups, not yet implemented because no queue endpoint');
  };

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
    <div className="grid grid-cols-3 h-full w-full border-t-2 border-gray-200 border-opacity-20 bg-black text-sm">
      {!isDeviceActive && !deviceId && (
        <div className="col-span-3 flex flex-col items-center justify-center">
          Loading ...
        </div>
      )}
      {!isDeviceActive && deviceId && (
        <div className="col-span-3 flex flex-col items-center justify-center">
          <div className="mb-2">You are not listening on this Device</div>
          <Button
            className=""
            text="Play Here"
            onClick={() => handlePlayThisDevice()}
            color="green"
          />
        </div>
      )}
      {isDeviceActive && deviceId && (
        <>
          {/* Artist and Love Button */}
          <div className="flex items-center ml-10">
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
                <LikeButton
                  className="w-4 h-4"
                  onClick={() => handleAddToSavedTrack(currentTrack.id)}
                />
              </>
            )}
          </div>

          {/* Player Control */}
          <div className="flex flex-col items-center justify-around">
            {/* <div>{activeDevice.name}</div> */}
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

          {/* mic, list, device, volume */}
          <div className="flex justify-end items-center mr-10">
            {currentTrack && currentTrack.type === 'track' && (
              <Mic
                className="w-6 mr-6 cursor-pointer"
                onClick={handleOpenLyric}
              />
            )}
            <List
              className="w-6 mr-6 cursor-pointer"
              onClick={handleOpenList}
            />
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
                      id === activeDevice.id ? 'text-green-200' : ''
                    }`}
                    onClick={(e) => handleSelectDevice(e, id)}
                  >
                    {name}
                  </div>
                ))}
            </div>
          </ReactTooltip>
        </>
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

export default Player;

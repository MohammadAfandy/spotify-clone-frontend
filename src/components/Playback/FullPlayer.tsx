import {
  Airplay,
  ChevronsLeft,
  ChevronsRight,
  Mic,
  PauseCircle,
  PlayCircle,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'react-feather';
import Player from '../../types/Player';
import Device from '../../types/Device';
import RepeatMode from '../../types/RepeatMode';
import { duration as durationFn, sleep } from '../../utils/helpers';

import { getHighestImage } from '../../utils/helpers';
import { Fragment, useEffect, useRef, useState } from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import TextLink from '../Text/TextLink';
import Artist from '../../types/Artist';
import FullScreen from '../FullScreen/FullScreen';
import DeviceSelector from './DeviceSelector';

type FullPlayerProps = {
  className?: string;
  player: Player;
  mapRepeatMode: RepeatMode;
  isPlayerActive: boolean;
  activeDevice: Device | null;
  deviceId: string;
  shuffle: boolean;
  repeatMode: number;
  duration: number;
  volume: number;
  devices: Device[];
  positionMs: number;
  currentTrack: Record<string, any>;
  isPlaying: boolean;
  showFullPlayer: boolean;
  handlePlay: (event: React.MouseEvent) => Promise<void>;
  handlePrev: (event: React.MouseEvent) => Promise<void>;
  // handlePrevFifteen: (event: React.MouseEvent) => Promise<void>;
  handleNext: (event: React.MouseEvent) => Promise<void>;
  // handleNextFifteen: (event: React.MouseEvent) => Promise<void>;
  setPositionMs: (position_ms: number) => void;
  handleSeek: (event: React.MouseEvent, position_ms: number) => Promise<void>;
  handleVolume: (event: React.MouseEvent, volume_percent: number) => Promise<void>;
  handleShuffle: (event: React.MouseEvent) => Promise<void>;
  handleRepeatMode: (event: React.MouseEvent) => Promise<void>;
  handleSelectDevice: (event: React.MouseEvent, selectedDeviceId: string) => Promise<void>;
  handleOpenLyric: (event: React.MouseEvent) => void;
  setShowFullPlayer: (showFullPlayer: boolean) => void;
};

const FullPlayer: React.FC<FullPlayerProps> = ({
  className,
  player,
  mapRepeatMode,
  isPlayerActive,
  activeDevice,
  deviceId,
  shuffle,
  repeatMode,
  duration,
  volume,
  devices,
  positionMs,
  currentTrack,
  isPlaying,
  showFullPlayer,
  handlePlay,
  handlePrev,
  handleNext,
  handleSeek,
  setPositionMs,
  handleVolume,
  handleShuffle,
  handleRepeatMode,
  handleSelectDevice,
  handleOpenLyric,
  setShowFullPlayer,
}) => {

  const trackRef = useRef<HTMLDivElement>(null);

  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  const [isOverFlow, setIsOverflow] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const PlayPauseIcon = isPlaying ? PauseCircle : PlayCircle;
  const getButtonColor = (isActive: boolean): string => {
    return isActive ? 'rgb(52, 211, 153)' : 'white';
  };

  useEffect(() => {
    if (trackRef.current) {
      if (trackRef.current.clientWidth < trackRef.current.scrollWidth) {
        setIsOverflow(true);
        return;
      }
    }
    setIsOverflow(false);
  }, [currentTrack.id, windowWidth, windowHeight]);

  const handleShowDeviceSelector = async () => {
    setShowFullPlayer(false);
    await sleep(300);
    setShowDeviceSelector(true);
    setShowFullPlayer(true);
  };

  const handleClosePlayer = async () => {
    if (showDeviceSelector) {
      setShowDeviceSelector(false);
      setShowFullPlayer(false);
      await sleep(300);
      setShowFullPlayer(true);
    } else {
      setShowFullPlayer(false);
    }
  }

  return (
    <FullScreen
      isOpen={showFullPlayer}
      handleCloseScreen={handleClosePlayer}
    >
      {showDeviceSelector && (
        <DeviceSelector
          activeDevice={activeDevice} 
          deviceId={deviceId} 
          devices={devices} 
          handleSelectDevice={handleSelectDevice}
        />
      )}
      {!showDeviceSelector && (
        <>
          <div className="flex w-full justify-center h-5%">
            <div className="">
              {currentTrack.album?.name}
            </div>
          </div>
          <div className="flex w-full justify-center h-50% mb-2">
            <img
              src={getHighestImage(currentTrack.album?.images)}
              alt={currentTrack.album?.name}
              className="rounded-md"
            />
          </div>
          <div
            ref={trackRef}
            className="flex flex-col w-full whitespace-nowrap overflow-x-hidden h-15%"
          >
            <div className={`flex w-full text-2xl md:text-4xl relative ${isOverFlow ? 'animate-marquee' : ''}`}>
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
                  afterClick={() => setShowFullPlayer(false)}
                />
              )}
            </div>
            <div className="flex w-full relative text-md md:text-lg">
              <div className="font-semibold">
                {currentTrack.artists?.map((artist: Artist, idx: number) => (
                  <Fragment key={artist.uri}>
                    <TextLink
                      text={artist.name}
                      url={
                        (currentTrack.type === 'track'
                          ? '/artist/'
                          : '/show/') + artist.uri.split(':')[2]
                      }
                      afterClick={() => setShowFullPlayer(false)}
                    />
                    {idx !== currentTrack.artists.length - 1 && ', '}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center h-5%">
            <input
              type="range"
              id="progressbar"
              className="h-2 w-full mb-1"
              max={duration}
              value={positionMs}
              onChange={(e) => setPositionMs(Number(e.target.value))}
              onPointerUp={(e: React.MouseEvent<HTMLInputElement>) =>
                handleSeek(e, Number(e.currentTarget.value))
              }
            />
            <div className="w-full flex justify-between text-xs font-light">
              <div className="mr-2">{durationFn(positionMs)}</div>
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
          <div className="flex justify-around items-center mb-2 h-20%">
            <Shuffle
              className="h-8 w-8 cursor-pointer"
              color={getButtonColor(shuffle)}
              onClick={handleShuffle}
            />
            <div className="flex justify-center items-center">
              <SkipBack
                className="h-8 w-8 mx-4 cursor-pointer"
                onClick={handlePrev}
              />
              {currentTrack.type === 'episode' && (
                <div className="relative">
                  <ChevronsLeft
                    className="h-8 w-8 mx-2 cursor-pointer"
                    onClick={(e) => handleSeek(e, positionMs - (15 * 1000))}
                  />
                  <div className="absolute w-2 left-0 right-0 mx-auto top-8 bottom-0 font-light text-xs">
                    15
                  </div>
                </div>
              )}
              <PlayPauseIcon
                className="h-20 w-20 mx-4 cursor-pointer"
                onClick={handlePlay}
              />
              {currentTrack.type === 'episode' && (
                <div className="relative">
                  <ChevronsRight
                    className="h-8 w-8 mx-2 cursor-pointer"
                    onClick={(e) => handleSeek(e, positionMs + (15 * 1000))}
                  />
                  <div className="absolute w-2 left-0 right-0 mx-auto top-8 bottom-0 font-light text-xs">
                    15
                  </div>
                </div>
              )}
              <SkipForward
                className="h-8 w-8 mx-4 cursor-pointer"
                onClick={handleNext}
              />
            </div>
            <div className="relative">
              <Repeat
                className="h-8 w-8 cursor-pointer"
                color={getButtonColor(repeatMode !== 0)}
                onClick={handleRepeatMode}
              />
              <div
                className={`absolute left-1/2 top-8 bottom-0 font-light ${
                  repeatMode !== 0 ? 'text-green-400' : 'text-white'
                }`}
              >
                {mapRepeatMode.find((v) => v.mode === repeatMode)?.text || ''}
              </div>
            </div>
          </div>
          <div className="flex w-full justify-between items-center h-5%">
            <div className="w-8">
              {currentTrack.type === 'track' && (
                <Mic
                  className="cursor-pointer"
                  onClick={handleOpenLyric}
                />
              )}
            </div>
            <div
              className={`flex justify-center items-center cursor-pointer ${activeDevice && activeDevice.id !== deviceId && 'text-green-400'}`}
              onClick={handleShowDeviceSelector}
            >
              {activeDevice && activeDevice.id !== deviceId && (
                <div className="mr-2 text-xs">
                  {activeDevice.name}
                </div>
              )}
              <Airplay className="w-8" />
            </div>
          </div>
        </>
      )}
    </FullScreen>
  );
};

export default FullPlayer;

import {
  MdPlayCircle,
  MdPauseCircle,
  MdSkipPrevious,
  MdSkipNext,
  MdShuffle,
  MdRepeat,
  MdRepeatOne,
  MdMic,
  MdDevices,
  MdForward10,
  MdReplay10,
} from 'react-icons/md';
import Device from '../../types/Device';
import { duration as durationFn } from '../../utils/helpers';

import { getHighestImage } from '../../utils/helpers';
import { Fragment, useEffect, useRef, useState } from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import TextLink from '../Text/TextLink';
import Artist from '../../types/Artist';

type FullPlayerProps = {
  className?: string;
  activeDevice: Device | null;
  deviceId: string;
  shuffle: boolean;
  repeatMode: number;
  duration: number;
  volume: number;
  positionMs: number;
  currentTrack: Record<string, any>;
  isPlaying: boolean;
  handlePlay: (event: React.MouseEvent) => Promise<void>;
  handlePrev: (event: React.MouseEvent) => Promise<void>;
  handleNext: (event: React.MouseEvent) => Promise<void>;
  setPositionMs: (position_ms: number) => void;
  handleSeek: (event: React.MouseEvent, position_ms: number) => Promise<void>;
  handleVolume: (event: React.MouseEvent, volume_percent: number) => Promise<void>;
  handleShuffle: (event: React.MouseEvent) => Promise<void>;
  handleRepeatMode: (event: React.MouseEvent) => Promise<void>;
  handleOpenLyric: (event: React.MouseEvent) => void;
  handleAfterClickLink: () => void;
  handleShowDeviceSelector: (event: React.MouseEvent) => void;
};

const FullPlayer: React.FC<FullPlayerProps> = ({
  className,
  activeDevice,
  deviceId,
  shuffle,
  repeatMode,
  duration,
  volume,
  positionMs,
  currentTrack,
  isPlaying,
  handlePlay,
  handlePrev,
  handleNext,
  handleSeek,
  setPositionMs,
  handleVolume,
  handleShuffle,
  handleRepeatMode,
  handleOpenLyric,
  handleAfterClickLink,
  handleShowDeviceSelector,
}) => {

  const trackRef = useRef<HTMLDivElement>(null);
  const [isOverFlow, setIsOverflow] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowSize();

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

  return (
    <div className="flex flex-col text-md md:text-sm h-full">
      <div className="flex flex-col flex-1 justify-around">
        <div className="flex w-full justify-center">
          <div className="">
            {currentTrack.album?.name}
          </div>
        </div>
        <div className="flex h-3/4 justify-center items-center">
          <img
            src={getHighestImage(currentTrack.album?.images)}
            alt={currentTrack.album?.name}
            className="rounded-md h-3/4 sm:h-full"
          />
        </div>
        <div
          ref={trackRef}
          className="flex flex-col w-full whitespace-nowrap overflow-hidden"
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
                afterClick={handleAfterClickLink}
              />
            )}
          </div>
          <div className="flex w-full relative">
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
                    afterClick={handleAfterClickLink}
                  />
                  {idx !== currentTrack.artists.length - 1 && ', '}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-2">
        <div className="flex flex-col justify-center items-center">
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
        <div className="flex justify-around items-center">
          <MdShuffle
            className="h-8 w-8 cursor-pointer"
            color={getButtonColor(shuffle)}
            onClick={handleShuffle}
          />
          <div className="flex justify-around items-center w-1/2">
            <MdSkipPrevious
              className="h-8 w-8 cursor-pointer"
              onClick={handlePrev}
            />
            {currentTrack.type === 'episode' && (
              <div className="hidden sm:block relative">
                <MdReplay10
                  className="h-8 w-8 cursor-pointer"
                  onClick={(e) => handleSeek(e, positionMs - (10 * 1000))}
                />
                <div className="absolute w-2 left-0 right-0 mx-auto top-8 bottom-0 font-light text-xs">
                  15
                </div>
              </div>
            )}
            {isPlaying ? (
              <MdPauseCircle
                className="h-20 w-20 cursor-pointer"
                onClick={handlePlay}
              />
            ) : (
              <MdPlayCircle
                className="h-20 w-20 cursor-pointer"
                onClick={handlePlay}
              />
            )}
            {currentTrack.type === 'episode' && (
              <div className="hidden sm:block relative">
                <MdForward10
                  className="h-8 w-8 cursor-pointer"
                  onClick={(e) => handleSeek(e, positionMs + (15 * 1000))}
                />
                <div className="absolute w-2 left-0 right-0 mx-auto top-8 bottom-0 font-light text-xs">
                  15
                </div>
              </div>
            )}
            <MdSkipNext
              className="h-8 w-8 cursor-pointer"
              onClick={handleNext}
            />
          </div>
          <div className="relative">
            {repeatMode === 2 ? (
              <MdRepeatOne
                className="h-8 w-8 cursor-pointer"
                color={getButtonColor(true)}
                onClick={handleRepeatMode}
              />
            ) : (
              <MdRepeat
                className="h-8 w-8 cursor-pointer"
                color={getButtonColor(repeatMode !== 0)}
                onClick={handleRepeatMode}
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-4">
        <div className="flex w-full justify-between items-center">
          <div className="w-8">
            {currentTrack.type === 'track' && (
              <MdMic
                className="h-8 w-8 cursor-pointer"
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
            <MdDevices className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPlayer;

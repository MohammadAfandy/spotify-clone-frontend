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
  MdVolumeDown,
  MdVolumeOff,
  MdVolumeUp,
} from 'react-icons/md';
import Device from '../../types/Device';
import { duration as durationFn, sleep } from '../../utils/helpers';

import { getHighestImage } from '../../utils/helpers';
import { Fragment, useEffect, useRef } from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import TextLink from '../Text/TextLink';
import Artist from '../../types/Artist';
import LikeButton from '../Button/LikeButton';
import ControlButton from '../Button/ControlButton';
import RangeInput from '../Input/RangeInput';

type FullPlayerProps = {
  className?: string;
  activeDevice: Device | null;
  deviceId: string;
  shuffle: boolean;
  repeatMode: number;
  skipStep: number;
  duration: number;
  volume: number;
  positionMs: number;
  currentTrack: Record<string, any>;
  isPlaying: boolean;
  isSaved: boolean;
  saveVolume: (volumePercent: number) => void;
  handlePlay: (event: React.MouseEvent) => Promise<void>;
  handlePrev: (event: React.MouseEvent) => Promise<void>;
  handleNext: (event: React.MouseEvent) => Promise<void>;
  setPositionMs: (position_ms: number) => void;
  handleSeek: (event: React.MouseEvent | React.TouchEvent, position_ms: number) => Promise<void>;
  handleVolume: (event: React.MouseEvent | React.TouchEvent, volume_percent: number) => Promise<void>;
  handleShuffle: (event: React.MouseEvent) => Promise<void>;
  handleRepeatMode: (event: React.MouseEvent) => Promise<void>;
  handleOpenLyric: (event: React.MouseEvent) => void;
  handleOpenQueue: (event: React.MouseEvent) => void;
  handleAfterClickLink: () => void;
  handleShowDeviceSelector: (event: React.MouseEvent) => void;
  handleSaveTrack: (event: React.MouseEvent) => void;
};

const FullPlayer: React.FC<FullPlayerProps> = ({
  className,
  activeDevice,
  deviceId,
  shuffle,
  repeatMode,
  skipStep,
  duration,
  volume,
  positionMs,
  currentTrack,
  isPlaying,
  isSaved,
  saveVolume,
  handlePlay,
  handlePrev,
  handleNext,
  handleSeek,
  setPositionMs,
  handleVolume,
  handleShuffle,
  handleRepeatMode,
  handleOpenLyric,
  handleOpenQueue,
  handleAfterClickLink,
  handleShowDeviceSelector,
  handleSaveTrack,
}) => {

  const trackWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (trackWrapperRef.current) {
      const trackOverflow = trackWrapperRef.current.scrollWidth - trackWrapperRef.current.clientWidth;
      if (trackOverflow <= 0) {
        if (trackRef.current) trackRef.current.style.transform = '';
        return;
      }

      let trackTransX = 0;
      let isIncreasing = true;
      let isPaused = false;
      interval = setInterval(async () => {
        if (!isPaused) {
          if (trackTransX < trackOverflow && isIncreasing) {
            trackTransX += 1;
          } else if (trackTransX <= 0) {
            isIncreasing = true;
            isPaused = true;
          } else {
            isIncreasing = false;
            trackTransX -= 1;
          }

          if (trackTransX >= trackOverflow) {
            isPaused = true;
          }
        } else {
          await sleep(5000);
          isPaused = false;
          return;
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${trackTransX}px)`;
        }
      }, 100);
    }

    return () => interval && clearInterval(interval);
  }, [currentTrack.id, windowWidth, windowHeight]);

  return (
    <div className="flex flex-col text-lg h-full">
      <div className="flex flex-col flex-1 justify-around">
        <div className="flex w-full justify-center text-sm">
          <div className="cursor-pointer" onClick={handleOpenQueue}>
            {currentTrack.album?.name}
          </div>
        </div>
        <div className="flex h-full justify-center items-center">
          <img
            src={getHighestImage(currentTrack.album?.images)}
            alt={currentTrack.album?.name}
            className="rounded-md h-85% sm:h-full"
          />
        </div>
        <div className="flex justify-end items-center">
          <div className="flex items-center mt-2">
            <ControlButton
              Icon={volume <= 50 ? (volume > 0 ? MdVolumeDown : MdVolumeOff) : MdVolumeUp}
              className="w-4 mr-2"
              onClick={(e) => handleVolume(e, volume > 0 ? 0 : 100)}
            />
            <RangeInput
              className="w-40"
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
        </div>
        <div className="flex justify-between items-center">
          <div
            ref={trackWrapperRef}
            className="flex flex-col w-80% whitespace-nowrap overflow-hidden mt-2"
          >
            <div className={`flex w-full lg:text-2xl relative`}>
              <div
                ref={trackRef}
                className="font-semibold"
              >
                {currentTrack.type === 'track'
                  ? currentTrack.name
                  : (
                    <TextLink
                      className="opacity-100"
                      text={currentTrack.name}
                      url={'/episode/' + currentTrack.id}
                      afterClick={handleAfterClickLink}
                    />
                  )
                }
              </div>
            </div>
            <div className="flex w-full relative">
              <div className="font-semibold text-sm">
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
          <LikeButton
            isActive={isSaved}
            type={currentTrack.type}
            onClick={handleSaveTrack}
            sizeType="full"
          />
        </div>
      </div>
      <div className="flex flex-col mt-4">
        <div className="flex flex-col justify-center items-center">
          <RangeInput
            className="mb-1"
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
          <div className="w-full flex justify-between text-xs font-light mt-2">
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
          <ControlButton
            Icon={MdShuffle}
            isActive={shuffle}
            onClick={handleShuffle}
            sizeType="full"
          />
          <div className="flex justify-around items-center w-3/4 sm:w-1/2">
            <ControlButton
              Icon={MdSkipPrevious}
              onClick={handlePrev}
              sizeType="full"
            />
            <div className="">
              <ControlButton
                Icon={MdReplay10}
                onClick={(e) => handleSeek(e, positionMs - (skipStep * 1000))}
                sizeType="full"
              />
            </div>
            <ControlButton
              Icon={isPlaying ? MdPauseCircle : MdPlayCircle}
              className="h-16 w-16 canhover:opacity-100"
              onClick={handlePlay}
              sizeType="full"
            />
            <div className="">
              <ControlButton
                Icon={MdForward10}
                onClick={(e) => handleSeek(e, positionMs + (skipStep * 1000))}
                sizeType="full"
              />
            </div>
            <ControlButton
              Icon={MdSkipNext}
              onClick={handleNext}
              sizeType="full"
            />
          </div>
          <ControlButton
            Icon={repeatMode === 2 ? MdRepeatOne : MdRepeat}
            isActive={repeatMode !== 0}
            onClick={handleRepeatMode}
            sizeType="full"
          />
        </div>
      </div>
      <div className="flex flex-col mt-4">
        <div className="flex w-full justify-between items-center">
          <ControlButton
            Icon={MdMic}
            className={`${currentTrack.type === 'episode' ? 'invisible' : 'visible'}`}
            onClick={handleOpenLyric}
            sizeType="full"
          />
          <div
            className={`flex justify-center items-center cursor-pointer ${activeDevice && activeDevice.id !== deviceId && 'text-green-400'}`}
            onClick={handleShowDeviceSelector}
          >
            {activeDevice && activeDevice.id !== deviceId && (
              <div className="mr-2 text-xs">
                {activeDevice.name}
              </div>
            )}
            <ControlButton
              Icon={MdDevices}
              sizeType="full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPlayer;

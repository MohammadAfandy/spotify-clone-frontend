import {
  Airplay,
  ChevronDown,
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
import { duration as durationFn } from '../../utils/helpers';

import styles from './FullPlayer.module.css';
import { getHighestImage } from '../../utils/helpers';
import { Fragment, useEffect, useRef, useState } from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import TextLink from '../Text/TextLink';
import Artist from '../../types/Artist';

type FullPlayerProps = {
  className?: string;
  player: Player;
  mapRepeatMode: RepeatMode;
  isPlayerActive: boolean;
  activeDevice: Device | null;
  shuffle: boolean;
  repeatMode: number;
  duration: number;
  volume: number;
  devices: Device[];
  positionMs: number;
  currentTrack: Record<string, any>;
  isPlaying: boolean;
  showFullPlayer: boolean;
  handlePlay: () => Promise<void>;
  handlePrev: () => Promise<void>;
  handleNext: () => Promise<void>;
  setPositionMs: (position_ms: number) => void;
  handleSeek: (position_ms: number) => Promise<void>;
  handleVolume: (volume_percent: number) => Promise<void>;
  handleShuffle: () => Promise<void>;
  handleRepeatMode: () => Promise<void>;
  handleSelectDevice: (event: React.MouseEvent, selectedDeviceId: string) => Promise<void>;
  handleOpenLyric: () => void;
  handleHideFullPlayer: () => void;
};

const FullPlayer: React.FC<FullPlayerProps> = ({
  className,
  player,
  mapRepeatMode,
  isPlayerActive,
  activeDevice,
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
  handleHideFullPlayer,
}) => {

  const trackRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className={`${styles.fullPlayer} ${showFullPlayer ? styles.open : ''}`}>
      <div className="flex w-full flex-row-reverse justify-between mb-4">
        <ChevronDown
          className="h-12 w-12 cursor-pointer"
          onClick={handleHideFullPlayer}
        />
        <div className="">
          {currentTrack.album?.name}
        </div>
        <div className="w-12"></div>
      </div>
      <div className="flex w-full justify-center mb-4">
        <img
          src={getHighestImage(currentTrack.album?.images)}
          alt={currentTrack.album?.name}
          className="h-72 rounded-md"
        />
      </div>
      <div
        ref={trackRef}
        className="flex flex-col w-full whitespace-nowrap overflow-x-hidden mb-4"
      >
        <div className={`flex w-full text-4xl mb-2 relative ${isOverFlow ? 'animate-marquee' : ''}`}>
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
        </div>
        <div className="flex w-full relative text-lg">
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
                />
                {idx !== currentTrack.artists.length - 1 && ', '}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center mb-4">
        <input
          type="range"
          id="progressbar"
          className="h-2 w-full mb-1"
          max={duration}
          value={positionMs}
          onChange={(e) => setPositionMs(Number(e.target.value))}
          onPointerUp={(e: React.MouseEvent<HTMLInputElement>) =>
            handleSeek(Number(e.currentTarget.value))
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
      <div className="flex justify-around items-center mb-2">
        <Shuffle
          className="h-8 w-8 cursor-pointer"
          color={getButtonColor(shuffle)}
          onClick={() => handleShuffle()}
        />
        <div className="flex justify-center items-center">
          <SkipBack
            className="h-8 w-8 mx-4 cursor-pointer"
            onClick={() => handlePrev()}
          />
          <PlayPauseIcon
            className="h-20 w-20 mx-4 cursor-pointer"
            onClick={() => handlePlay()}
          />
          <SkipForward
            className="h-8 w-8 mx-4 cursor-pointer"
            onClick={() => handleNext()}
          />
        </div>
        <div className="relative">
          <Repeat
            className="h-8 w-8 cursor-pointer"
            color={getButtonColor(repeatMode !== 0)}
            onClick={() => handleRepeatMode()}
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
      <div className="flex w-full justify-between items-center">
        <div className="w-8">
          {currentTrack.type === 'track' && (
            <Mic
              className="cursor-pointer"
              onClick={handleOpenLyric}
            />
          )}
        </div>
        <div className="w-8">
          <Airplay
            className="cursor-pointer"
            // onClick={}
          />
        </div>
      </div>
    </div>
  );
};

export default FullPlayer;

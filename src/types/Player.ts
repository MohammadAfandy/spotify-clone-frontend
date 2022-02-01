import PlaybackState from './PlaybackState';

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

export default Player;

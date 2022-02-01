
import Track from './Track';

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

export default PlaybackState;

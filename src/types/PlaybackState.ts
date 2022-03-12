
import Episode from './Episode';
import Track from './Track';

type PlaybackState = {
  track_window: {
    current_track: Track & Episode;
    next_tracks: Track[] & Episode[];
    previous_tracks: Track[] & Episode[];
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

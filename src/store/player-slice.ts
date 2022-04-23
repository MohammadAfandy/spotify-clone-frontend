import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';
import Episode from '../types/Episode';

import Track from '../types/Track';
import ApiSpotify from '../utils/api-spotify';

export type PlayerState = {
  offset: number;
  positionMs: number;
  tracks: Track[];
  uris: string[];
  currentTrack: Track & Episode;
  isPlaying: boolean;
  isSaved: boolean;
  forceUpdate: number;
};

export type TogglePlayParams = {
  uris: string[];
  offset?: number;
  positionMs?: number;
};

const initialState: PlayerState = {
  offset: 0,
  positionMs: 0,
  tracks: [],
  uris: [],
  currentTrack: {} as Track & Episode,
  isPlaying: false,
  isSaved: false,
  forceUpdate: 0,
};

export const togglePlay = createAsyncThunk(
  'player/togglePlay',
  async (params: TogglePlayParams, { rejectWithValue }) => {
    try {
      const { uris = [], offset = 0, positionMs = 0 } = params;
      let newUris = [];
      let newContextUri = '';
      let noOffset = false;
      const availableUris = [
        'album',
        'artist',
        'playlist',
        'show',
        'track',
        'episode',
        'user',
      ];
      for (const uri of uris) {
        const [, type] = uri.split(':');
        if (availableUris.includes(type) === false) {
          throw new Error('Invalid Uri : ' + uri);
        }
        if (type === 'track' || type === 'episode') {
          newUris.push(uri);
        } else {
          if (newUris.length) {
            throw new Error('Cannot mix track / episode with another type');
          }
          if (newContextUri) {
            throw new Error('Can only contain 1 uri if not track / episode');
          }
          if (type === 'artist') {
            noOffset = true;
          }
          newContextUri = uri;
        }
      }
      const body = {
        uris: newUris.length ? newUris : undefined,
        context_uri: newContextUri || undefined,
        offset: noOffset
          ? undefined
          : {
              position: offset,
            },
        position_ms: positionMs,
      };

      const response = await ApiSpotify.put('/me/player/play', body);
      if (response.status !== 204) {
        throw new Error('Failed to play track');
      }
      return params;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const toggleResume = createAsyncThunk(
  'player/toggleResume',
  async (_, { rejectWithValue }) => {
    try {
      await ApiSpotify.put('/me/player/play');
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const togglePause = createAsyncThunk(
  'player/togglePause',
  async (_, { rejectWithValue }) => {
    try {
      await ApiSpotify.put('/me/player/pause');
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    changeOffset: (state, action: PayloadAction<number>) => {
      state.offset = action.payload;
    },
    changePositionMs: (state, action: PayloadAction<number>) => {
      state.positionMs = action.payload;
    },
    changeTracks: (state, action: PayloadAction<Track[]>) => {
      state.tracks = action.payload;
    },
    changeUris: (state, action: PayloadAction<string[]>) => {
      state.uris = action.payload;
    },
    changeCurrentTrack: (state, action: PayloadAction<Track & Episode>) => {
      state.currentTrack = action.payload;
    },
    changeIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    changeIsSaved: (state, action: PayloadAction<boolean>) => {
      state.isSaved = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(togglePlay.fulfilled, (state, action) => {
      const { uris = [], offset = 0, positionMs = 0 } = action.payload;
      state.uris = uris;
      state.positionMs = positionMs;
      state.offset = offset;
      state.isPlaying = true;
      state.forceUpdate += 1;
    });
    builder.addCase(togglePlay.rejected, (state, action) => {
      state.isPlaying = false;
    });
    builder.addCase(toggleResume.fulfilled, (state, action) => {
      state.isPlaying = true;
    });
    builder.addCase(togglePause.fulfilled, (state, action) => {
      state.isPlaying = false;
    });
  }
});

export const {
  changeOffset,
  changePositionMs,
  changeTracks,
  changeUris,
  changeCurrentTrack,
  changeIsPlaying,
  changeIsSaved,
} = playerSlice.actions;

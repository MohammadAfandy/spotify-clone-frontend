import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import Playlist from '../types/Playlist';
import ApiSpotify from '../utils/api-spotify';

export type PlaylistState = {
  items: Playlist[],
  savedTrackIds: string[],
};

const initialState: PlaylistState = {
  items: [],
  savedTrackIds: [],
};

export const getUserPlaylist = createAsyncThunk(
  'playlist/getUserPlaylist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiSpotify.get('/me/playlists', {
        params: { limit: 50 },
      });
      return response.data.items;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setSavedTrackIds: (state, action: PayloadAction<string[]>) => {
      state.savedTrackIds = action.payload;
    },
    addSavedTrackIds: (state, action: PayloadAction<string[]>) => {
      state.savedTrackIds = [
        ...state.savedTrackIds,
        ...action.payload,
      ];
    },
    removeSavedTrackIds: (state, action: PayloadAction<string[]>) => {
      state.savedTrackIds = state.savedTrackIds.filter((v) => action.payload.includes(v) === false);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserPlaylist.fulfilled, (state, action) => {
      state.items = action.payload;
    });
    builder.addCase(getUserPlaylist.rejected, (state, action) => {
      console.error('getUserPlaylist rejected', action.payload);
    });
  }
});

export const {
  setSavedTrackIds,
  addSavedTrackIds,
  removeSavedTrackIds,
} = playlistSlice.actions;

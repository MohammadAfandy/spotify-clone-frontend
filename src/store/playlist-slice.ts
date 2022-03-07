import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import Playlist from '../types/Playlist';
import ApiSpotify from '../utils/api-spotify';

export type PlaylistState = {
  items: Playlist[],
};

const initialState: PlaylistState = {
  items: [],
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

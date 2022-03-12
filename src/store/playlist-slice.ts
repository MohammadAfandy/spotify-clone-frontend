import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import { toast } from 'react-toastify';

import Playlist from '../types/Playlist';
import ApiSpotify from '../utils/api-spotify';
import { ucwords } from '../utils/helpers';

export type PlaylistState = {
  items: Playlist[],
  savedTrackIds: string[],
};

export type SavedTrackParams = {
  type: string;
  trackId: string;
};

export type PlaylistTrackParams = {
  playlistId: string;
  trackUri: string;
  position?: number;
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

export const addTrackToPlaylist = createAsyncThunk(
  'playlist/addTrackToPlaylist',
  async (data: PlaylistTrackParams, { rejectWithValue }) => {
    const { playlistId, trackUri, position } = data;
    const params = {
      uris: trackUri,
      position,
    };

    try {
      await ApiSpotify.post('/playlists/' + playlistId + '/tracks', {}, {
        params,
      });
      toast.info(`Added to Playlist`);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const removeTrackFromPlaylist = createAsyncThunk(
  'playlist/removeTrackFromPlaylist',
  async (data: PlaylistTrackParams, { rejectWithValue }) => {
    const { playlistId, trackUri, position } = data;
    const body = {
      tracks: [
        {
          uri: trackUri,
          positions: position !== undefined ? [position] : undefined,
        },
      ],
    };

    try {
      await ApiSpotify.delete('/playlists/' + playlistId + '/tracks', {
        data: body,
      });
      toast.info(`Removed from Playlist`);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const addToSavedTrack = createAsyncThunk(
  'playlist/addToSavedTrack',
  async (data: SavedTrackParams, { rejectWithValue }) => {
    const { type, trackId} = data;
    if (['track', 'episode'].includes(type) === false) {
      throw new Error('Invalid type');
    }
    const params = {
      ids: trackId,
    };

    try {
      await ApiSpotify.put(`/me/${type}s`, {}, { params });
      toast.info(`Added to Your Liked ${ucwords(type)}s`);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const removeFromSavedTrack = createAsyncThunk(
  'playlist/removeFromSavedTrack',
  async (data: SavedTrackParams, { rejectWithValue }) => {
    const { type, trackId} = data;
    if (['track', 'episode'].includes(type) === false) {
      throw new Error('Invalid type');
    }
    toast.info(`Removed from Your Liked ${ucwords(type)}s`);
    const params = {
      ids: trackId,
    };

    try {
      await ApiSpotify.delete(`/me/${type}s`, { params });
      return data;
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
      state.savedTrackIds = Array.from(new Set([
        ...state.savedTrackIds,
        ...action.payload,
      ]));
    },
    removeSavedTrackIds: (state, action: PayloadAction<string[]>) => {
      state.savedTrackIds = state.savedTrackIds.filter((v) => action.payload.includes(v) === false);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserPlaylist.fulfilled, (state, action) => {
      state.items = action.payload;
    });
    builder.addCase(addToSavedTrack.fulfilled, (state, action) => {
      state.savedTrackIds = Array.from(new Set([
        ...state.savedTrackIds,
        action.payload.trackId,
      ]));
    });
    builder.addCase(removeFromSavedTrack.fulfilled, (state, action) => {
      state.savedTrackIds = state.savedTrackIds.filter((v) => v !== action.payload.trackId);
    });
  }
});

export const {
  setSavedTrackIds,
  addSavedTrackIds,
  removeSavedTrackIds,
} = playlistSlice.actions;

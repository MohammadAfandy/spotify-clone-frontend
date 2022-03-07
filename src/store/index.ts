import { configureStore } from '@reduxjs/toolkit';
import { playerSlice } from './player-slice';
import { playlistSlice } from './playlist-slice';

export const store = configureStore({
  reducer: {
    player: playerSlice.reducer,
    playlist: playlistSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { playerSlice } from './player-slice';
import { playlistSlice } from './playlist-slice';

export const store = configureStore({
  reducer: {
    player: playerSlice.reducer,
    playlist: playlistSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

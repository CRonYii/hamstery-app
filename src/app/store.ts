import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import GlobalReducer from '../features/GlobalSlice';
import LibraryReducer from '../features/Library/LibrarySlice';

export const store = configureStore({
  reducer: {
    global: GlobalReducer,
    libs: LibraryReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

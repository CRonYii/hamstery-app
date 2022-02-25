import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import { RootState } from '../app/store';
import { ITVShowsLibrary } from './Library/LibrarySlice';

export interface GlobalState {
  appSecret: string,
  loading: boolean,
  authorized: boolean,
  addShowModal: {
    visible: boolean,
    library?: ITVShowsLibrary
  }
}

const initialState: GlobalState = {
  appSecret: '',
  loading: false,
  authorized: false,
  addShowModal: {
    visible: false,
  }
};

const hamsteryTestAppSecret = async (appSecret: string) => {
  try {
    const { data } = await axios.post('/api/v1/', {}, { headers: { Authorization: appSecret } });
    Cookies.set('appSecret', appSecret);
    return data.result;
  } catch (e) {
    Cookies.set('appSecret', '');
    return 'Unauthorized'
  }
};

export const testAuth = createAsyncThunk(
  'global/testSecret',
  async (appSecret: string) => {
    const result = await hamsteryTestAppSecret(appSecret);
    // The value we return becomes the `fulfilled` action payload
    return { appSecret, result };
  }
);

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setAddShowModal(state, action: PayloadAction<{
      visible: boolean,
      library?: ITVShowsLibrary
    }>) {
      state.addShowModal = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(testAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(testAuth.fulfilled, (state, action) => {
        if (action.payload.result === 'success') {
          state.appSecret = action.payload.appSecret;
          state.authorized = true;
        } else {
          state.appSecret = '';
          state.authorized = false;
        }
        state.loading = false;
      });
  },
});

export const selectStatus = (state: RootState) => state.global;
export const selectAddShowModal = (state: RootState) => state.global.addShowModal;

export const { setAddShowModal } = globalSlice.actions;

export default globalSlice.reducer;

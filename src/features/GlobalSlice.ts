import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import { RootState } from '../app/store';

export interface GlobalState {
  appSecret: string,
  authorized: boolean,
  loading: boolean,
}

const initialState: GlobalState = {
  appSecret: '',
  loading: false,
  authorized: false,
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
  reducers: {},
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

export default globalSlice.reducer;

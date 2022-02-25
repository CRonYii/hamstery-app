import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { hamsteryGetAllLibs } from '../HamsteryAPI';
export enum SourceType {
  TMDB = "TMDB"
};

/* Typescript types definition */
export interface ISeason {
  seasonNumber: number,
  episodes: string[]
};

export interface IMetaSource {
  type: SourceType,
  id: string
};

export interface ITVShow {
  localPath: string,
  name: string,
  yearReleased: number,
  metaSource: IMetaSource,
  poster?: string,
  seasons: ISeason[]
};

export interface IStorage {
  directory: string,
};

export interface ITVShowsLibrary {
  name: string,
  storage: IStorage[],
  shows: ITVShow[],
};

export interface TVShowLibraryState {
  tvShowLibs: ITVShowsLibrary[]
}

const initialState: TVShowLibraryState = {
  tvShowLibs: []
};

export const getAllLibs = createAsyncThunk(
  'library/getAllLibs',
  async (appSecret: string) => {
    const data = await hamsteryGetAllLibs(appSecret);
    // The value we return becomes the `fulfilled` action payload
    return data;
  }
);

export const tvShowLibrarySlice = createSlice({
  name: 'Library',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllLibs.fulfilled, (state, action) => {
        state.tvShowLibs = action.payload;
      });
  }
});

export const selectAllLibraries = (state: RootState) => state.libs;
export const selectTVShowsLibrary = (lib_name: string) => (state: RootState) => {
  return state.libs.tvShowLibs.find(l => l.name === lib_name);
};
export const selectTVShow = (lib_name: string, tv_show: string) => (state: RootState) => {
  return state.libs.tvShowLibs.find(l => l.name === lib_name)
  ?.shows.find(s => s.name === tv_show);
};
export const selectTVShowSeason = (lib_name: string, tv_show: string, season_number: number) => (state: RootState) => {
  return state.libs.tvShowLibs.find(l => l.name === lib_name)
    ?.shows.find(s => s.name === tv_show)
    ?.seasons.find(s => s.seasonNumber === season_number);
};

export default tvShowLibrarySlice.reducer;

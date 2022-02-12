import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { hamsteryGetAllLibs } from '../HamsteryAPI'

export enum LibraryType {
  Show,
  Movie
};


export type Library = {
  name: string,
  type: LibraryType,
  storage: StorageMap,
};

interface StorageMap { [key: string]: LibraryStorage; };

export type LibraryStorage = {
  directory: string,
  shows: ShowMap
};

interface ShowMap { [key: string]: Show; };

export type Show = {
  name: string,
  storage: string,
  poster?: string,
  localPath: string,
  metaSource: MetaSource,
  seasons: SeasonMap
};

export enum SourceType {
  TMDB
};

export type MetaSource = {
  type: SourceType,
  id: string
};

interface SeasonMap { [key: string]: Season; };

export type Season = {
  seasonNumber: number,
  episodes: Array<null | string>
};

interface LibraryMap { [key: string]: Library; };

export interface TVShowLibraryState {
  tvShowLibs: LibraryMap
}

const initialState: TVShowLibraryState = {
  tvShowLibs: {}
};

export const getAllLibs = createAsyncThunk(
  'global/getAllLibs',
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
        const map: any = {};
        action.payload
          .filter((l: any) => l.type === LibraryType.Show)
          .forEach((l: any) => {
            map[l.name] = l;
          });
          state.tvShowLibs = map;
      });
  }
});

export const selectLibrary = (state: RootState) => state.libs;

export default tvShowLibrarySlice.reducer;

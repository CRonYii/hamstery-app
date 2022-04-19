import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { hamsteryGetAllLibs, hamsteryGetLibByName, hamsteryGetShow } from '../HamsteryAPI';

export enum EpisodeStatus {
  DOWNLOAED = 'downloaded',
  DOWNLOADING = 'downloading',
  MISSING = 'missing',
};

export enum SourceType {
  TMDB = "TMDB"
};

/* Typescript types definition */
interface IEpisode {
  status: EpisodeStatus
  episodeNumber: number,
  path: string,
  totalLength?: number
  completedLength?: number
  downloadSpeed?: number
}

export interface ISeason {
  seasonNumber: number,
  episodes: IEpisode[]
};

export interface IMetaSource {
  type: SourceType,
  id: string
};

export interface ITVShow {
  _id: string,
  localPath: string,
  name: string,
  firstAirDate: string,
  yearReleased: number,
  metaSource: IMetaSource,
  poster?: string,
  seasons: ISeason[]
};

export interface IStorage {
  _id: string,
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

export const getLibByName = createAsyncThunk(
  'library/getLibByName',
  async (params: { appSecret: string, name: string }) => {
    const data = await hamsteryGetLibByName(params.appSecret, params.name);
    // The value we return becomes the `fulfilled` action payload
    return { name: params.name, lib: data };
  }
);

export const addShowToLib = createAsyncThunk(
  'library/addShowToLib',
  async (params: { appSecret: string, lib: string, show_id: string }) => {
    const { appSecret, lib, show_id } = params;
    const data = await hamsteryGetShow(appSecret, lib, show_id);
    // The value we return becomes the `fulfilled` action payload
    return { lib, show: data };
  }
);

export const tvShowLibrarySlice = createSlice({
  name: 'Library',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    removeLib(state, action: PayloadAction<string>) {
      state.tvShowLibs.splice(state.tvShowLibs.findIndex(l => l.name === action.payload), 1);
    },
    setEpisode(state, action: PayloadAction<{ episode: IEpisode, lib_name: string, tv_show: string, season_number: number, ep_number: number }>) {
      const { episode, lib_name, tv_show, season_number, ep_number } = action.payload;
      const season = state.tvShowLibs.find(l => l.name === lib_name)
        ?.shows.find(s => s.name === tv_show)
        ?.seasons.find(s => s.seasonNumber === season_number);
      if (!season?.episodes || season.episodes.length < ep_number)
        return;
      season.episodes[ep_number - 1] = { ...episode };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllLibs.fulfilled, (state, action) => {
        state.tvShowLibs = action.payload;
      })
      .addCase(getLibByName.fulfilled, (state, action) => {
        const i = state.tvShowLibs.findIndex((l) => l.name === action.payload.name);
        if (i !== -1) {
          state.tvShowLibs[i] = action.payload.lib;
        } else {
          state.tvShowLibs.push(action.payload.lib);
        }
      })
      .addCase(addShowToLib.fulfilled, (state, action) => {
        state.tvShowLibs.find((l) => l.name === action.payload.lib)
          ?.shows.push(action.payload.show);
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

export const { setEpisode, removeLib } = tvShowLibrarySlice.actions;

export default tvShowLibrarySlice.reducer;

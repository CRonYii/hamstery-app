import axios from "axios";
import { ITVShow } from "./Library/LibrarySlice";

export const hamsteryGetAllLibs = async (appSecret: string) => {
    const { data } = await axios.get('/api/v1/tvshows/', { headers: { Authorization: appSecret } });
    return data;
};

export const hamsteryRefreshLib = async (appSecret: string, lib: string) => {
    const { data } = await axios.put(`/api/v1/tvshows/${lib}`,
        {
            refresh: true
        },
        { headers: { Authorization: appSecret } });
    return data;
};

export const hamsteryAddShowToLib = async (appSecret: string, lib: string, storage_id: string, tmdb_id: number, language?: string): Promise<string> => {
    const { data } = await axios.post(`/api/v1/tvshows/${lib}/${storage_id}`, { tmdb_id, language }, { headers: { Authorization: appSecret } });
    return data.id;
};

export const hamsteryGetEpisode = async (appSecret: string, lib: string, show_id: string, season_number: number, episode_number: number) => {
    const { data } = await axios.get(`/api/v1/tvshows/${lib}/${show_id}/${season_number}/${episode_number}`, { headers: { Authorization: appSecret } });
    return data;
};

export const hamsteryAddEpisodeToShow = async (appSecret: string, filename: string, lib: string, show_id: string, season_number: number, episode_number: number): Promise<string> => {
    const { data } = await axios.put(`/api/v1/tvshows/${lib}/${show_id}/${season_number}/${episode_number}`, { filename }, { headers: { Authorization: appSecret } });
    return data;
};

export const hamsteryDownloadMagnetEpisodeToShow = async (appSecret: string, magnet_link: string, lib: string, show_id: string, season_number: number, episode_number: number): Promise<string> => {
    const { data } = await axios.put(`/api/v1/tvshows/${lib}/${show_id}/${season_number}/${episode_number}`, { magnet_link }, { headers: { Authorization: appSecret } });
    return data.id;
};

export const hamsteryGetShow = async (appSecret: string, lib: string, show_id: string): Promise<ITVShow> => {
    const { data } = await axios.get(`/api/v1/tvshows/${lib}/${show_id}`, { headers: { Authorization: appSecret } });
    return data;
};

export const hamsteryAddLib = async (appSecret: string, lib: { name: string, storage: string[] }) => {
    const { data } = await axios.post(`/api/v1/tvshows`, { ...lib }, { headers: { Authorization: appSecret } });
    return data;
};

export const hamsteryDeleteLib = async (appSecret: string, lib: string) => {
    const { data } = await axios.delete(`/api/v1/tvshows/${lib}`, { headers: { Authorization: appSecret } });
    return data;
};

export const hamsteryList = async (appSecret: string, directory = '') => {
    const { data } = await axios.get(`/api/v1/media/list/${directory}`, { headers: { Authorization: appSecret } });
    return data;
};

export const hamsterySearchResources = async (appSecret: string, source: 'dmhy', keyword: string, limit = 1) => {
    const { data } = await axios.get(`/api/v1/media/search/${source}/${keyword}?limit=${limit}`, { headers: { Authorization: appSecret } });
    return data;
};

export const hamsteryDownloadStatus = async (appSecret: string, taskid: string) => {
    const { data } = await axios.get(`/api/v1/download/${taskid}`, { headers: { Authorization: appSecret } });
    return data;
};

export const hamsteryDownloadCancel = async (appSecret: string, taskid: string) => {
    const { data } = await axios.delete(`/api/v1/download/${taskid}`, { headers: { Authorization: appSecret } });
    return data;
};
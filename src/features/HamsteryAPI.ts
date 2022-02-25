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

export const hamsteryGetShow = async (appSecret: string, lib: string, show_id: string): Promise<ITVShow> => {
    const { data } = await axios.get(`/api/v1/tvshows/${lib}/${show_id}`, { headers: { Authorization: appSecret } });
    return data;
};

export const hamsteryDeleteLib = async (appSecret: string, lib: string) => {
    const { data } = await axios.delete(`/api/v1/tvshows/${lib}`, { headers: { Authorization: appSecret } });
    return data;
};
import axios from "axios";

export const hamsteryGetAllLibs = async (appSecret: string) => {
    const { data } = await axios.get('/api/v1/tvshows/', { headers: { Authorization: appSecret } });
    return data;
};

export const hamsteryrefreshLib = async (appSecret: string, lib: string) => {
    const { data } = await axios.put(`/api/v1/tvshows/${lib}`,
        {
            refresh: true
        },
        { headers: { Authorization: appSecret } });
    return data;
};
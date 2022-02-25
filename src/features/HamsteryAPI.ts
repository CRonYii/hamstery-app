import axios from "axios";

export const hamsteryGetAllLibs = async (appSecret: string) => {
    const { data } = await axios.get('/api/v1/library/', { headers: { Authorization: appSecret } });
    return data;
};

export const hamsteryrefreshLib = async (appSecret: string, lib: string) => {
    const { data } = await axios.put(`/api/v1/library/${lib}`,
        {
            refresh: true
        },
        { headers: { Authorization: appSecret } });
    return data;
};
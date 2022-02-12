import axios from "axios";

export const hamsteryGetAllLibs = async (appSecret: string) => {
    const { data } = await axios.get('/api/v1/library/', { headers: { Authorization: appSecret } });
    return data;
};
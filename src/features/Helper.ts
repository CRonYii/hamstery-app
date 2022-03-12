export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function percentage(a: number, b: number) {
    if (b === 0)
        return 0;
    return (a / b * 100);
}

const videoRegex = new RegExp('(.mp4|.mkv|.flv|.avi|.rmvb|.m4p|.m4v)$');
export const isVideoFile = (f: string) => f.match(videoRegex) != null;
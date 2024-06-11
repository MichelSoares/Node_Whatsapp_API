export interface MessageAPI {
    mediacontenttype: string | null;
    smsmessagesid: string;
    nummedia: number;
    smssid: string;
    body: string;
    src: string;
    accountsid: string;
    dst: string;
    mediaurl: string | null;
    date: string;
    cost_cli: string | null;
    latitude: number | null;
    longitude: number | null;
    profilename: string | null;
    isforwarded: boolean;
    forwardingscore: number | null;
}
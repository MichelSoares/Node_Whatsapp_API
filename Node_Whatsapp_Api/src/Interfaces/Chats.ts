
    export interface Id {
        server: string;
        user: string;
        _serialized: string;
    }
    export interface Chat {
        id: Id;
        name: string;
        isGroup: boolean;
        isReadOnly: boolean;
        unreadCount: number;
        timestamp: number;
        archived: boolean;
        pinned: boolean;
        isMuted: boolean;
        muteExpiration: number;
    }

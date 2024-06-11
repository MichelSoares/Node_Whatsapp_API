export interface Id {
    server: string;
    user: string;
    _serialized: string;
}

export interface Owner {
    server: string;
    user: string;
    _serialized: string;
}

export interface UniqueShortNameMap {
}

export interface Id2 {
    server: string;
    user: string;
    _serialized: string;
}

export interface Participant {
    id: Id2;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

export interface GroupMetadata {
    id: Id;
    creation: number;
    owner: Owner;
    restrict: boolean;
    announce: boolean;
    noFrequentlyForwarded: boolean;
    ephemeralDuration: number;
    support: boolean;
    suspended: boolean;
    uniqueShortNameMap: UniqueShortNameMap;
    notAddedByContact: boolean;
    participants: Participant[];
    pendingParticipants: any[];
}

export interface Id3 {
    server: string;
    user: string;
    _serialized: string;
}

export interface MessageGrupo {
    groupMetadata: GroupMetadata;
    id: Id3;
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
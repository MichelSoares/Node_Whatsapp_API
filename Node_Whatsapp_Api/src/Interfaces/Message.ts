export interface Message {
    id: Id
    ack: number
    hasMedia: boolean
    body: string
    type: string
    timestamp: number
    from: string
    to: string
    deviceType: string
    isForwarded: boolean
    forwardingScore: number
    isStarred: boolean
    fromMe: boolean
    hasQuotedMsg: boolean
    vCards: any[]
    mentionedIds: any[]
    location: location
  }

  export interface location {
    latitude: string
    longitude: string
    description: string
  } 
  
  export interface Id {
    fromMe: boolean
    remote: Remote
    id: string
    _serialized: string
  }
  
  export interface Remote {
    server: string
    user: string
    _serialized: string
  }

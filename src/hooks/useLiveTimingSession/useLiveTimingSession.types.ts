export interface LiveTimingMeeting {
  Name: string;
  Location: string;
  Sessions: LiveTimingSession[];
}

export interface LiveTimingSession {
  Name: string;
  StartDate: string;
  EndDate: string;
  Type: string;
  Path: string;
  Key: number;
}

export interface LiveTimingIndex {
  Year: number;
  Meetings: LiveTimingMeeting[];
}

export interface LiveTimingSessionMatch {
  path: string;
  sessionKey: number;
}

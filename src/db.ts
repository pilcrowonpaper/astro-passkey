export const sessions = new Map<string, Session>();
export const users = new Map<string, User>();
export const challenges = new Map<string, Challenge>();
export const publicKeys = new Map<string, PublicKey>()

export interface Session {
  sessionId: string;
  userId: string;
}

export interface User {
  userId: string;
  username: string;
}

export interface Challenge {
  challengeId: string;
  value: string;
}

export interface PublicKey {
    keyId: string,
    value: string,
    userId: string
}
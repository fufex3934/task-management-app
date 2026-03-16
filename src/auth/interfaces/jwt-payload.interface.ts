export interface JWtPayload {
  sub: string; // user ID
  email: string;
  username: string;
  roles: string[];
}

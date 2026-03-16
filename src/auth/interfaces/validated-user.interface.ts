export interface ValidatedUser {
  id: string;
  email: string;
  username: string;
  roles: string[];
  profile?: any;
  Active?: boolean;
}

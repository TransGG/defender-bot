export interface connection {
  type: string;
  id: string;
  name: string;
  visibility: 0 | 1;
  friend_sync: boolean;
  show_activity: boolean;
  verified: boolean;
}

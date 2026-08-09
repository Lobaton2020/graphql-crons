export interface FCMToken {
  id: number;
  userId: number;
  token: string;
  platform: string;
  deviceId: string | null;
  createdAt: string;
  updatedAt: string;
}

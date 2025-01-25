export type UserData = {
  id: string;
  fullname?: string;
  email?: string;
  password?: string;
  pin?: string;
  role?: string;
  friends?: string[];
  createdAt?: string;
  type?: string;
  friendRequests?: {
    fromUserId: string;
    status: "pending" | "accepted" | "rejected";
  }[];
};

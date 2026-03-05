import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

interface ProfileResponse {
  userID: string;
  email: string;
}

export const profile = api(
  { method: "GET", path: "/user/profile", auth: true, expose: true },
  async (): Promise<ProfileResponse> => {
    const authData = getAuthData()!;

    return {
      userID: authData.userID,
      email: authData.email,
    };
  },
);

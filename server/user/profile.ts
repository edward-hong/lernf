import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { isAdmin } from "../auth/admin";

interface ProfileResponse {
  userID: string;
  email: string;
  isAdmin: boolean;
  subscription: {
    status: "active" | "trialing" | "none";
    plan: "individual" | "team" | "admin" | "free";
  };
}

export const profile = api(
  { method: "GET", path: "/user/profile", auth: true, expose: true },
  async (): Promise<ProfileResponse> => {
    const authData = getAuthData()!;
    const admin = isAdmin(authData.email);

    return {
      userID: authData.userID,
      email: authData.email,
      isAdmin: admin,
      subscription: admin
        ? { status: "active", plan: "admin" }
        : { status: "none", plan: "free" },
    };
  },
);

import { Gateway, Header, APIError } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { verifyToken } from "@clerk/backend";
import { secret } from "encore.dev/config";
import { AUTHORIZED_PARTIES } from "./config";
import { clerk } from "./clerk";

const ClerkSecretKey = secret("ClerkSecretKey");

export interface AuthData {
  userID: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthParams {
  authorization: Header<"Authorization">;
}

const handler = authHandler<AuthParams, AuthData>(
  async (params): Promise<AuthData> => {
    const token = params.authorization.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("missing auth token");
    }

    try {
      const jwt = await verifyToken(token, {
        secretKey: ClerkSecretKey(),
        authorizedParties: AUTHORIZED_PARTIES,
      });

      const user = await clerk.users.getUser(jwt.sub);

      return {
        userID: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
      };
    } catch {
      throw APIError.unauthenticated("invalid auth token");
    }
  },
);

export const gateway = new Gateway({
  authHandler: handler,
});

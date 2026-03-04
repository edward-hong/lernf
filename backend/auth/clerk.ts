import { createClerkClient } from "@clerk/backend";
import { secret } from "encore.dev/config";

const ClerkSecretKey = secret("ClerkSecretKey");

export const clerk = createClerkClient({
  secretKey: ClerkSecretKey(),
});

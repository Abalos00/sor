import { randomBytes } from "crypto";

export function generateTempPassword() {
  return randomBytes(9).toString("base64url");
}

import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "default-session-secret-for-eco-sync-nexus-development-only-replace-in-production";

export function signToken(payload: { email: string }): string {
  // Expires in 7 days
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
    
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { email: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");
      
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    
    return { email: payload.email };
  } catch (e) {
    return null;
  }
}

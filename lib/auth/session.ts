// Session management utilities

export interface Session {
  address: string;
  publicKey: string;
  authenticated: boolean;
}

/**
 * Extracts and validates session from request
 * For now, this is a simplified implementation that reads from headers
 * In production, this should use proper session management (JWT, cookies, etc.)
 */
export async function getSession(request: Request): Promise<Session | null> {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return null;
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.replace(/^Bearer\s+/i, '');
    
    if (!token) {
      return null;
    }

    // For development: decode a simple base64-encoded JSON token
    // In production, use proper JWT validation
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      
      if (!decoded.address || !decoded.publicKey) {
        return null;
      }

      // Basic validation
      if (typeof decoded.address !== 'string' || typeof decoded.publicKey !== 'string') {
        return null;
      }

      return {
        address: decoded.address,
        publicKey: decoded.publicKey,
        authenticated: true,
      };
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Creates a simple session token for development
 * In production, use proper JWT signing
 */
export function createSessionToken(address: string, publicKey: string): string {
  const payload = { address, publicKey };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

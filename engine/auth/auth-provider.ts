export interface AuthenticatedIdentity {
  providerUserId: string;
  email: string;
  displayName?: string;
  profileImage?: string;
  claims: Record<string, unknown>;
}

export interface IAuthProvider {
  readonly name: string;
  verifyAccessToken(token: string): Promise<AuthenticatedIdentity>;
  revokeSessions(providerUserId: string): Promise<void>;
}

// Clerk, Auth0, or a future identity service must implement this contract.
// Domain services should never import a vendor SDK directly.

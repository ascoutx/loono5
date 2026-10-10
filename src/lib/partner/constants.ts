/**
 * Partner (B2B) cabinet — local-only identity emulation.
 *
 * The cabinet lives on its own host (partner.loono.com) and is reached only
 * by authorised account holders. There is no backend yet, so "signed in"
 * means holding a small JSON cookie the route guard can read.
 *
 * Replace this module with the real partner identity service once the API
 * exists. Note the cabinet is *gated*, not merely unlinked: the guard must
 * survive the migration.
 */

/** Demo credentials accepted by the partner sign-in form. */
export const MOCK_PARTNER_ACCOUNT = "partner";
export const MOCK_PARTNER_PASSWORD = "loono2026";

export const PARTNER_SESSION_COOKIE = "loono_partner_session";

export interface PartnerSession {
  /** Sign-in account, e.g. "partner". */
  account: string;
  signedInAt: string;
}

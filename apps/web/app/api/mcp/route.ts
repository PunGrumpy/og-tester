import { Unkey } from "@unkey/api";
import type { AuthInfo, VerifyToken } from "@xmcp/adapter";
import { withAuth, xmcpHandler } from "@xmcp/adapter";

import { env } from "@/lib/env";

/**
 * The MCP tools proxy the same core fetchers that power /api/scan, so they
 * carry the same SSRF-worthy fetch surface. Gate them behind an Unkey key the
 * same way /api/og and friends are gated, so the server isn't an open fetch
 * proxy for anyone who finds the endpoint.
 */
const verifyToken: VerifyToken = async (
  _request,
  bearerToken
): Promise<AuthInfo | undefined> => {
  if (!bearerToken) {
    return;
  }

  const unkey = new Unkey({ rootKey: env.UNKEY_ROOT_KEY });
  const result = await unkey.keys.verifyKey({
    key: bearerToken,
    tags: ["og-tester"],
  });

  if (!result.data?.valid) {
    return;
  }

  return {
    clientId: result.data.keyId ?? bearerToken,
    scopes: result.data.permissions ?? [],
    token: bearerToken,
  };
};

const authedHandler = withAuth(xmcpHandler, {
  required: true,
  verifyToken,
});

export { authedHandler as GET, authedHandler as POST };

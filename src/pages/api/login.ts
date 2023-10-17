import { decodeBase64 } from "oslo/encoding";
import { generateRandomString, alphabet } from "oslo/random";
import { validateWebAuthnAssertionResponse } from "oslo/webauthn";
import { challenges, publicKeys, sessions } from "../../db";

import type { APIContext } from "astro";
import type { LoginAPIBody } from "../../api";
import type { WebAuthnAssertionResponse } from "oslo/webauthn";

export async function POST(context: APIContext): Promise<Response> {
  if (context.locals.session) {
    return new Response(null, {
      status: 400,
    });
  }
  const body: LoginAPIBody = await context.request.json();
  const response: WebAuthnAssertionResponse = {
    authenticatorData: decodeBase64(body.response.authenticator_data),
    clientDataJSON: decodeBase64(body.response.client_data_json),
    signature: decodeBase64(body.response.signature),
  };
  const challenge = challenges.get(body.challenge_id) ?? null;
  if (!challenge) {
    return new Response(null, {
      status: 400,
    });
  }
  challenges.delete(challenge.challengeId)
  const publicKeyId = body.public_key_id;
  const publicKey = publicKeys.get(publicKeyId) ?? null;
  if (!publicKey) {
    return new Response(null, {
      status: 400,
    });
  }
  try {
    await validateWebAuthnAssertionResponse({
      response,
      origin: "http://localhost:4321",
      challenge: decodeBase64(challenge.value),
      publicKey: decodeBase64(publicKey.value),
      algorithm: "ES256K",
    });
    const sessionId = generateRandomString(40, alphabet("0-9", "a-z"));
    sessions.set(sessionId, {
      userId: publicKey.userId,
      sessionId: sessionId,
    });
    context.cookies.set("session", sessionId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      secure: import.meta.env.PROD,
      path: "/",
    });
    return new Response(null, {
      status: 200,
    });
  } catch (e) {
    console.log(e);
    return new Response(null, {
      status: 500,
    });
  }
}

import { decodeBase64 } from "oslo/encoding";
import { generateRandomString, alphabet } from "oslo/random";
import { validateWebAuthnAttestationResponse } from "oslo/webauthn";
import { challenges, publicKeys, sessions, users } from "../../db";

import type { APIContext } from "astro";
import type { SignupAPIBody } from "../../api";
import type { WebAuthnAttestationResponse } from "oslo/webauthn";

export async function POST(context: APIContext): Promise<Response> {
  if (context.locals.session) {
    return new Response(null, {
      status: 400,
    });
  }
  const body: SignupAPIBody = await context.request.json();
  const response: WebAuthnAttestationResponse = {
    authenticatorData: decodeBase64(body.response.authenticator_data),
    clientDataJSON: decodeBase64(body.response.client_data_json),
  };
  const challenge = challenges.get(body.challenge_id) ?? null;
  if (!challenge) {
    return new Response(null, {
      status: 400,
    });
  }
  challenges.delete(challenge.challengeId);
  try {
    await validateWebAuthnAttestationResponse({
      response,
      origin: "http://localhost:4321",
      challenge: decodeBase64(challenge.value),
    });
    const userId = generateRandomString(15, alphabet("0-9", "a-z"));
    users.set(userId, {
      userId,
      username: body.username,
    });
    const encodedPublicKey = body.response.public_key;
    publicKeys.set(body.public_key_id, {
      keyId: body.public_key_id,
      value: encodedPublicKey,
      userId,
    });
    const sessionId = generateRandomString(40, alphabet("0-9", "a-z"));
    sessions.set(sessionId, {
      userId: userId,
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

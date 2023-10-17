import { encodeBase64 } from "oslo/encoding";
import { generateRandomString, alphabet } from "oslo/random";
import { challenges } from "../../db";

export async function POST(): Promise<Response> {
  const challengeId = generateRandomString(15, alphabet("0-9", "a-z"));
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  const encodedChallenge = encodeBase64(challenge);
  challenges.set(challengeId, {
    challengeId,
    value: encodedChallenge,
  });
  return new Response(
    JSON.stringify({
      id: challengeId,
      challenge: encodedChallenge,
    })
  );
}

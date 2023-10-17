import { encodeBase64, decodeBase64 } from "oslo/encoding";
import type {
  ChallengeAPIResponseBody,
  LoginAPIBody,
  SignupAPIBody,
} from "../api";

export async function signIn() {
  const challenge = await getChallenge();
  const publicKeyCredential = await navigator.credentials.get({
    publicKey: {
      challenge: challenge.value,
    },
  });
  if (!(publicKeyCredential instanceof PublicKeyCredential)) {
    throw new TypeError();
  }
  if (
    !(publicKeyCredential.response instanceof AuthenticatorAssertionResponse)
  ) {
    throw new TypeError();
  }
  const body: LoginAPIBody = {
    challenge_id: challenge.challengeId,
    public_key_id: publicKeyCredential.id,
    response: {
      client_data_json: encodeBase64(
        publicKeyCredential.response.clientDataJSON
      ),
      authenticator_data: encodeBase64(
        publicKeyCredential.response.authenticatorData
      ),
      signature: encodeBase64(publicKeyCredential.response.signature),
    },
  };
  const response = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (response.ok) {
    window.location.href = "/";
  } else {
    console.log("Failed to sign in");
  }
}

export async function signUp(username: string) {
  const challenge = await getChallenge();
  const publicKeyCredential = await navigator.credentials.create({
    // publicKey = Web Authentication API
    publicKey: {
      rp: { name: "Passkey Demo" },
      user: {
        id: crypto.getRandomValues(new Uint8Array(32)),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        {
          type: "public-key",
          // use ECDSA with the secp256k1 curve and the SHA-256 (aka. ES256K)
          // id from the IANA COSE Algorithms registry
          alg: -7,
        },
      ],
      challenge: challenge.value,
    },
  });
  if (!(publicKeyCredential instanceof PublicKeyCredential)) {
    throw new TypeError();
  }
  if (
    !(publicKeyCredential.response instanceof AuthenticatorAttestationResponse)
  ) {
    throw new TypeError();
  }
  const publicKey = publicKeyCredential.response.getPublicKey();
  if (!publicKey) {
    throw new TypeError();
  }
  const body: SignupAPIBody = {
    challenge_id: challenge.challengeId,
    username,
    public_key_id: publicKeyCredential.id,
    response: {
      public_key: encodeBase64(publicKey),
      client_data_json: encodeBase64(
        publicKeyCredential.response.clientDataJSON
      ),
      authenticator_data: encodeBase64(
        publicKeyCredential.response.getAuthenticatorData()
      ),
    },
  };
  const response = await fetch("/api/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (response.ok) {
    window.location.href = "/";
  } else {
    console.log("Failed to sign up");
  }
}

async function getChallenge(): Promise<Challenge> {
  const challengeResponse = await fetch("/api/challenge", {
    method: "POST",
  });
  const challengeResult: ChallengeAPIResponseBody =
    await challengeResponse.json();
  return {
    challengeId: challengeResult.id,
    value: decodeBase64(challengeResult.challenge),
  };
}

interface Challenge {
  challengeId: string;
  value: ArrayBufferLike;
}

export interface LoginAPIBody {
  challenge_id: string;
  public_key_id: string;
  response: {
    signature: string;
    client_data_json: string;
    authenticator_data: string;
  };
}

export interface SignupAPIBody {
  challenge_id: string;
  username: string;
  public_key_id: string;
  response: {
    public_key: string;
    client_data_json: string;
    authenticator_data: string;
  };
}

export interface ChallengeAPIResponseBody {
  id: string;
  challenge: string;
}

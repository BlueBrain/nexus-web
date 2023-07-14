import {
  ResponseValidator,
  SigninResponse,
  SignoutResponse,
  ResponseValidatorCtor,
  MetadataServiceCtor,
  OidcClientSettings,
} from 'oidc-client';

class MyResponseValidator implements ResponseValidator {
  async validateSigninResponse(
    state: any,
    response: any
  ): Promise<SigninResponse> {
    // we can do validation here
    // the response_type = 'token' but the response is containing an id_token
    // so the oidc-client is throwing an error
    // to avoid this error we can do validation here
    // or just do nothing and return the response
    console.log('validateSigninResponse state', state);
    console.log('validateSigninResponse response', response);
    return response;
  }

  async validateSignoutResponse(
    state: any,
    response: any
  ): Promise<SignoutResponse> {
    return this.validateSignoutResponse(state, response);
  }
}

export default MyResponseValidator;

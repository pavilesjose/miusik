const SpotifyWebApi = require('spotify-web-api-node');

class SpotifyAuthenticationService {
  constructor() {
    this.clientId = process.env.SPOTIFY_KEY;
    this.clientSecret = process.env.SPOTIFY_SECRET_KEY;
    this.spotifyApiInstance = new SpotifyWebApi({
      clientId: this.clientId,
      clientSecret: this.clientSecret
    });

    this.spotify_auth = {
      created: null,
      expire: null,
      key: null
    };

    this.token = this.createToken().then((tokenData) => {
      console.log('interval created');
      return setInterval(() => this.getToken(), (1000 * (tokenData.body['expires_in'] + 500)));
    }).catch(console.log('couldn\'t create interval'));

  }

  async createToken() {

    try {
      const credentials = await this.spotifyApiInstance.clientCredentialsGrant();
      console.log('The access token expires in ' + credentials.body['expires_in']);
      console.log('The access token is ' + credentials.body['access_token']);

      this.spotify_auth.created = Date.now();
      this.spotify_auth.expire = this.spotify_auth.created + (1000 * credentials.body['expires_in']);
      this.spotify_auth.key = credentials.body['access_token'];

      this.spotifyApiInstance.setAccessToken(credentials.body['access_token']);

      return credentials;
    }
    catch(err) {
      console.log('Something went wrong when retrieving an access token', err);
    }


    return {};
  }

  async getToken() {
    console.log('Current token creation time: ' + this.spotify_auth.created);
    console.log('Current token expiration time: ' + this.spotify_auth.expire);
    console.log('Current time: ' + Date.now());
    console.log('Current token key: ' + this.spotify_auth.key);
    console.log('Checking...');

    if (Date.now() > this.spotify_auth.expire || this.spotify_auth.expire === null) {
      console.log('==============Creating new token==============');
      await this.createToken().catch('Couldn\'t create token');
    }

  }
}

module.exports = new SpotifyAuthenticationService();
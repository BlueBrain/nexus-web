import * as Mustache from 'mustache';
import * as fs from 'fs';

const keycloakUrl = 'http://keycloak.test:8080';
const deltaBaseUrl = 'http://delta.test:8098/v1';

// /* these are used for administrating keycloak */
const keycloakAdmin = {
  username: 'admin',
  password: 'admin',
  realm: 'master',
};

const adminClient = {
  id: 'admin-cli',
  secret: '',
  realm: 'master',
};

type Realm = {
  name: string;
  baseUrl: string;
  openIdConfig: string;
  logo: string;
};

const internalRealm: Realm = {
  name: 'internal',
  baseUrl: `${keycloakUrl}`,
  openIdConfig: `${keycloakUrl}/realms/internal/.well-known/openid-configuration`,
  logo: 'http://nexus.example.com/logo.png',
};

const testRealm: Realm = {
  name: 'test1',
  baseUrl: `${keycloakUrl}`,
  openIdConfig: `${keycloakUrl}/realms/test1/.well-known/openid-configuration`,
  logo: 'http://nexus.example.com/logo.png',
};

const keycloak = (keycloakUrl: string) => {
  const importRealm = async (
    realm: Realm,
    clientCredentials: { id: any; secret: any },
    users: any
  ) => {
    const adminAccessToken = await userToken(keycloakAdmin, adminClient);

    const realmImportTemplate = fs
      .readFileSync('ci/config/keycloak-realm-users.mustache')
      .toString();

    const realmJson = Mustache.render(realmImportTemplate, {
      realm: realm.name,
      client: clientCredentials.id,
      client_secret: clientCredentials.secret,
      users,
    });

    await fetch(`${keycloakUrl}/admin/realms/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${adminAccessToken}`,
        Accept: 'application/json',
      },

      body: realmJson,
    }).then((response: { status: number; text: () => Promise<any> }) => {
      if (response.status !== 201) {
        response.text().then((responseText: any) => {
          throw Error(`Error creating realm\n\n${responseText}`);
        });
      }
    });
  };

  const realmEndpoint = (realmName: any) =>
    `${keycloakUrl}/realms/${realmName}/protocol/openid-connect/token`;

  const userToken = (
    user: { username: any; password: any; realm: any },
    client: { id: any; secret: any; realm?: string }
  ) => {
    const clientFields = {
      client_id: client.id,
      ...(client.secret !== '' && { client_secret: client.secret }),
    };

    const request = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username: user.username,
        password: user.password,
        grant_type: 'password',
        ...clientFields,
      }),
    };
    //@ts-ignore
    return fetch(realmEndpoint(user.realm), request)
      .then((response: Response) => response.json())
      .then((data: { access_token: string }) => {
        return data.access_token;
      });
  };

  return { importRealm };
};

function getDeltaRealm(realmName: string) {
  return fetch(`${deltaBaseUrl}/realms/${realmName}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function createDeltaRealm(realm: Realm) {
  return fetch(`${deltaBaseUrl}/realms/${realm.name}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: realm.name,
      openIdConfig: realm.openIdConfig,
      logo: `${realm.baseUrl}/logo.png`,
    }),
  });
}

type User = {
  username: string;
  password: string;
  realm: { name: string; baseUrl: string };
};

export const TestUsers: { [key: string]: User } = (() => {
  return {
    morty: {
      username: 'Morpheus',
      password: 'neo',
      realm: { name: 'test1', baseUrl: keycloakUrl },
    },
    morpheus: {
      username: 'morty',
      password: 'morty',
      realm: { name: 'test1', baseUrl: keycloakUrl },
    },
  };
})();

async function setup(users: { [key: string]: User }) {
  console.log('Setting up Delta with realms and users');

  try {
    const kc = keycloak(keycloakUrl);

    console.log('Creating internal realm for use by our Service account');
    await getDeltaRealm(internalRealm.name)
      .then(async (response: Response) => {
        if (response.status !== 200) {
          await kc.importRealm(
            internalRealm,
            { id: 'ServiceAccount', secret: '' },
            []
          );
          await createDeltaRealm(internalRealm).then((response: Response) => {
            if (response.status === 201) {
              console.log('internal realm successfully created');
            } else {
              response.text().then((json: any) => {
                throw Error(
                  `Error occurred creating realm in Delta\n\n${json}`
                );
              });
            }
          });
        } else {
          console.log('realm already exists');
        }
      })
      .catch((error: any) => {
        console.log('error realm', error);
      });
    console.log(`Checking if ${testRealm.name} already exists`);
    /* create test realm for use by our test users */
    await getDeltaRealm(testRealm.name).then(
      async (response: { status: number }) => {
        if (response.status !== 200) {
          console.log(
            'Realm does not exist. Creating test realm for use by our authenticated users...'
          );
          await kc.importRealm(
            testRealm,
            { id: 'fusion', secret: '' },
            Object.values(users)
          );
          await createDeltaRealm(testRealm).then(
            (response: { status: number; text: () => Promise<any> }) => {
              if (response.status === 201) {
                console.log(`Realm ${testRealm.name} successfully created`);
              } else {
                response.text().then((json: any) => {
                  throw Error(
                    `Error occured creating realm in Delta\n\n${json}`
                  );
                });
              }
            }
          );
        } else {
          console.log(`${testRealm.name} already exists`);
        }
      }
    );
  } catch (e) {
    console.log('Error occurred whilst setting up realms and users', e);
  }
  console.log('setup done');

  // TODO: Configure basic permissions and anonymous user
}
export default setup;

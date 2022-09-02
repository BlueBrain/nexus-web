const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');

const keycloakUrl = 'http://keycloak.test:8080';
const deltaBaseUrl = 'http://delta.test:8080/v1';

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

const realm = {
  name: 'Nexus Dev',
  openIdConfig: '{{realm}}/.well-known/openid-configuration',
  logo: 'http://nexus.example.com/logo.png',
};

const keycloak = keycloakUrl => {
  const importRealm = async (realmName, clientCredentials, users) => {
    const adminAccessToken = await userToken(keycloakAdmin, adminClient);

    const realmImportTemplate = fs
      .readFileSync('cypress/e2e/keycloak-realm-users.mustache')
      .toString();

    const realmJson = Mustache.render(realmImportTemplate, {
      realm: realmName,
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
    }).then(response => {
      if (response.status !== 201) {
        response.text().then(responseText => {
          throw Error(`Error creating realm\n\n${responseText}`);
        });
      }
    });
  };

  const realmEndpoint = realmName =>
    `${keycloakUrl}/realms/${realmName}/protocol/openid-connect/token`;

  const userToken = (user, client) => {
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
      .then(response => response.json())
      .then(data => {
        return data.access_token;
      });
  };

  return { importRealm };
};

function getDeltaRealm(realmName) {
  return fetch(`${deltaBaseUrl}/realms/${realmName}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function createDeltaRealm(realmName) {
  return fetch(`${deltaBaseUrl}/realms/${realmName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: realmName,
      openIdConfig: `${keycloakUrl}/realms/${realmName}/.well-known/openid-configuration`,
      logo: `${keycloakUrl}/logo.png`,
    }),
  });
}

// // function addPermissions(path, acls) {

// //     return fetch(`http://local:9090/v1/realms/${realmName}`, {
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //       method: 'put',
// //       body: {
// //         acl: [

// //         ]
// //       },
// //     });
// //   }

async function setup() {
  // TODO: move users into config
  const users = [
    {
      username: 'Morpheus',
      password: 'neo',
    },
    {
      username: 'morty',
      password: 'morty',
    },
  ];

  console.log('Setting up Delta with realms and users');

  try {
    const kc = keycloak(keycloakUrl);

    console.log('Creating internal realm for use by our Service account');
    await getDeltaRealm('internal').then(async response => {
      // console.log('what delta say', response.status);
      // response
      //   .json()
      //   .then(response => console.log('delta has this response', response));
      if (response.status !== 200) {
        await kc.importRealm(
          'internal',
          { id: 'ServiceAccount', secret: '' },
          []
        );
        await createDeltaRealm('internal').then(response => {
          if (response.status === 201) {
            console.log('internal realm successfully created');
          } else {
            response.text().then(json => {
              throw Error(`Error occured creating realm in Delta\n\n${json}`);
            });
          }
        });
      } else {
        console.log('internal realm already exists');
      }
    });
    console.log('so done with internal realm, now onto test1');
    /* create test realm for use by our test users */
    await getDeltaRealm('test1').then(async response => {
      if (response.status !== 200) {
        console.log('Creating test realm for use by our authenticated users');
        await kc.importRealm('test1', { id: 'fusion', secret: '' }, users);
        await createDeltaRealm('test1').then(response => {
          if (response.status === 201) {
            console.log('test1 realm successfully created');
          } else {
            response.text().then(json => {
              throw Error(`Error occured creating realm in Delta\n\n${json}`);
            });
          }
        });
      } else {
        console.log('test1 realm already exists');
      }
    });
  } catch (e) {
    console.log('Error occurred whilst setting up realms and users', e);
  }
  console.log('setup done');

  // TODO: Configure basic permissions and anonymous user
}
export default setup;

// setup();

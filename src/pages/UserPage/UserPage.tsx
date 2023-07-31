import * as React from 'react';
import { useSelector } from 'react-redux';
import { Button, Descriptions, List, Typography } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { useHistory } from 'react-router';
import { RootState } from 'shared/store/reducers';
import useNotification from 'shared/hooks/useNotification';

export type UserPageData = {
  user?: string;
  realm?: string;
  authenticated?: boolean;
  groups?: string[];
};

const UserPage: React.FunctionComponent<{}> = props => {
  const name = useSelector(
    ({ oidc }: RootState) =>
      oidc.user && oidc.user.profile && oidc.user.profile.name
  );

  const [userPageData, setUserPageData] = React.useState<UserPageData>({});
  const history = useHistory();

  const nexus = useNexusContext();
  const notification = useNotification();

  React.useEffect(() => {
    nexus.Identity.list()
      .then(({ identities }) =>
        setUserPageData(
          identities.reduce((memo: UserPageData, identity) => {
            if (identity['@type'] === 'Authenticated') {
              memo.authenticated = true;
              memo.realm = identity.realm;
            }
            if (identity['@type'] === 'User') {
              memo.user = identity.subject;
            }
            if (identity['@type'] === 'Group') {
              memo.groups = [...(memo.groups || []), identity.group as string];
            }
            return memo;
          }, {})
        )
      )
      .catch(error => {
        notification.error({
          message: 'Problem loading Identities',
          description: error.message,
        });
      });
  }, [name]);

  const UnauthenticatedMessage = () => (
    <div style={{ flexGrow: 1 }}>
      <h1>You're Anonymous</h1>
      <p>
        You can <Button onClick={() => history.push('login')}>log in</Button> to
        change that
      </p>
    </div>
  );

  return (
    <div className="user-view view-container">
      {userPageData.authenticated ? (
        <div style={{ flexGrow: 1 }}>
          <h1>User Details</h1>
          <Descriptions bordered>
            <Descriptions.Item label="User Name">{name}</Descriptions.Item>
            <Descriptions.Item label="Login Name">
              {userPageData.user}
            </Descriptions.Item>
            <Descriptions.Item label="Realm">
              {userPageData.realm}
            </Descriptions.Item>
            {!!userPageData.groups && !!userPageData.groups.length && (
              <Descriptions.Item label="Groups">
                <List
                  dataSource={userPageData.groups}
                  pagination={{
                    total: userPageData.groups.length,
                  }}
                  renderItem={group => (
                    <List.Item>
                      <Typography.Text mark>{group}</Typography.Text>
                    </List.Item>
                  )}
                ></List>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>
      ) : (
        <UnauthenticatedMessage />
      )}
    </div>
  );
};

export default UserPage;

import * as React from 'react';
import { connect } from 'react-redux';
import { Card, notification, Empty } from 'antd';
import { IdentityList } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ListItem from '../components/Animations/ListItem';
import { RootState } from '../store/reducers';

export interface UserProps {
  name?: string;
}

const UserView: React.FunctionComponent<UserProps> = props => {
  const { name } = props;
  const [{ identities }, setIdentities] = React.useState<IdentityList>({
    '@context': {},
    identities: [],
  });

  const nexus = useNexusContext();

  React.useEffect(() => {
    nexus.Identity.list()
      .then(() => {
        throw new Error('something bad');
      })
      .then(setIdentities)
      .catch(error => {
        // TODO: show error
        notification.error({
          message: 'Problem loading Identities',
          description: error.message,
        });
      });
  }, [name]);

  return (
    <div className="user-view view-container">
      <div style={{ flexGrow: 1 }}>
        <h1>{name}</h1>
        <h2>Identities</h2>
        <p>
          This is a list of the identities you are associated with on the
          platform.
        </p>
        <Card>
          <ul className="identities-list">
            {!!identities.length ? (
              identities
                .reverse()
                .map(({ '@id': id, '@type': type, realm, subject }) => (
                  <ListItem
                    key={id}
                    id={id}
                    label={
                      <div>
                        <em>{type}</em> {subject}
                      </div>
                    }
                    details={<span>{realm}</span>}
                    description={id}
                  />
                ))
            ) : (
              <Empty description={<span>No Identities Found</span>} />
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
};

const mapStateToProps = ({ oidc }: RootState) => ({
  name: oidc.user && oidc.user.profile && oidc.user.profile.name,
});

export default connect(mapStateToProps)(UserView);

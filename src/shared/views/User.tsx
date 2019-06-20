import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import { Identity } from '@bbp/nexus-sdk-legacy/lib/ACL/types';
import { Card } from 'antd';
import ListItem from '../components/Animations/ListItem';

export interface UserProps {
  name?: string;
  identities: Identity[];
}

const User: React.FunctionComponent<UserProps> = props => {
  const { name, identities } = props;
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
            {identities
              .reverse()
              .map(({ '@id': id, '@type': type, realm, subject }) => (
                <ListItem
                  id={id}
                  label={
                    <div>
                      <em>{type}</em> {subject}
                    </div>
                  }
                  details={<span>{realm}</span>}
                  description={id}
                />
              ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

const mapStateToProps = ({ auth, oidc }: RootState) => ({
  name: oidc.user && oidc.user.profile && oidc.user.profile.name,
  identities: (auth.identities && auth.identities.data) || [],
});

export default connect(mapStateToProps)(User);

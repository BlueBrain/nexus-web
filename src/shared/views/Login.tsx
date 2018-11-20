import * as React from 'react';
import { connect } from 'react-redux';
import LoginBox, { Realm } from '../components/Login';
import { AuthState } from '../store/reducers/auth';

export interface LoginViewProps {
  authorizationEndpoint: string;
  clientId: string;
  hostName: string;
}

const Login: React.SFC<LoginViewProps> = props => {
  const realms: Realm[] = [
    { name: 'BBP', authorizationEndpoint: props.authorizationEndpoint },
  ];
  return (
    <LoginBox
      realms={realms}
      clientId={props.clientId}
      hostName={props.hostName}
    />
  );
};

const mapStateToProps = ({ auth }: { auth: AuthState }) => ({
  authorizationEndpoint: auth.authorizationEndpoint || '',
  hostName: auth.redirectHostName || '',
  clientId: auth.clientId || '',
});

export default connect(mapStateToProps)(Login);

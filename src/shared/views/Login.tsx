import * as React from 'react';
import { connect } from 'react-redux';
import LoginBox, { Realm } from '../components/Login';
import { AuthState } from '../store/reducers/auth';
import { RootState } from '../store/reducers';
import { StaticRouterProps } from 'react-router';

export interface LoginViewProps {
  authorizationEndpoint: string;
  clientId: string;
  hostName: string;
  redirectUrl: string;
}

const Login: React.FunctionComponent<LoginViewProps> = props => {
  const realms: Realm[] = [
    { name: 'BBP', authorizationEndpoint: props.authorizationEndpoint },
  ];
  return (
    <LoginBox
      realms={realms}
      clientId={props.clientId}
      hostName={props.hostName}
      redirectUrl={props.redirectUrl}
    />
  );
};

const mapStateToProps = ({
  auth,
  router,
}: {
  auth: AuthState;
  router: StaticRouterProps;
}) => {
  const location = router.location as { state?: { previousUrl: string } };

  return {
    authorizationEndpoint: auth.authorizationEndpoint || '',
    redirectUrl:
      (location && location.state && location.state.previousUrl) ||
      auth.redirectHostName ||
      '',
    hostName: auth.redirectHostName || '',
    clientId: auth.clientId || '',
  };
};

export default connect(mapStateToProps)(Login);

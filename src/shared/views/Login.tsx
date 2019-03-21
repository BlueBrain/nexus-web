import * as React from 'react';
import { connect } from 'react-redux';
import LoginBox, { Realm } from '../components/Login';
import { AuthState } from '../store/reducers/auth';
import { StaticRouterProps, Redirect } from 'react-router';
import { push } from 'connected-react-router';

export interface LoginViewProps {
  authorizationEndpoint: string;
  realms: Realm[];
  clientId: string;
  hostName: string;
  redirectUrl: string;
  redirect(): void;
}

const Login: React.FunctionComponent<LoginViewProps> = props => {
  const { realms, redirect } = props;
  if (realms.length === 0 || !realms) {
    redirect();
    return null;
  }
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
    realms: (auth.realms && auth.realms.data && auth.realms.data.results) || [],
    redirectUrl:
      (location && location.state && location.state.previousUrl) ||
      auth.redirectHostName ||
      '',
    hostName: auth.redirectHostName || '',
    clientId: auth.clientId || '',
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  redirect: () => dispatch(push('/')),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);

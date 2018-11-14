import * as React from 'react';
import LoginBox, { Realm } from '../components/Login';

const realms: Realm[] = [{ name: 'BBP', authorizationEndpoint: '' }];

const Login: React.StatelessComponent = () => <LoginBox realms={realms} />;

export default Login;

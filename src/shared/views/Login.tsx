import * as React from 'react';
import LoginBox from '../components/Login';

const Login: React.StatelessComponent = () => (
  <LoginBox loginURL="https://bbp-nexus.epfl.ch/staging/v1/oauth2/authorize?redirect=http://localhost:8000/authSuccess" />
);

export default Login;

import React from 'react';
import styled from 'styled-jss';
import { logout, isAuthenticated, getTokenOwner } from '../auth';
import logo from '../../public/img/logo.png';

const HeaderBlock = styled('header')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '60px',
  boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.3)',
  backgroundColor: '#ffffff',
  padding: '0 1em',
  backgroundColor: '#2d2f38f0'
});
const LogoBlock = styled('div')({
  display: 'flex',
  alignItems: 'center'
});

const Logo = styled('a')({
  marginRight: '0.5em',
  borderRadius: '50%',
  backgroundColor: '#ffffff',
  padding: '0.5em'
});

const LogoImg = styled('img')({
  height: '2em',
  width: '2em'
});

const Caption = styled('h1')({
  fontSize: '1.5em',
  color: '#8de2ff',
  letterSpacing: '1px',
  fontWeight: 'lighter'
});

const textStyle = {
  color: '#ccc',
  margin: 0,
  fontWeight: 'lighter'
};

const P = styled('p')(textStyle);

const Span = styled('span')(textStyle);

const LogInOut = styled('a')({
  color: '#ffffff',
  fontWeight: 'lighter'
});

const Header = base =>
  <HeaderBlock>
    <LogoBlock className="logo-block">
      <Logo className="logo" href= { base + '/home/' }>
        <LogoImg src = { logo }/>
      </Logo>
      <Caption>Explorer</Caption>
    </LogoBlock>
    <div className="login-block">
      {
        isAuthenticated()?
        <P><Span>{ getTokenOwner() }</Span> (<LogInOut onClick = { logout }>logout</LogInOut>)</P>:
        <LogInOut href= { `${base}/v0/oauth2/authorize?redirect=${location.href}` }>login</LogInOut>
      }
    </div>
  </HeaderBlock>

export default Header;

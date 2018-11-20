token + realm name is stored in cookie
when server receives request, it extract the token from the cookie and fetches resources + render app (SSR)
we are using a cookie and not session so server is stateless.
we are using a cookie and not local-storage so server gets the token

## 1- No token and no realm

- don't display login link in header
- just call nexus without bearer tokens

## 2- No token and 1+ realms

- display login link in header
- call nexus without bearer token
- start using token once user is logged in

## 3- Token and 1+ realms

- restore session
- call nexus with bearer token

## Token but used realm is gone (edge case)

- delete token
- go to #2

## Token but no realm (edge case)

- delete token
- go to #1

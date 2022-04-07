# cf-jwt-verify

This package is an example application used to verify JWTs issued by Cloudflare against Cloudflare's publicly 
available JWKS endpoint.

## Prerequisites
- `yarn` - [https://classic.yarnpkg.com/lang/en/docs/install](https://classic.yarnpkg.com/lang/en/docs/install)
- `nvm` - [https://github.com/nvm-sh/nvm#installing-and-updating](https://github.com/nvm-sh/nvm#installing-and-updating)

## Usage
- `git clone https://github.com/ianmobbs/cf-jwt-verifier && cd cf-jwt-verifier`
- `nvm use`
- `yarn`
- `yarn verify`

## Expected output
```
=======================
Cloudflare JWT Verifier
=======================
Fetching latest certificates from Cloudflare...

[STARTING GOOD JWT VERIFICATION]
Verifying Good JWT...
{"key1":"val1"}
JWT successfully verified!
Verifying Good JWT...
{"key2":"val2"}
JWT successfully verified!
Verifying Good JWT...
{"key3":"val3"}
JWT successfully verified!


[STARTING BAD JWT VERIFICATION]
Verifying Bad JWT...
Bad JWT successfully rejected using Cloudflare JWKS
Verifying Bad JWT...
Bad JWT successfully rejected using Cloudflare JWKS
Verifying Bad JWT...
Bad JWT successfully rejected using Cloudflare JWKS
✨  Done in 0.72s.
```
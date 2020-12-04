import awsExports from "../aws-exports";

const isNonProd = Boolean(
  window.location.hostname === "localhost" ||
  window.location.hostname.indexOf('non-prod') > -1 ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === "[::1]" ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

// Assuming you have two redirect URIs, and the first is for localhost and second is for production
const [
  productionRedirectSignIn,
  localRedirectSignIn,
] = awsExports.oauth.redirectSignIn.split(",");

const [
  productionRedirectSignOut,
  localRedirectSignOut,
] = awsExports.oauth.redirectSignOut.split(",");

export const AWSConfig = {
  ...awsExports,
  oauth: {
    ...awsExports.oauth,
    domain: isNonProd ? 'amii-management-nonprod.auth.unthrottled.io' : 'amii-management.auth.unthrottled.io',
    redirectSignIn: isNonProd ? localRedirectSignIn : productionRedirectSignIn,
    redirectSignOut: isNonProd ? localRedirectSignOut : productionRedirectSignOut,
  },
  Storage: {
    AWSS3: {
      bucket: `amii-assets${isNonProd ? '-nonprod' : ''}`,
      region: 'us-east-1',
    },
    customPrefix: {
      public: ''
    }
  }
}

// "redirectSignIn": "https://amii-assets-nonprod.unthrottled.io/oauth/callback/,http://localhost:3000/oauth/callback/",
//   "redirectSignOut": "https://amii-assets-nonprod.unthottled.io/oauth/logout/,http://localhost:3000/oauth/logout/",

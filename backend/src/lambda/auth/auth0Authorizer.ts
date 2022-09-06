import { CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = process.env.JWKS_URL
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJdMj7lYza7rjrMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi16eWh6YzVuNC51cy5hdXRoMC5jb20wHhcNMjIwOTA1MTU1MDA1WhcN
MzYwNTE0MTU1MDA1WjAkMSIwIAYDVQQDExlkZXYtenloemM1bjQudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx+RQq9As7PiApWWF
sOpPjOSqNvfbI0m9YlKH5V9ycbfbPdqxGD0h2Bv1f6RBa9mRx1ltmkIc6GmTRfTw
czc9eDg8OYwXzO5k1JYctxbfOYMx0WO153ZLot6xwVPhzVV3X1fuO0ZknCMoC2u8
19ZBz7urkgAUNsNXPZ5rbhIrfeietEsjn7mNgn/4QDdtmoZac2yulOtCAbnm3aRa
K4I2D4/f7yOGBFBqPAHioN9R4zblBM9lNvB0lcClrcsmfmpMyLI1xILLs+fS0FXH
31/nJ/rLnVSKUp554jMCS8GDDJtPrtoAhEg2SYhLtt8ViEtxEBxcsvH37am+QBCZ
yoJCywIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRiQulPhUnY
NHW8JIGcepF7JtSUyjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AF9jmPK0UpxHjOxfYPWV3j5gqfAL03VY9vR3Qa6dlv34M7v6y8uLFdlnM84uyCOz
VabsvxHfATiphLSyDVgkG0q4akpBbfOUcbUK11eqr1+UHWZ+yoOP1O364fXDlxXM
6krtyCk/Ur4CNfB8t1a51CR2fzSE93nECbP48fVsNJtCA+mAmc0ABLUIV8uYj+QF
TwN56SbzybGuB0R1vI4pF64eXB1BHTq3lfdYMilARcWYu9cTXkR013Fl1jVTuM8a
NT/HGnKP5nBRBjtg1uQEhCCLhOx12WAae+9Elmjc0zNXAi5JvmOt+21sU1JBS6P2
9VknEKDlrw6Ht+CCVWL2OI4=
-----END CERTIFICATE-----`

export const handler = async (
  event
): Promise<CustomAuthorizerResult> => {
  logger.info(event)

  logger.info('Authorizing a user', event.authorizationToken)
  try {

    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt
  // logger.info(jwt)

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  // const cert = await getSigningCertificate(jwt.header.kid)
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  logger.info(token)
  logger.info(typeof(token))
  // logger.info(decode(token))
  return token
}

// async function getSigningCertificate(kid: string): Promise<string> {
//   try {
//     logger.info('jwksUrl', jwksUrl)

//     const { data: keys } = await Axios.get(jwksUrl)

//     logger.info('jwksUrl response', keys)

//     if (!keys || !keys.length) {
//       throw new Error('The JWKS endpoint did not contain any keys')
//     }

//     const signingKeys = keys
//       .filter(
//         (key) =>
//           key.use === 'sig' &&
//           key.kty === 'RSA' &&
//           key.kid &&
//           ((key.x5c && key.x5c.length) || (key.n && key.e))
//       )
//       .map((key) => {
//         return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) }
//       })

//     if (!signingKeys.length) {
//       throw new Error(
//         'The JWKS endpoint did not contain any signature verification keys'
//       )
//     }

//     const signingKey = signingKeys.find((key) => key.kid === kid)

//     if (!signingKey) {
//       throw new Error(`Unable to find a signing key that matches '${kid}'`)
//     }

//     return signingKey
//   } catch (err) {
//     logger.error(`Unable to get signing key for token: ${err.message}`)
//     throw new Error(`Unable to get signing key for token: ${err.message}`)
//   }
// }

// function certToPEM(cert) {
//   cert = cert.match(/.{1,64}/g).join('\n')
//   cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
//   return cert
// }

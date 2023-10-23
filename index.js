/**
 * Users and their corresponding passwords.
 * Add any number of users by extending this object.
 */
const USERS = {
  "user1": "password1",
  "user2": "password2",
  "super": "secret"
  // Add more users as needed.
}

/**
 * RegExp for basic auth credentials
 */
const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/

/**
 * RegExp for basic auth user/pass
 */
const USER_PASS_REGEXP = /^([^:]*):(.*)$/

/**
 * Object to represent user credentials.
 */
const Credentials = function(name, pass) {
  this.name = name
  this.pass = pass
}

/**
 * Parse basic auth to object.
 */
const parseAuthHeader = function(string) {
  if (typeof string !== 'string') {
    return undefined
  }

  // parse header
  const match = CREDENTIALS_REGEXP.exec(string)

  if (!match) {
    return undefined
  }

  // decode user pass
  const userPass = USER_PASS_REGEXP.exec(atob(match[1]))

  if (!userPass) {
    return undefined
  }

  // return credentials object
  return new Credentials(userPass[1], userPass[2])
}

const unauthorizedResponse = function(body) {
  return new Response(
    body, {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="User Visible Realm"'
      }
    }
  )
}

/**
 * Handle request
 */
async function handle(request) {
  const credentials = parseAuthHeader(request.headers.get("Authorization"))
  if (!credentials || !USERS[credentials.name] || USERS[credentials.name] !== credentials.pass) {
    return unauthorizedResponse("Unauthorized")
  } else {
    return fetch(request)
  }
}

addEventListener('fetch', event => {
  event.respondWith(handle(event.request))
})

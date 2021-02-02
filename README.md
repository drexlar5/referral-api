# referral-api

A sample referral api

**Author:** Michael Agboola

**Environments**

Node version - v12.18.3 (LTS)

YARN version - v1.22.10

**This application uses the following technologies:**

- nodeJs
- expressJs
- mongoose
- jest
- supertest

**Install all dependencies**

```
yarn install
```

**Start the application**

```
yarn start
```

**Test the application**

```
yarn test
```

## User Authentication -

### Create User with no reference

**Endpoint** `http://localhost:3001/api/v1/register` - method (POST)

- Creates a User

**Payload**

```json
{
  "email": "demo@gmail.com",
  "password": "1234"
}
```

**Response format**

```json
{
  "error": false,
  "message": "User created.",
  "data": {
    "referral_code": null,
    "referral_count": 0,
    "credit": 0,
    "referred_users": [],
    "_id": "60192f3f34df68249e873afa",
    "email": "demo@gmail.com",
    "password": "$2a$12$TBnGyz7JTJNU/krkwlUb/.s9Fm.nLX8R7CzJ4Mg9TCNW7PvtG0nIC",
    "__v": 0
  }
}
```

### Create User with referral code

**Endpoint** `http://localhost:3001/api/v1/register?code=gpcxZwlg` - method (POST)

- Creates a User

**Payload**

```json
{
  "email": "test@gmail.com",
  "password": "1234"
}
```

**Response format**

```json
{
  "error": false,
  "message": "User created.",
  "data": {
    "referral_code": null,
    "referral_count": 0,
    "credit": 10,
    "referred_users": [],
    "_id": "60192fdc34df68249e873afb",
    "email": "test@gmail.com",
    "password": "$2a$12$yvmm4WIzmufw/c7HlY8tOOaHblWSvwh7kl2Gy5EYD3A1J5YzOJzqy",
    "__v": 0
  }
}
```

### Authenticate User

**Endpoint** `http://localhost:3001/api/v1/login` - method (POST)

- Authenticates a User

**Payload**

```json
{
  "email": "demo@gmail.com",
  "password": "1234"
}
```

**Response format**

```json
{
  "error": false,
  "message": "User authenticated",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### application/json

## User Referal -

### Get Referal url

**Endpoint** `http://localhost:3001/api/v1/refer` - method (GET)

- Generates and returns a referral link

**Authorization: Bearer <jwt-token>**

**Response format**

```json
{
  "error": false,
  "message": "Referral code created.",
  "data": "http://localhost:3001/register?code=gpcxZwlg"
}
```

### application/json

### Get User details

**Endpoint** `http://localhost:3001/api/v1/user` - method (GET)

- Get a single user detail

**Authorization: Bearer <jwt-token>**

**Response format**

```json
{
  "error": false,
  "message": "User details found.",
  "data": {
    "referral_code": "gpcxZwlg",
    "referral_count": 1,
    "credit": 0,
    "referred_users": ["60192fdc34df68249e873afb"],
    "email": "demo@gmail.com"
  }
}
```

### application/json

### Get postman collection link [here](https://www.getpostman.com/collections/c81faf9f102af6a9af61)

## The Design Principles used are:

- Single Responsibility Principle
- Dependency Inversion Principle
- DRY Principle
- KISS Principle
- YAGNI Principle

### Single Responsibility Principle:

```
I utilized this principle since it makes my code simpler to actualize and forestalls unforeseen side-effects of future changes (when I roll out an improvement in one class or capacity it will be reflected on all the various classes or capacities that relies upon it).
```

### Dependency Inversion Principle:

```
I utilized this principle since I need my 'top-level' objects to be entirely stable and not delicate for change.
```

### DRY Principle:

```
I utilized this principle to make my code more composed and simpler to keep up. And furthermore spare my time at whatever point I need to change something later on.
```

### KISS Principle:

```
I utilized this principle to make it simpler for other software engineers to envision the different parts of the applications, intellectually planning the potential impacts of any change.
```

### YAGNI Principle:

```
I utilized this principle since it abstains from investing energy on features that may not be used and helps me avoid feature creep.
```

# EnterPrint Auth Flow Contract

This project currently uses a mock authentication layer in the frontend, but the UI is structured around the following request and response contract for a real backend integration.

## Overview

The auth experience in the app expects these main flows:

- Sign in
- Sign up
- Email verification
- Two-factor challenge
- Forgot password
- Reset password
- Session refresh and logout

## 1. Sign in

### Request

POST /auth/login

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

### Success response

```json
{
  "accessToken": "mock-access-123",
  "refreshToken": "mock-refresh-123",
  "user": {
    "id": "user_123",
    "name": "Ayo Johnson",
    "email": "user@example.com",
    "company": "Northstar Prints",
    "initials": "AJ",
    "role": "Customer",
    "emailVerified": true,
    "requires2FA": false
  }
}
```

### Expected error responses

```json
{
  "message": "Invalid credentials"
}
```

```json
{
  "status": "REQUIRES_EMAIL_VERIFICATION",
  "message": "Please verify your email before signing in."
}
```

```json
{
  "status": "REQUIRES_2FA",
  "message": "Two-factor verification is required to continue."
}
```

### Frontend behavior

- Successful login redirects the user to the requested destination or the dashboard.
- A verification-required response redirects to /auth/verify-email.
- A 2FA-required response redirects to /auth/2fa-challenge.

## 2. Sign up

### Request

POST /auth/signup

```json
{
  "name": "Ayo Johnson",
  "email": "ayo@northstarprints.com",
  "company": "Northstar Prints",
  "password": "Password123!"
}
```

### Success response

```json
{
  "message": "Account created successfully"
}
```

### Expected error responses

```json
{
  "message": "An account with this email already exists."
}
```

### Frontend behavior

- The current flow does not log the user in immediately.
- It expects the backend to trigger a verification-required state and redirect the user to /auth/verify-email.

## 3. Email verification

### Request

POST /auth/verify-email

```json
{
  "email": "user@example.com",
  "token": "verify-token-123"
}
```

### Success response

```json
{
  "message": "Email verified successfully"
}
```

## 4. Two-factor challenge

### Request

POST /auth/2fa/verify

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### Success response

```json
{
  "accessToken": "mock-access-123",
  "refreshToken": "mock-refresh-123",
  "user": {
    "id": "user_123",
    "name": "Ayo Johnson",
    "email": "user@example.com",
    "company": "Northstar Prints",
    "initials": "AJ",
    "role": "Customer",
    "emailVerified": true,
    "requires2FA": true
  }
}
```

## 5. Forgot password

### Request

POST /auth/forgot-password

```json
{
  "email": "user@example.com"
}
```

### Success response

```json
{
  "resetToken": "reset-user_123-123456789"
}
```

## 6. Reset password

### Request

POST /auth/reset-password

```json
{
  "token": "reset-user_123-123456789",
  "password": "NewPassword123!"
}
```

### Success response

```json
{
  "message": "Password updated successfully"
}
```

## 7. Refresh session

### Request

POST /auth/refresh

```json
{
  "refreshToken": "mock-refresh-123"
}
```

### Success response

```json
{
  "accessToken": "mock-access-456"
}
```

## Client-side storage expectations

Once authentication succeeds, the app expects these values to be stored in browser storage:

- enterprint-auth-user
- enterprint-auth-access-token
- enterprint-auth-refresh-token

These values are used to keep the user authenticated across page loads.

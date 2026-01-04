<<<<<<< HEAD
# Environment Variables Configuration

This document lists all environment variables used in the backend application.

## Required Environment Variables

### Application Configuration
- `APP_PORT` - Port number for the backend server (default: 3000)
- `APP_HOST` - Host address for the backend server (default: "0.0.0.0")
- `NODE_ENV` - Environment mode: `development`, `staging`, or `production`

### Frontend Configuration
- `FRONTEND_URL` - **REQUIRED** - Frontend application URL (e.g., `http://localhost:4200` or `https://pms.mindpec.com`)
  - Used for password reset links
  - Must be set, no default value

- `CORS_ORIGINS` - Comma-separated list of allowed CORS origins (default: `http://localhost:4200`)
  - Example: `http://localhost:4200,http://pms.mindpec.com,https://staging.pms.mindpec.com`
  - Each origin should be separated by a comma

### Database Configuration
- `DATABASE_URL` - MySQL database connection string
  - Format: `mysql://user:password@host:port/database_name`

### JWT Configuration
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRATION` - JWT token expiration time (default: `5m`)

### Refresh Token Configuration
- `REFRESH_TOKEN_NAME` - Name of the refresh token cookie (default: `c-mps-refresh`)
- `REFRESH_TOKEN_LENGTH` - Length of the refresh token (default: `64`)
- `REFRESH_TOKEN_EXPIRY_DAYS` - Number of days until refresh token expires (default: `7`)

### Cookie Configuration
- `APP_COOKIE_SECRET` - Secret key for signing cookies

### Email Configuration (SMTP)
- `SMTP_HOST` - SMTP server hostname (default: `smtp.zoho.com`)
- `SMTP_PORT` - SMTP server port (default: `465`)
- `SMTP_SECURE` - Use SSL/TLS (default: `true`, set to `false` for TLS on port 587)
- `REPORT_MAIL` - Email address for sending emails
- `REPORT_PASS` - Email password or app password

### AWS S3 Configuration
- `AWS_REGION` - AWS region (e.g., `ap-south-1`)
- `AWS_BUCKET_NAME` - S3 bucket name
- `AWS_ACCESS_KEY_ID` - AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key

### Password Configuration
- `PASSWORD_HASH_LENGTH` - Bcrypt salt rounds (default: `10`)

## Example .env File

```env
# Application Configuration
APP_PORT=3005
APP_HOST=0.0.0.0
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:4200
CORS_ORIGINS=http://localhost:4200,http://pms.mindpec.com

# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/database_name

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=5m

# Refresh Token Configuration
REFRESH_TOKEN_NAME=c-mps-refresh
REFRESH_TOKEN_LENGTH=64
REFRESH_TOKEN_EXPIRY_DAYS=7

# Cookie Configuration
APP_COOKIE_SECRET=your-cookie-secret-key

# Email Configuration (SMTP)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
REPORT_MAIL=your-email@example.com
REPORT_PASS=your-email-password

# AWS S3 Configuration
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Password Configuration
PASSWORD_HASH_LENGTH=10
```

## Changes Made

The following hardcoded URLs have been moved to environment variables:

1. **CORS Origins** (`middleware.config.ts`)
   - Previously: `['http://localhost:4200','http://pms.mindpec.com']`
   - Now: Uses `CORS_ORIGINS` environment variable

2. **Frontend URL** (`auth.service.ts`)
   - Previously: Had fallback to `"https://pms.mindpec.com"`
   - Now: **REQUIRED** - Must be set via `FRONTEND_URL` environment variable

3. **SMTP Host** (`sendgridService.ts`)
   - Previously: Hardcoded `'smtp.zoho.com'`
   - Now: Uses `SMTP_HOST` environment variable (defaults to `smtp.zoho.com`)

4. **Application Host** (`main.ts`)
   - Previously: Hardcoded `localhost` in log message
   - Now: Uses `APP_HOST` environment variable (defaults to `0.0.0.0`)

## Migration Notes

When deploying to a new environment, ensure all environment variables are set, especially:
- `FRONTEND_URL` - Must be set for password reset functionality
- `CORS_ORIGINS` - Must include all frontend URLs that will access the API

=======
# Environment Variables Configuration

This document lists all environment variables used in the backend application.

## Required Environment Variables

### Application Configuration
- `APP_PORT` - Port number for the backend server (default: 3000)
- `APP_HOST` - Host address for the backend server (default: "0.0.0.0")
- `NODE_ENV` - Environment mode: `development`, `staging`, or `production`

### Frontend Configuration
- `FRONTEND_URL` - **REQUIRED** - Frontend application URL (e.g., `http://localhost:4200` or `https://pms.mindpec.com`)
  - Used for password reset links
  - Must be set, no default value

- `CORS_ORIGINS` - Comma-separated list of allowed CORS origins (default: `http://localhost:4200`)
  - Example: `http://localhost:4200,http://pms.mindpec.com,https://staging.pms.mindpec.com`
  - Each origin should be separated by a comma

### Database Configuration
- `DATABASE_URL` - MySQL database connection string
  - Format: `mysql://user:password@host:port/database_name`

### JWT Configuration
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRATION` - JWT token expiration time (default: `5m`)

### Refresh Token Configuration
- `REFRESH_TOKEN_NAME` - Name of the refresh token cookie (default: `c-mps-refresh`)
- `REFRESH_TOKEN_LENGTH` - Length of the refresh token (default: `64`)
- `REFRESH_TOKEN_EXPIRY_DAYS` - Number of days until refresh token expires (default: `7`)

### Cookie Configuration
- `APP_COOKIE_SECRET` - Secret key for signing cookies

### Email Configuration (SMTP)
- `SMTP_HOST` - SMTP server hostname (default: `smtp.zoho.com`)
- `SMTP_PORT` - SMTP server port (default: `465`)
- `SMTP_SECURE` - Use SSL/TLS (default: `true`, set to `false` for TLS on port 587)
- `REPORT_MAIL` - Email address for sending emails
- `REPORT_PASS` - Email password or app password

### AWS S3 Configuration
- `AWS_REGION` - AWS region (e.g., `ap-south-1`)
- `AWS_BUCKET_NAME` - S3 bucket name
- `AWS_ACCESS_KEY_ID` - AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key

### Password Configuration
- `PASSWORD_HASH_LENGTH` - Bcrypt salt rounds (default: `10`)

## Example .env File

```env
# Application Configuration
APP_PORT=3005
APP_HOST=0.0.0.0
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:4200
CORS_ORIGINS=http://localhost:4200,http://pms.mindpec.com

# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/database_name

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=5m

# Refresh Token Configuration
REFRESH_TOKEN_NAME=c-mps-refresh
REFRESH_TOKEN_LENGTH=64
REFRESH_TOKEN_EXPIRY_DAYS=7

# Cookie Configuration
APP_COOKIE_SECRET=your-cookie-secret-key

# Email Configuration (SMTP)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
REPORT_MAIL=your-email@example.com
REPORT_PASS=your-email-password

# AWS S3 Configuration
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Password Configuration
PASSWORD_HASH_LENGTH=10
```

## Changes Made

The following hardcoded URLs have been moved to environment variables:

1. **CORS Origins** (`middleware.config.ts`)
   - Previously: `['http://localhost:4200','http://pms.mindpec.com']`
   - Now: Uses `CORS_ORIGINS` environment variable

2. **Frontend URL** (`auth.service.ts`)
   - Previously: Had fallback to `"https://pms.mindpec.com"`
   - Now: **REQUIRED** - Must be set via `FRONTEND_URL` environment variable

3. **SMTP Host** (`sendgridService.ts`)
   - Previously: Hardcoded `'smtp.zoho.com'`
   - Now: Uses `SMTP_HOST` environment variable (defaults to `smtp.zoho.com`)

4. **Application Host** (`main.ts`)
   - Previously: Hardcoded `localhost` in log message
   - Now: Uses `APP_HOST` environment variable (defaults to `0.0.0.0`)

## Migration Notes

When deploying to a new environment, ensure all environment variables are set, especially:
- `FRONTEND_URL` - Must be set for password reset functionality
- `CORS_ORIGINS` - Must include all frontend URLs that will access the API

>>>>>>> 50b2106783da571ff78e8854e3aa536a4bb99f11

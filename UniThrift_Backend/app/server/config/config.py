import os

# Defaults which needs to be hardcoded
PROXY_API_PREFIX = ''
APP_TITLE = 'UniThrift Backend'

# Oauth JWT configuration
JWT_SECRET = os.environ.get('JWT_SECRET', os.urandom(32))
LOG_FILE_NAME = os.environ.get('LOG_FILE_NAME', 'app')

# Swagger Doc configuration
DOC_USERNAME = os.environ.get('DOC_USERNAME', 'admin')
DOC_PASSWORD = os.environ.get('DOC_PASSWORD', 'admin')

# Mongo configuration
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/test-dev')

# AWS service configuration
AWS_REGION = os.environ.get('AWS_REGION', 'ap-south-1')
AWS_ACCESS_ID = os.environ.get('AWS_ACCESS_ID', '')
AWS_SECRET_KEY = os.environ.get('AWS_SECRET_KEY', '')
AWS_STORAGE_BUCKET = os.environ.get('AWS_STORAGE_BUCKET', '')
AWS_S3_PRESIGNED_EXPIRATION = int(os.environ.get('AWS_S3_PRESIGNED_EXPIRATION', 60))
EMAIL_SENDER = os.environ.get('EMAIL_SENDER', 'test@gmail.com')

# Azure Service configuration
AZURE_STORAGE_CONNECTION_STRING = os.environ.get('AZURE_STORAGE_CONNECTION_STRING', '')
AZURE_PUBLIC_BLOB_CONTAINER_NAME = os.environ.get('AZURE_PUBLIC_BLOB_CONTAINER_NAME', '')
AZURE_PRIVATE_BLOB_CONTAINER_NAME = os.environ.get('AZURE_PRIVATE_BLOB_CONTAINER_NAME', '')


# SMTP Email client configuration
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
EMAIL_USERNAME = os.environ.get('EMAIL_USERNAME', '')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD', '')

# Twilio
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY', '')
EMAIL_SENDER = os.environ.get('EMAIL_SENDER', 'test@gmail.com')
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', 'abc123')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', 'abc123')
TWILIO_MESSAGING_SERVICE_SID = os.environ.get('TwilioMessagingServiceSid', '')

AUTH_SERVICE_BASE_URL = os.environ.get('AUTH_SERVICE_BASE_URL', 'http://127.0.0.1:4000/api/v1')

# voice-transcriber

## Setup

### Service Account Requirements

Create a service account with the following roles:
- **Cloud Functions Admin** - Deploy and manage functions
- **Service Account User** - Required to deploy as service account
- **Cloud Build Editor** - Required for building the function
- **Artifact Registry Writer** - Push container images
- **Cloud Run Admin** - Manage Cloud Run services (2nd Gen functions)
- **Storage Admin** - Access to Cloud Storage for function artifacts

### GitHub Secrets

Configure these secrets in your repository:
- **GCP_SA_KEY** - Service account JSON key file contents
- **GCP_SA_EMAIL** - Service account email address
- **AUTH_TOKEN** - Authorization token for API requests

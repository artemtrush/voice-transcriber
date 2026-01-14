# voice-transcriber

Automatically transcribes audio files added to Dropbox using webhooks and creates notes in Notion.

## Setup

### 1. Create Dropbox App

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click **"Create app"**
3. Choose:
   - **API**: Scoped access
   - **Access type**: Full Dropbox (or App folder)
   - **Name**: `voice-transcriber`
4. In **"Permissions"** tab, enable:
   - `files.metadata.read` - Read file metadata
   - `files.metadata.write` - Rename files
   - `files.content.read` - Download files
   - `files.content.write` - Move/rename files
5. In **"Settings"** tab:
   - Copy **App key**
   - Copy **App secret**

### 2. Get Dropbox Refresh Token

Run the provided script to get a refresh token:

```bash
./bin/get-dropbox-refresh-token.sh
```

### 3. GCP Service Account Requirements

Create a **Google Cloud Platform (GCP)** service account with the following roles:
- **Cloud Functions Admin** - Deploy and manage functions
- **Service Account User** - Required to deploy as service account
- **Cloud Build Editor** - Required for building the function
- **Artifact Registry Writer** - Push container images
- **Cloud Run Admin** - Manage Cloud Run services (2nd Gen functions)
- **Storage Admin** - Access to Cloud Storage for function artifacts

### 4. GitHub Secrets

| Secret | Description |
|--------|-------------|
| `GCP_SA_KEY` | Service account JSON key file contents |
| `GCP_SA_EMAIL` | Service account email address |
| `OPENAI_API_KEY` | OpenAI API key for transcription |
| `NOTION_TOKEN` | Notion integration token |
| `NOTION_DATABASE_ID` | Notion database ID for storing transcriptions |
| `DROPBOX_APP_KEY` | Dropbox app key from app settings |
| `DROPBOX_APP_SECRET` | Dropbox app secret from app settings |
| `DROPBOX_REFRESH_TOKEN` | Dropbox refresh token from OAuth flow (see step 2) |
| `DROPBOX_FOLDER_PATH` | Folder to watch (use `""` for entire Dropbox or `"/folder-name"` for specific folder) |

### 5. Register Webhook

After deployment:
1. Go to your app in [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Scroll to **"Webhooks"** section
3. Enter your function URL from deployment output
4. Click **"Add"**

**Note**: Function must be publicly accessible for Dropbox webhooks to work.

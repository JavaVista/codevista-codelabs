# 🚀 Google Cloud Run Setup Guide

This guide walks you through setting up CodeVista Labs on Google Cloud Run with automated GitHub Actions deployment.

## 📋 Prerequisites

- Google Cloud Platform account
- GitHub repository with CodeVista Labs
- `gcloud` CLI installed locally (optional, for testing)

## 🎯 Step 1: Create/Set Up GCP Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. **Note your Project ID** - you'll need this later
4. Enable billing for the project (required for Cloud Run)

## 🔧 Step 2: Enable Required APIs

In the Google Cloud Console, enable these APIs for your project:

```bash
# Using gcloud CLI (optional)
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

Or enable via the Console:
- **Cloud Run API** - For running containers
- **Cloud Build API** - For automated builds
- **Artifact Registry API** - For storing Docker images

### 🔍 How to Verify APIs are Enabled

**Option 1: Google Cloud Console (GUI)**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services > Enabled APIs**
3. Search for each required API:
   - "Cloud Run API"
   - "Artifact Registry API" 
   - "Cloud Build API"
4. Each should show as "Enabled" with a green checkmark

**Option 2: Command Line (gcloud CLI)**
```bash
# Check if APIs are enabled
gcloud services list --enabled --filter="name:run.googleapis.com OR name:artifactregistry.googleapis.com OR name:cloudbuild.googleapis.com"

# Should return something like:
# NAME                            TITLE
# artifactregistry.googleapis.com Artifact Registry API
# cloudbuild.googleapis.com       Cloud Build API  
# run.googleapis.com              Cloud Run Admin API
```

**Option 3: Quick Check All at Once**
```bash
# This command will show "ENABLED" for each API if active
for api in run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com; do
  echo -n "$api: "
  gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q $api && echo "ENABLED" || echo "DISABLED"
done
```

## 👤 Step 3: Create Service Account

### Option A: Using Google Cloud Console (GUI)
1. Go to **IAM & Admin > Service Accounts**
2. Click **Create Service Account**
3. **Name**: `codevista-codelabs-deploy`
4. **Description**: `Service account for automated CodeVista Labs deployment`

### Option B: Using gcloud CLI
```bash
# Create the service account
gcloud iam service-accounts create codevista-codelabs-deploy \
    --display-name="Codevista Codelabs Deploy" \
    --description="Service account for automated CodeVista Labs deployment"
```

### Grant Required Roles

Add these roles to your service account (works for both methods):

**Using gcloud CLI:**
```bash
# Get your project ID (if not already set)
PROJECT_ID=$(gcloud config get-value project)

# Add required roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:codevista-codelabs-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.developer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:codevista-codelabs-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:codevista-codelabs-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:codevista-codelabs-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
```

**Using Google Cloud Console:**
- **Cloud Run Developer** (`roles/run.developer`) - Deploy and manage Cloud Run services
- **Cloud Build Service Account** (`roles/cloudbuild.builds.builder`) - Build containers automatically  
- **Artifact Registry Administrator** (`roles/artifactregistry.admin`) - Manage Artifact Registry images
- **Service Account User** (`roles/iam.serviceAccountUser`) - Allow impersonation for deployments

## 🔑 Step 4: Authentication Setup

### 🛡️ Google's Security Recommendation

**⚠️ Security Notice:** Google Cloud now recommends using **Workload Identity Federation** instead of service account keys for better security. Service account keys can pose security risks if compromised.

### Option A: Workload Identity Federation (Recommended) 

**🔒 Most Secure - No Keys Required**

This method allows GitHub Actions to authenticate directly with Google Cloud without storing any keys.

```bash
# Get your project ID and number
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# 1. Create a Workload Identity Pool
gcloud iam workload-identity-pools create "github-actions" \
    --project="$PROJECT_ID" \
    --location="global" \
    --display-name="GitHub Actions Pool"

# 2. Create a Workload Identity Provider
# Replace YOUR_GITHUB_USERNAME with your actual GitHub username
gcloud iam workload-identity-pools providers create-oidc "github" \
    --project="$PROJECT_ID" \
    --location="global" \
    --workload-identity-pool="github-actions" \
    --display-name="GitHub provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository_owner=='YOUR_GITHUB_USERNAME'" \
    --issuer-uri="https://token.actions.githubusercontent.com"

# 3. Allow GitHub Actions from your repository to impersonate the service account
# Replace YOUR_GITHUB_USERNAME with your actual GitHub username
gcloud iam service-accounts add-iam-policy-binding \
    "codevista-codelabs-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
    --project="$PROJECT_ID" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/attribute.repository/YOUR_GITHUB_USERNAME/codevista-codelabs"
```

**⚠️ Important:** Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username in both commands above.

### 🔍 How to Find Your Values in GCP

After running the commands above, here's how to get the exact values for GitHub secrets:

**1. `GCP_PROJECT_ID`** - Your project ID (you already have this)

**2. `WIF_PROVIDER`** - Workload Identity Provider resource name:

**✅ Use the command output (Recommended):**
```bash
# Run this command to get the correct format:
echo "projects/$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')/locations/global/workloadIdentityPools/github-actions/providers/github"
```
**Or find it in Google Cloud Console:**
1. Go to **IAM & Admin > Service Accounts > Workload Identity Pools**
2. Click your `GitHub Actions Pool`
3. Find your Provider and click edit
4. Copy the **Url** under Audiences

**The WIF_PROVIDER secret needs the resource name format WITHOUT the `https://iam.googleapis.com/` prefix.**

**3. `WIF_SERVICE_ACCOUNT`** - Service account email:
```bash
# Get your service account email:
echo "codevista-codelabs-deploy@$(gcloud config get-value project).iam.gserviceaccount.com"
```

**Or find it in Google Cloud Console:**
1. Go to **IAM & Admin > Service Accounts**
2. Find your `codevista-codelabs-deploy` service account
3. Copy the **Email** field

**4. `CLOUD_RUN_SERVICE`** - Choose any name (lowercase, hyphens only):
- Example: `codevista-codelabs`

**5. `CLOUD_RUN_REGION`** - Choose your preferred region:
- Example: `us-east1`

**GitHub Secrets for Workload Identity Federation:**
| Secret Name | Value Source | Example |
|-------------|--------------|---------|
| `GCP_PROJECT_ID` | Your Google Cloud project ID | `my-codelabs-project` |
| `WIF_PROVIDER` | Copy from GCP Console or run command above | `projects/123456789/locations/global/workloadIdentityPools/github-actions/providers/github` |
| `WIF_SERVICE_ACCOUNT` | Copy from GCP Console or run command above | `codevista-codelabs-deploy@my-project.iam.gserviceaccount.com` |
| `CLOUD_RUN_SERVICE` | Choose any name (lowercase, hyphens only) | `codevista-codelabs` |
| `CLOUD_RUN_REGION` | Choose your preferred region | `us-east1` |

### Option B: Service Account Keys (Legacy) 

**⚠️ Security Warning:** As noted by Google Cloud Platform:

> **Service account keys could pose a security risk if compromised. We recommend you avoid downloading service account keys and instead use Workload Identity Federation.**
> 
> - Google automatically disables service account keys detected in public repositories
> - Keys can be accidentally exposed in logs, code, or configuration files
> - Keys don't expire automatically and require manual rotation

**If you must use service account keys:**

**Using Google Cloud Console (GUI):**
1. Click on your new service account
2. Go to the **Keys** tab  
3. **Note the security warning** displayed by Google
4. Click **Add Key > Create New Key > JSON**
5. Download the JSON file
6. **Store securely** - never commit to version control

**Using gcloud CLI:**
```bash
# Get your project ID
PROJECT_ID=$(gcloud config get-value project)

# Generate and download the service account key
gcloud iam service-accounts keys create ~/codevista-codelabs-deploy-key.json \
    --iam-account=codevista-codelabs-deploy@$PROJECT_ID.iam.gserviceaccount.com

# The key file will be saved to ~/codevista-codelabs-deploy-key.json
```

**GitHub Secrets for Service Account Keys:**
| Secret Name | Value | Example |
|-------------|--------|---------|
| `GCP_PROJECT_ID` | Your Google Cloud project ID | `my-codelabs-project` |
| `GCP_SA_KEY` | Contents of the service account JSON file | `{"type": "service_account"...}` |
| `CLOUD_RUN_SERVICE` | Name for your Cloud Run service | `codevista-codelabs` |
| `CLOUD_RUN_REGION` | Deployment region | `us-east1` |

### 📚 Learn More About Security

- [Workload Identity Federation Guide](https://cloud.google.com/iam/docs/workload-identity-federation)
- [How to authenticate service accounts securely](https://cloud.google.com/blog/products/identity-security/how-to-authenticate-service-accounts-to-help-keep-applications-secure)
- [Restricting service accounts](https://cloud.google.com/resource-manager/docs/organization-policy/restricting-service-accounts)

## ⚙️ Step 5: Configure GitHub Secrets and Variables

### For Workload Identity Federation (Recommended)

In your GitHub repository, go to **Settings > Secrets and variables > Actions**:

**Add these Secrets (Repository secrets):**
| Secret Name | Value | Example |
|-------------|--------|---------|
| `GCP_PROJECT_ID` | Your Google Cloud project ID | `my-codelabs-project` |
| `WIF_PROVIDER` | Workload Identity Provider resource name | `projects/123456789/locations/global/workloadIdentityPools/github-actions/providers/github` |
| `WIF_SERVICE_ACCOUNT` | Service account email | `codevista-codelabs-deploy@my-project.iam.gserviceaccount.com` |
| `CLOUD_RUN_SERVICE` | Name for your Cloud Run service | `codevista-codelabs` |
| `CLOUD_RUN_REGION` | Deployment region | `us-east1` |

**Add this Variable (Repository variable):**
| Variable Name | Value | Purpose |
|---------------|--------|---------|
| `USE_WORKLOAD_IDENTITY` | `true` | Tells GitHub Actions to use Workload Identity Federation instead of service account keys |

### 🤔 What is `USE_WORKLOAD_IDENTITY` for?

This variable controls which authentication method your GitHub Actions workflow uses:

**If `USE_WORKLOAD_IDENTITY = true`:**
- ✅ Uses Workload Identity Federation (secure, no keys stored)
- ✅ GitHub Actions authenticates directly with Google Cloud
- ✅ Uses the `WIF_PROVIDER` and `WIF_SERVICE_ACCOUNT` secrets

**If `USE_WORKLOAD_IDENTITY` is not set or anything other than `true`:**
- ⚠️ Falls back to service account keys (legacy method)
- ⚠️ Uses the `GCP_SA_KEY` secret (JSON file contents)

### For Service Account Keys (Legacy)

In your GitHub repository, go to **Settings > Secrets and variables > Actions**:

**Add these Secrets (Repository secrets):**
| Secret Name | Value | Example |
|-------------|--------|---------|
| `GCP_PROJECT_ID` | Your Google Cloud project ID | `my-codelabs-project` |
| `GCP_SA_KEY` | Contents of the service account JSON file | `{"type": "service_account"...}` |
| `CLOUD_RUN_SERVICE` | Name for your Cloud Run service | `codevista-codelabs` |
| `CLOUD_RUN_REGION` | Deployment region | `us-east1` |

**Do NOT set the `USE_WORKLOAD_IDENTITY` variable** (or set it to anything other than `true`)

### 🎯 Repository vs Environment Secrets

**✅ Use Repository secrets** because:
- Available to all workflows in your repository
- GitHub Actions workflow expects repository-level secrets
- Simpler setup for single-repository deployments

**❌ Don't use Environment secrets** unless:
- You have multiple environments (staging, production, etc.)
- Each environment needs different configurations
- You want environment-specific approval workflows

## 🌍 Recommended Regions

| Region | Location | Good For |
|--------|----------|----------|
| `us-east1` | South Carolina, USA | East Coast US |
| `us-west1` | Oregon, USA | West Coast US |
| `europe-west1` | Belgium | Europe |
| `asia-east1` | Taiwan | Asia |

## 🎛️ Step 6: Deploy Your First Version

Once your secrets are configured, push any change to the `main` branch:

```bash
git add .
git commit -m "feat: migrate to Cloud Run deployment"
git push origin main
```

The GitHub Action will automatically:
1. ✅ Build your application
2. ✅ Create a Docker container
3. ✅ Push to Google Artifact Registry
4. ✅ Deploy to Cloud Run
5. ✅ Provide the live URL

## 📊 Step 7: Monitor Your Deployment

### View Deployment Status
- GitHub: **Actions** tab shows build progress
- GCP Console: **Cloud Run** section shows service status

### Get Your Live URL
After successful deployment, find your URL:
```bash
gcloud run services describe codevista-codelabs \
  --platform managed \
  --region us-east1 \
  --format 'value(status.url)'
```

Or check the GitHub Actions output for the service URL.

## 💰 Cost Estimation

Cloud Run pricing is pay-per-use (request-based billing):

- **Free Tier**: 2 million requests/month + CPU/memory allowances
- **CPU (active time)**: $0.000024/vCPU-second  
- **Memory (active time)**: $0.0000025/GiB-second
- **Requests**: $0.40/million requests

**Typical monthly cost for a CodeVista Labs site**: $0-10/month

*Most small-to-medium codelabs sites will stay within the generous free tier limits.*

## 🔧 Configuration Options

### Environment Variables
Add these to your Cloud Run service if needed:

```bash
# Set in GitHub Actions workflow or GCP Console
NODE_ENV=production
PORT=8080
GOOGLE_ANALYTICS_ID=your-ga-id
```

### Custom Domain (Optional)
1. Go to **Cloud Run > Manage Custom Domains**
2. Add your domain
3. Update DNS records as instructed

## 🚨 Troubleshooting

### Common Issues

**❌ Build Fails: "Permission denied"**
- Check that all required APIs are enabled
- Verify service account has correct roles

**❌ Service Won't Start: "Container failed to start"**
- Check Dockerfile `EXPOSE 8080`
- Ensure `server.js` listens on `process.env.PORT`

**❌ 404 Errors on Site**
- Verify `npm run build` works locally
- Check that `dist/` folder contains built assets

### Debug Commands

```bash
# Test build locally
npm run build
npm start

# Check Cloud Run logs
gcloud run services logs read codevista-codelabs \
  --platform managed \
  --region us-east1

# Deploy manually (if GitHub Actions fails)
gcloud run deploy codevista-codelabs \
  --image us-east1-docker.pkg.dev/PROJECT-ID/codevista-codelabs/codevista-codelabs:latest \
  --platform managed \
  --region us-east1 \
  --allow-unauthenticated
```

## 🔄 Updating Your Site

Simply push changes to the `main` branch:

```bash
git add .
git commit -m "update: new codelab content"
git push origin main
```

The site automatically rebuilds and deploys in ~3-5 minutes.

## 🛡️ Security Best Practices

1. **Never commit** the service account JSON file
2. **Rotate keys** periodically (every 90 days recommended)
3. **Use least privilege** - only grant necessary IAM roles
4. **Monitor access** via GCP's Cloud Logging

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GitHub Actions for GCP](https://github.com/google-github-actions)
- [Artifact Registry Guide](https://cloud.google.com/artifact-registry/docs)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the [GitHub Actions logs]([../../actions](https://github.com/JavaVista/codevista-codelabs/actions))
2. Review [Cloud Run logs](https://console.cloud.google.com/run)
3. Verify all APIs are enabled in GCP Console
4. Ensure service account permissions are correct

**Your CodeVista Labs site will be more reliable, faster, and cheaper on Cloud Run!** 🎉

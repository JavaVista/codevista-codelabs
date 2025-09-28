# ⚡ GitHub Actions Setup Guide

This guide shows you how to set up automated deployment to Google Cloud Run using GitHub Actions.

## 📋 Prerequisites

Before following this guide, make sure you have:

- Completed the [Cloud Run Setup Guide](CLOUD_RUN_SETUP.md)
- Configured all GitHub secrets as described in that guide
- A Google Cloud project with the necessary APIs enabled

## 🎯 Step 1: Create the Workflow Directory

Create the GitHub Actions directory structure in your repository:

```bash
mkdir -p .github/workflows
```

## 📝 Step 2: Create the Workflow File

Create a new file at `.github/workflows/deploy.yml`:

```bash
touch .github/workflows/deploy.yml
```

## 🔧 Step 3: Add the Workflow Configuration

Copy the complete workflow below into your `.github/workflows/deploy.yml` file:

```yaml
name: Deploy to Cloud Run

# Trigger deployment on push to main branch
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

# Environment variables for the workflow
env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE_NAME: ${{ secrets.CLOUD_RUN_SERVICE }}
  REGION: ${{ secrets.CLOUD_RUN_REGION }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    # Required permissions for Workload Identity Federation
    permissions:
      id-token: write    # Required for OIDC token generation
      contents: read     # Required to checkout code
    
    steps:
    # Checkout the repository code
    - name: Checkout code
      uses: actions/checkout@v4

    # Set up Node.js environment
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    # Install project dependencies
    - name: Install dependencies
      run: npm ci

    # Run tests if they exist
    - name: Run tests (if any)
      run: npm test --if-present

    # Authenticate using Workload Identity Federation (recommended)
    - name: Authenticate to Google Cloud (Workload Identity Federation)
      if: ${{ vars.USE_WORKLOAD_IDENTITY == 'true' }}
      uses: google-github-actions/auth@v2
      with:
        workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
        service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}

    # Alternative: Authenticate using Service Account Key (legacy)
    - name: Authenticate to Google Cloud (Service Account Key)
      if: ${{ vars.USE_WORKLOAD_IDENTITY != 'true' }}
      uses: google-github-actions/auth@v2
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}

    # Set up Google Cloud CLI tools
    - name: Setup Google Cloud CLI
      uses: google-github-actions/setup-gcloud@v2

    # Configure Docker to work with Artifact Registry
    - name: Configure Docker for Artifact Registry
      run: gcloud auth configure-docker $REGION-docker.pkg.dev

    # Create Artifact Registry repository if it doesn't exist
    - name: Create Artifact Registry repository (if needed)
      run: |
        gcloud artifacts repositories create $SERVICE_NAME \
          --repository-format=docker \
          --location=$REGION \
          --description="Docker repository for $SERVICE_NAME" \
          --quiet || echo "Repository already exists"

    # Build Docker image with proper tags
    - name: Build Docker image
      run: |
        docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$SERVICE_NAME:$GITHUB_SHA .
        docker tag $REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$SERVICE_NAME:$GITHUB_SHA $REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$SERVICE_NAME:latest

    # Push Docker image to Artifact Registry
    - name: Push Docker image
      run: |
        docker push $REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$SERVICE_NAME:$GITHUB_SHA
        docker push $REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$SERVICE_NAME:latest

    # Deploy to Cloud Run with public access enabled
    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy $SERVICE_NAME \
          --image $REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$SERVICE_NAME:$GITHUB_SHA \
          --platform managed \
          --region $REGION \
          --allow-unauthenticated \
          --memory 512Mi \
          --cpu 1 \
          --min-instances 0 \
          --max-instances 10 \
          --port 8080 \
          --timeout 300 \
          --set-env-vars NODE_ENV=production

    # Get and display the service URL
    - name: Get service URL
      run: |
        SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
        echo "Service deployed at: $SERVICE_URL"
        echo "SERVICE_URL=$SERVICE_URL" >> $GITHUB_OUTPUT

    # Clean up old Docker images to save storage space
    - name: Cleanup old images (keep last 5)
      run: |
        gcloud artifacts docker images list $REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$SERVICE_NAME \
          --include-tags \
          --format="get(version)" \
          --limit=999999 \
          --sort-by=~UPDATE_TIME | tail -n +6 | \
          xargs -I {} gcloud artifacts docker images delete $REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$SERVICE_NAME:{} --quiet || true
```

## ⚠️ Critical Configuration Notes

### **🌐 Public Access (Prevents 403 Forbidden Error)**

The workflow includes the `--allow-unauthenticated` flag which is **essential** for public access:

```yaml
--allow-unauthenticated \  # ← This line prevents "Error: Forbidden"
```

**Without this flag, your deployed site will return "403 Forbidden" errors to all visitors.**

### **🔐 Authentication Methods**

The workflow supports both authentication methods:

- **Workload Identity Federation** (recommended, more secure)
- **Service Account Keys** (legacy, fallback method)

It automatically uses the method based on your `USE_WORKLOAD_IDENTITY` variable setting.

### **⚡ Performance Optimizations**

- **Resource limits**: Memory (512Mi) and CPU (1) appropriate for most codelabs sites
- **Scaling**: Auto-scales from 0 to 10 instances based on traffic
- **Cleanup**: Automatically removes old Docker images to save storage costs

## 🚀 Step 4: Commit and Deploy

After creating the workflow file:

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add Cloud Run deployment workflow"
git push origin main
```

The deployment will start automatically! 🎉

## 📊 Step 5: Monitor Your Deployment

Watch the deployment progress:

1. **GitHub**: Go to your repository → **Actions** tab
2. **Google Cloud**: Go to [Cloud Run Console](https://console.cloud.google.com/run)

Your live URL will be displayed in the GitHub Actions logs after successful deployment.

## 🚨 Troubleshooting

### **❌ "Error: Forbidden" after deployment**

- **Cause**: The `--allow-unauthenticated` flag is missing
- **Fix**: Verify your workflow file matches the template above

### **❌ "Permission denied" errors**

- **Cause**: Missing GitHub secrets or incorrect service account permissions
- **Fix**: Review the [Cloud Run Setup Guide](CLOUD_RUN_SETUP.md) secrets configuration

### **❌ "Repository not found" errors**

- **Cause**: Artifact Registry repository creation failed
- **Fix**: The workflow handles this automatically, but you can create manually:

  ```bash
  gcloud artifacts repositories create YOUR_SERVICE_NAME \
    --repository-format=docker \
    --location=YOUR_REGION
  ```

## 🔄 Making Updates

Once set up, deploying changes is simple:

```bash
git add .
git commit -m "update: your changes"
git push origin main
```

Your site automatically rebuilds and deploys in ~3-5 minutes! 🚀

---

## 🎯 Next Steps

After successful deployment:

1. **Test your live site** - Check the URL from GitHub Actions output
2. **Verify public access** - Ensure no 403 Forbidden errors
3. **Add more codelabs** - Create new tutorials and push to deploy
4. **Monitor performance** - Use Cloud Run metrics in GCP Console

**Your CodeVista Codelabs platform is now fully automated!** ✨

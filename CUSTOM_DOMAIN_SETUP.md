# 🌐 Custom Domain Setup for Cloud Run

Transform your ugly Cloud Run URL into a beautiful custom domain!

**From:** `https://codevista-codelabs-387250926785.us-east1.run.app/`  
**To:** `https://codelabs.yourdomain.com/`

## 📋 Prerequisites

- A domain you own (e.g., `codevista.com`)
- Access to your domain's DNS settings
- Your Cloud Run service already deployed and working

## 🚀 Step 1: Choose Your Subdomain

Pick a friendly subdomain for your codelabs:
- `codelabs.yourdomain.com`
- `labs.yourdomain.com` 
- `tutorials.yourdomain.com`

## ⚙️ Step 2: Set Up Custom Domain in Cloud Run

### Method A: Using Google Cloud Console (GUI)

1. **Go to Cloud Run:**
   - Navigate to [Cloud Run Console](https://console.cloud.google.com/run)
   - Click **"Manage Custom Domains"** at the top

2. **Add Domain:**
   - Click **"Add Mapping"**
   - **Service:** Select your `codevista-codelabs` service
   - **Domain:** Enter your subdomain (e.g., `codelabs.yourdomain.com`)
   - Click **"Continue"**

3. **Get DNS Records:**
   - Google will show you DNS records to add
   - **Copy these carefully** - you'll need them for Step 3

### Method B: Using gcloud CLI

```bash
# Map your custom domain to the Cloud Run service
gcloud run domain-mappings create \
  --service codevista-codelabs \
  --domain codelabs.yourdomain.com \
  --region us-east1
```

## 🔧 Step 3: Configure DNS Records

You'll need to add DNS records with your domain provider (GoDaddy, Namecheap, Cloudflare, etc.)

### DNS Records to Add:

Google will provide you with records like these:

**CNAME Record:**
```
Name: codelabs
Type: CNAME  
Value: ghs.googlehosted.com
TTL: 3600 (or Auto)
```

**A Records (for root domain verification - if needed):**
```
Name: @
Type: A
Value: 216.239.32.21
TTL: 3600

Name: @
Type: A  
Value: 216.239.34.21
TTL: 3600

Name: @
Type: A
Value: 216.239.36.21  
TTL: 3600

Name: @
Type: A
Value: 216.239.38.21
TTL: 3600
```

### Common DNS Providers:

**Cloudflare:**
1. Go to DNS settings
2. Add CNAME record: `codelabs` → `ghs.googlehosted.com`
3. Set Proxy Status to **DNS only** (gray cloud)

**GoDaddy:**
1. Go to DNS Management  
2. Add CNAME: Host=`codelabs`, Points to=`ghs.googlehosted.com`

**Namecheap:**
1. Go to Advanced DNS
2. Add CNAME: Host=`codelabs`, Value=`ghs.googlehosted.com`

## ⏱️ Step 4: Wait for Propagation

- **DNS propagation:** 15 minutes - 48 hours (usually ~1 hour)
- **SSL certificate generation:** Automatic (5-10 minutes after DNS resolves)

### Check DNS Propagation:
```bash
# Check if your DNS is working
nslookup codelabs.yourdomain.com

# Should return something like:
# codelabs.yourdomain.com canonical name = ghs.googlehosted.com
```

## ✅ Step 5: Verify Custom Domain

### Check Domain Status:
```bash
# Check domain mapping status
gcloud run domain-mappings list --region=us-east1
```

### Test Your New URL:
- Visit: `https://codelabs.yourdomain.com`
- Should redirect to your CodeVista Labs site!
- SSL certificate should be automatically provisioned

## 🔒 SSL Certificate (Automatic)

Google Cloud Run automatically:
- ✅ Provisions SSL certificates for custom domains
- ✅ Handles certificate renewal
- ✅ Redirects HTTP to HTTPS

**No additional setup needed!**

## 🎯 Alternative: Subdirectory Setup

If you want your codelabs at `yourdomain.com/codelabs` instead of a subdomain:

1. **Set up the subdomain first** (as above)
2. **Add a redirect** from your main site to the subdomain
3. **Or use a reverse proxy** (more advanced)

## 🚨 Troubleshooting

### Domain Not Working After 24 Hours

**Check DNS:**
```bash
dig codelabs.yourdomain.com
# Should show CNAME pointing to ghs.googlehosted.com
```

**Common Issues:**
- DNS records have wrong values
- TTL set too high (try 300 seconds)
- Cloudflare proxy enabled (should be DNS only)

### SSL Certificate Issues

```bash
# Check certificate status
gcloud run domain-mappings describe codelabs.yourdomain.com \
  --region=us-east1 \
  --format="value(status.conditions)"
```

**If SSL fails:**
- Wait longer (can take up to 24 hours)
- Verify DNS is resolving correctly
- Check that domain mapping status shows as "Ready"

### 404 Errors

- Verify your Cloud Run service is publicly accessible
- Check that the domain mapping points to the correct service
- Ensure `--allow-unauthenticated` flag was used in deployment

## 💰 Cost

**Custom domains on Cloud Run are FREE!**
- ✅ No additional charges
- ✅ Free SSL certificates  
- ✅ Automatic certificate management

## 🔄 Updating Domain Later

To change or remove custom domain:

```bash
# Remove domain mapping
gcloud run domain-mappings delete codelabs.yourdomain.com \
  --region=us-east1

# Add new domain mapping  
gcloud run domain-mappings create \
  --service codevista-codelabs \
  --domain new.yourdomain.com \
  --region=us-east1
```

## 📚 Next Steps

After setting up your custom domain:

1. **Update your README** with the new URL
2. **Update social media links** and documentation
3. **Set up redirects** from the old URL (optional)
4. **Update any hardcoded URLs** in your application

---

## 🎉 Result

**Before:** `https://codevista-codelabs-387250926785.us-east1.run.app/`  
**After:** `https://codelabs.yourdomain.com/` ✨

Professional, memorable, and brandable!

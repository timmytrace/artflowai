# Deployment Guide for artflowai.ca

## Prerequisites

1. **Azure Account** - Sign up at https://azure.microsoft.com/free/
2. **GitHub Account** - Your code should be in a GitHub repository
3. **Domain Access** - Access to artflowai.ca DNS settings

## Step 1: Create Azure Static Web App

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → Search for "Static Web App"
3. Configure:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `artflowai` (or any name you prefer)
   - **Plan type**: Free (perfect for getting started)
   - **Region**: Choose closest to your users (e.g., East US, Canada Central)
   - **Source**: GitHub
   - **Organization**: Your GitHub username
   - **Repository**: Select your repo
   - **Branch**: main (or master)
   - **Build Details**:
     - Build Presets: Custom
     - App location: `/`
     - Api location: (leave empty)
     - Output location: `dist`

4. Click "Review + Create" → "Create"

## Step 2: Configure Environment Variables in Azure

1. In Azure Portal, go to your Static Web App
2. Navigate to "Configuration" in the left menu
3. Add application setting:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key
4. Click "Save"

## Step 3: Configure Custom Domain

1. In Azure Portal, go to your Static Web App
2. Navigate to "Custom domains" in the left menu
3. Click "+ Add" → "Custom domain on other DNS"
4. Enter: `artflowai.ca`
5. Azure will provide you with DNS records to add

### DNS Configuration (at your domain registrar)

Add these DNS records for artflowai.ca:

**For root domain (artflowai.ca):**
- Type: `ALIAS` or `ANAME` (if supported) or `A`
- Name: `@`
- Value: (provided by Azure, something like `xxx.azurestaticapps.net`)

**For www subdomain (optional):**
- Type: `CNAME`
- Name: `www`
- Value: (provided by Azure, something like `xxx.azurestaticapps.net`)

**For domain validation:**
- Type: `TXT`
- Name: `@` or as specified by Azure
- Value: (validation token provided by Azure)

6. Wait for DNS propagation (can take 5 minutes to 48 hours)
7. Return to Azure Portal and click "Validate" once DNS is propagated

## Step 4: GitHub Secrets Configuration

The GitHub Actions workflow needs these secrets:

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add repository secrets:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: (Automatically added during Azure setup)
   - `GEMINI_API_KEY`: Your Gemini API key

## Step 5: Deploy

Once configured, every push to your main branch will automatically deploy to Azure!

### Manual Deployment (Alternative)

If you prefer to deploy manually without GitHub Actions:

```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Build your app
npm run build

# Deploy (you'll need your deployment token from Azure)
swa deploy ./dist --deployment-token <your-token>
```

## Verify Deployment

1. Wait for GitHub Actions to complete (check Actions tab in GitHub)
2. Visit your Azure Static Web App URL (e.g., `https://xxx.azurestaticapps.net`)
3. Once DNS is configured, visit `https://artflowai.ca`

## Troubleshooting

### Build Fails
- Check GitHub Actions logs for errors
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### API Key Not Working
- Verify environment variable name matches exactly: `GEMINI_API_KEY`
- Check Azure Configuration settings
- Restart the Static Web App after configuration changes

### Domain Not Working
- Verify DNS records are correct
- Wait for DNS propagation (use https://dnschecker.org)
- Check Azure Portal for domain validation status

### 404 Errors on Route Refresh
- Verify `staticwebapp.config.json` is in the root directory
- Check the navigationFallback configuration

## Cost

- **Azure Static Web Apps (Free tier)**: $0/month
  - 100 GB bandwidth/month
  - 0.5 GB storage
  - Perfect for this application

## Support

For issues:
- Azure Static Web Apps: https://docs.microsoft.com/azure/static-web-apps/
- GitHub Actions: https://docs.github.com/actions

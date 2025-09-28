# 🎯 CodeVista Codelabs

Welcome to **CodeVista Codelabs** - a beautiful, modern platform for creating and hosting interactive coding tutorials.

## ✨ Features

### 📚 **Content Management**

- **Markdown-Based**: Write codelabs in simple Markdown format or Google Docs
- **Auto-Generation**: Converts Markdown to beautiful, interactive HTML
- **Categorized**: Organize tutorials by technology, difficulty, or topic
- **GitHub Pages Ready**: Deploy anywhere with static hosting

## 🚀 Quick Start

### 1. **Clone & Setup**

```bash
git clone <your-repo>
cd codevista-codelabs
npm install
```

### 2. **Run Locally**

```bash
npm run serve
```

Visit `http://localhost:8000` to see your codelabs site!

## 🔧 Development

| Command              | Description                                                                       |
| -------------------- | --------------------------------------------------------------------------------- |
| `npm run serve`      | Builds and serves the site locally with live-reloading at `http://localhost:8000` |
| `npm run build`      | Exports codelabs and creates production build in `dist/` directory               |
| `npm run serve:dist` | Serves the production build from `dist/` for final testing                        |
| `npm run start`      | Starts the Express server for production (used by Docker/Cloud Run)               |
| `npm run dev`        | Builds and starts the server locally for development                              |

**Notes:**

- `serve` is for development with file watching and live-reloading
- `build` exports codelabs and creates the optimized production build
- `serve:dist` helps verify the final output before deployment
- `start` runs the Express server (production mode)
- `dev` combines build + start for local development

### 3. **Add Your First Codelab**

```bash
# Create a new codelab markdown file
touch codelabs/my-first-tutorial.md

# Generate HTML version
claat export codelabs/my-first-tutorial.md
```

## 📝 Creating Codelabs

CodeVista uses **CLaaT** (Command Line Apps Authoring Tool) - Google's tool for generating interactive HTML tutorials from Markdown or Google Docs.

📖 **Documentation Links:**

- [CLaaT README](https://github.com/googlecodelabs/tools/blob/main/claat/README.md) - Learn about all CLaaT features and commands
- [Format Guide](https://github.com/googlecodelabs/tools/blob/main/FORMAT-GUIDE.md) - Complete guide on supported syntax and metadata
- [Setup & Usage](https://github.com/googlecodelabs/tools/blob/main/README.md) - How to install and use CLaaT

### **Option 1: Create from Markdown**

Create `.md` files in the `codelabs/` directory:

```markdown
# My Awesome Tutorial

## Overview
Duration: 30 minutes
Categories: web, beginner

### What you'll learn
- How to build something cool
- Best practices for coding
- Tips and tricks

## Step 1: Getting Started
Duration: 5 minutes

Let's start building...
```

### **Generate HTML**

```bash
claat export codelabs/my-awesome-tutorial.md
```

This creates a `my-awesome-tutorial/` folder with the interactive HTML version.

### **Option 2: Create from Google Docs**

Prefer writing in Google Docs? That's also fully supported!

1. **Write in Google Docs**: Create a new Google Doc and format it according to the [CLaaT Format Guide](https://github.com/googlecodelabs/tools/blob/main/FORMAT-GUIDE.md). Use the same structure as Markdown but with Google Docs features like comments, links, and tables.

2. **Get Document ID**: Copy the unique document ID from your Google Doc URL (found after `docs.google.com/document/d/`).
   - Example: For URL `https://docs.google.com/document/d/1E6XMcdTexh5O8JwGy42SY3Ehzi8gOfUGiqTiUX6N04o/edit?tab=t.0#heading=h.7sa4zxkhmsum`
   - Document ID: `1E6XMcdTexh5O8JwGy42SY3Ehzi8gOfUGiqTiUX6N04o`

3. **Export to HTML**:

   ```bash
   claat export <your_document_id>
   ```

   This downloads and generates your codelab as interactive HTML files.

### **Update the Site**

```bash
npm run build
```

Your new codelab will appear on the main page, automatically categorized and styled.

### Update Existing Codelabs

If you make changes to an existing codelab, you need to regenerate the static files using the `claat` tool. Follow these steps:

1. Run the following command to update the codelab:

   ```bash
   claat update .
   ```

2. Serve the updated codelab locally to preview the changes:

   ```bash
   claat serve
   ```

3. Commit the updated files to the repository.

## 🎨 Customization

### **Update Branding**

- Replace `app/images/codevista-logo.png` with your logo
- Edit `app/views/default/view.json` to update site title and description

### **Modify Colors**

Colors are defined in `app/styles/_variables.scss`:

```scss
// Primary brand colors
$light-primary: #1976D2;    // Calming blue
$light-secondary: #388E3C;  // Soothing green
$light-accent: #FF6D00;     // Vibrant orange
```

### **Add Categories**

Categories are automatically extracted from your codelab metadata. Simply add them to your Markdown:

```markdown
Categories: web, angular, database, cloud
```

## 🚀 Deploy to Google Cloud Run

### **Why Cloud Run?**

✅ **Server-side capabilities** - Full Express.js middleware support  
✅ **Better performance** - Proper caching, compression, and CDN  
✅ **Cost-effective** - Pay-per-request, scales to zero  
✅ **Professional** - Custom domains, SSL, health checks  
✅ **No static hosting limitations** - Dropdown filters and dynamic routing work perfectly  

### **Quick Setup**

1. **Set up GCP Project** - See [CLOUD_RUN_SETUP.md](CLOUD_RUN_SETUP.md) for detailed instructions
2. **Configure GitHub Secrets** - Add your GCP credentials
3. **Push to deploy** - Automatic deployment on every push to `main`

```bash
git add .
git commit -m "feat: deploy to Cloud Run"
git push origin main
```

Your site will be live at a Cloud Run URL (e.g., `https://codevista-codelabs-xyz.run.app`)

### **Local Development**

```bash
# Install dependencies
npm ci

# Build and run locally
npm run dev

# Or run production build
npm run build
npm start
```

Visit `http://localhost:8080` to see your site.

## 📁 Project Structure

```bash
codevista-codelabs/
├── 📝 codelabs/                    # Your tutorial source files (.md or export results)
│   └── cloud-sql-cloud-run-angular-deployment.md  # Example codelab
├── 🏗️ build/                      # Generated site (deploy this)
├── 📱 app/
│   ├── 🖼️ images/
│   │   └── codevista-logo.png     # Your logo here
│   ├── 🎨 styles/
│   │   ├── _variables.scss        # Color customization
│   │   └── main.scss              # Main styles
│   ├── ⚡ scripts/
│   │   └── app.js                 # Dark mode toggle
│   └── 📋 views/default/
│       ├── index.html             # Site template
│       └── view.json              # Site configuration
├── 📦 package.json
└── 🔧 gulpfile.js                  # Build system
```

## 🎯 Built-in Example

The site comes has some codelabs that can be use as example.

For instance:

- **Source**: `codelabs/cloud-sql-cloud-run-angular-deployment.md`
- **Live Version**: `cloud-sql-cloud-run-angular-deployment/index.html`
- **Categories**: backend, database, cloud, angular

Use this as a template for creating your own tutorials!

## 💡 Pro Tips

### **Writing Great Codelabs**

- Start each step with a clear objective
- Use code blocks with syntax highlighting
- Include screenshots and diagrams
- Test your instructions on a fresh environment
- Keep steps focused and actionable

## 🆘 Need Help?

### **Troubleshooting**

- **Site not updating?** Run `npm run build` to regenerate
- **Styles not working?** Check the browser console for errors
- **Codelab not appearing?** Ensure the `.md` file has proper metadata

---

**Ready to create amazing tutorials?** Start by exploring the example codelab, then create your own in the `codelabs/` directory. Happy teaching! 🚀

## Contact / Social Media

- Bluesky – [@code-vista.bsky.social‬](https://bsky.app/profile/code-vista.bsky.social)
- GitHub - [https://github.com/JavaVista/](https://github.com/JavaVista/)
- LinkedIn - [Javier Carrion](https://www.linkedin.com/in/technologic)
- Website - [techno-logic.us](https://www.techno-logic.us)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

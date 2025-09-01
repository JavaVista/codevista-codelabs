# 🎯 CodeVista Codelabs

Welcome to **CodeVista Codelabs** - a beautiful, modern platform for creating and hosting interactive coding tutorials. Built with Angular Material v20 design principles, featuring a psychology-based color palette and full dark mode support.

## ✨ Features

### 🎨 **Modern Design**
- **Angular Material v20 Colors**: Calming blues (#1976D2) and soothing greens (#388E3C) for focus, with vibrant orange (#FF6D00) accents for engagement
- **Rounded Buttons**: 24px border-radius throughout for a modern, friendly appearance
- **Custom CodeVista Branding**: Your logo integrated seamlessly into the interface

### 🌙 **Dark Mode Support**
- **Smart Toggle**: Automatic system preference detection + manual override
- **Persistent Choice**: Remembers your theme preference across sessions
- **Optimized Colors**: Carefully adjusted color palette for dark backgrounds

### 📚 **Content Management**
- **Markdown-Based**: Write codelabs in simple Markdown format
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
Visit `http://localhost:3000` to see your codelabs site!

### 3. **Add Your First Codelab**
```bash
# Create a new codelab markdown file
touch codelabs/my-first-tutorial.md

# Generate HTML version
claat export codelabs/my-first-tutorial.md
```

## 📝 Creating Codelabs

### **Write in Markdown**
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

### **Update the Site**
```bash
npm run build
```

Your new codelab will appear on the main page, automatically categorized and styled.

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

## 🌐 Deploy to GitHub Pages

### **Option 1: Automatic Deployment**
1. Push your changes to GitHub
2. Go to Repository Settings → Pages
3. Select "Deploy from a branch" → `main` → `/build`
4. Your site will be live at `https://yourusername.github.io/codevista-codelabs`

### **Option 2: Manual Build**
```bash
# Build for production
npm run build

# The build/ directory contains your deployable site
```

## 📁 Project Structure

```
codevista-codelabs/
├── 📝 codelabs/                    # Your tutorial source files
│   └── my-tutorial.md
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

The site comes with a complete example codelab: **"Deploy an application with a database using Cloud SQL, Node.js connector, and Angular"**

- **Source**: `codelabs/cloud-sql-nodejs-angular-deployment.md`
- **Live Version**: `cloud-sql-nodejs-angular-deployment/index.html`
- **Categories**: backend, database, cloud, angular

Use this as a template for creating your own tutorials!

## 💡 Pro Tips

### **Writing Great Codelabs**
- Start each step with a clear objective
- Use code blocks with syntax highlighting
- Include screenshots and diagrams
- Test your instructions on a fresh environment
- Keep steps focused and actionable

### **Dark Mode Best Practices**
- Toggle is in the top toolbar (moon/sun icon)
- Respects system preferences automatically
- Colors are optimized for both light and dark themes
- All custom content automatically adapts

### **Performance**
- Images are automatically optimized
- CSS is minified in production builds
- Static generation means fast loading times
- Perfect for GitHub Pages hosting

## 🆘 Need Help?

### **Common Tasks**
- **Add a logo**: Replace `app/images/codevista-logo.png`
- **Change colors**: Edit `app/styles/_variables.scss`
- **Update site title**: Modify `app/views/default/view.json`
- **Test locally**: Run `npm run serve`

### **Troubleshooting**
- **Site not updating?** Run `npm run build` to regenerate
- **Styles not working?** Check the browser console for errors
- **Codelab not appearing?** Ensure the `.md` file has proper metadata

---

**Ready to create amazing tutorials?** Start by exploring the example codelab, then create your own in the `codelabs/` directory. Happy teaching! 🚀

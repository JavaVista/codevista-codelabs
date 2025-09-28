const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Polymer components
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Serve static files from dist directory
app.use(express.static('dist', {
  maxAge: '1d',
  etag: true
}));

// Handle malformed URLs from codelab Close button
// Pattern: /viewNamehtml → /viewName.html
app.use((req, res, next) => {
  const malformedUrlPattern = /^\/([a-z0-9\-]+)html$/i;
  const match = req.url.match(malformedUrlPattern);
  
  if (match) {
    const viewName = match[1];
    const correctUrl = `/${viewName}.html`;
    return res.redirect(301, correctUrl);
  }
  next();
});

// Handle view routes (angular, gcp, etc.)
app.get('/:view(angular|gcp)', (req, res) => {
  const viewFile = path.join(__dirname, 'dist', `${req.params.view}.html`);
  res.sendFile(viewFile, (err) => {
    if (err) {
      res.status(404).sendFile(path.join(__dirname, 'dist', '404.html'));
    }
  });
});

// Handle codelab routes
app.get('/codelabs/:codelabId/*', (req, res) => {
  const codelabPath = path.join(__dirname, 'dist', 'codelabs', req.params.codelabId, 'index.html');
  res.sendFile(codelabPath, (err) => {
    if (err) {
      res.status(404).sendFile(path.join(__dirname, 'dist', '404.html'));
    }
  });
});

// Handle root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Handle 404s
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'dist', '404.html'));
});

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).sendFile(path.join(__dirname, 'dist', '404.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 CodeVista Labs server running on port ${PORT}`);
  console.log(`📖 Open http://localhost:${PORT} to view the site`);
});

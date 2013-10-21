// Basic HTTP Delivery with Express
var express = require('express');
var app = express();

// Start server.
app.listen(process.env.PORT || 1337);

// App Root
var baseDirectory = __dirname;

// Storage Directory
app.get('/storage/*', function(req, res) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.sendfile(baseDirectory+'/storage/'+req.params[0]);
});

// Basic return of client directory
app.get('/*', function(req, res) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.sendfile(baseDirectory+'/client/'+req.params[0]);
});
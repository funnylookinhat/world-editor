// Basic HTTP Delivery with Express
var express = require('express');
var app = express();

// Start server.
app.listen(process.env.PORT || 1337);

// App Root
var baseDirectory = __dirname;

// Storage Directory
app.get('/storage/*', function(req, res) {
  res.sendfile(baseDirectory+'/storage/'+req.params[0]);
});

// Basic return of client directory
app.get('/*', function(req, res) {
  res.sendfile(baseDirectory+'/client/'+req.params[0]);
});
var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var serveStatic = require('serve-static');
var finalhandler = require('finalhandler');

var serve = serveStatic(__dirname);

function handler(req, res) {
  //   serveStatic(__dirname,
  //   function (err, data) {
  //     if (err) {
  //       res.writeHead(500);
  //       return res.end('Error loading index.html');
  //     }

  //     res.writeHead(200);
  //     res.end(data);
  //   });
  serve(req, res, finalhandler(req, res))
}
app.listen(1337);
var sockets = [];

io.on('connection', function (socket) {
  sockets.push(socket);

  socket.on('broadcast', function (data) {
    console.log(`message: ${data.message}`);
    submit('message', { message: data.message });
  });

  socket.on('song', function (data) {
    console.log(`song: ${data.song}`);
    submit('song', { song: data.song });
    fs.writeFile('currentlyPlaying.txt', data.song + '          ', function (err) {
      if (err) {
        submit('message', { message: err });
      }
    });
  });

  socket.on('remote control', function (data) {
    console.log(`action: ${data.action}`);
    submit('action', { action: data.action, url: data.url });
  });
});

function submit(action, data) {
  for (var i = 0; i < sockets.length; i++) {
    sockets[i].emit(action, data);
  }
}
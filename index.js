// Chamando Path e Cors
const path = require('path');
const cors = require('cors');


// Iniciando Servidor Local Express
const express = require('express');
const server = express();
server.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Total-Subscribers-Count');
  next();
});
server.use(cors());
var http = require('http').Server(server);

//Iniciando Socket Local
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

// Assets Servidor Local
server.use(express.static(path.resolve("assets")));

// Servindo página para OBS no endereço /BibliaOBS
server.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
server.get('/screen', function(req, res){
  res.sendFile(__dirname + '/screen.html');
});

// Ouvindo Sockets e enviando para Janela BrowserWindow e Servidor Local
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('showVerse', function(e){
    io.emit('showVerse', e);
  });
  socket.on('removeVerse', function(e){
    io.emit('removeVerse', e);
  });
  socket.on('style', function(e){
    io.emit('style', e)
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

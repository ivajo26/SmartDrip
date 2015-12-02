var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    fs = require('fs'),
    path = require('path'),
		serialport = require('serialport'),
		SerialPort = serialport.SerialPort;


app.use('/', express.static(path.join(__dirname, 'stream')));

http.listen(3000, function() {
  console.log('Servidor escuchando en puerto 3000');
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
// configure port and bound we set in the arduino
var sp = new SerialPort("/dev/ttyACM1",{
	baudrate: 9600,
	// delimit string :
	parser: serialport.parsers.readline(":")
});

sp.open(function(){
	sp.on("data", function(data){
		var string = data;
		// delimit using the , to separate every value
		var res = string.split(",");
		var s1,s2,s3,s4,prom,temp;
		s1 = res[0];
		s2 = res[1];
		s3 = res[2];
		s4 = res[3];
		prom = res[4];
		temp = res[5];
	});
});

var sockets = {};

io.on('connection', function(socket) {

  sockets[socket.id] = socket;
  console.log("Clientes conectados ", Object.keys(sockets).length);

  socket.on('disconnect', function() {
    delete sockets[socket.id];
  });
});

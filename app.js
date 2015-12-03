var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    fs = require('fs'),
    path = require('path'),
		serialport = require('serialport'),
		SerialPort = serialport.SerialPort;
var CultivoClass = function (){
  this.Moistures = [];
  this.Temperature=0;
  this.Promedio=0;
  this.Estado_Bombeo = false;
}

CultivoClass.prototype.setMoisture = function(pos,value) {this.Moistures[pos]=value;}
CultivoClass.prototype.getMoisture = function(pos) {return this.Moistures[pos];}
CultivoClass.prototype.tamMoisture = function() {return this.Moistures.length;}
CultivoClass.prototype.setTemperature = function (value) {this.Temperature = value;}
CultivoClass.prototype.getTemperature = function(value) {return this.Temperature;}
CultivoClass.prototype.setPromedio = function (value) {this.Promedio = value;}
CultivoClass.prototype.getPromedio = function(value) {return this.Promedio;}
CultivoClass.prototype.setEstado_Bombeo = function (value) {this.Estado_Bombeo = value;}
CultivoClass.prototype.getEstado_Bombeo = function(value) {return this.Estado_Bombeo;}
CultivoClass.prototype.saveDataBase = function(){
    Cultivo.insert({
    createdAt: new Date(),
    Moistures: this.Moistures,
    Temperature: this.Temperature
    });

}
var Cultivo = new CultivoClass();

app.use('/', express.static(path.join(__dirname, 'stream')));

http.listen(3000, function() {
  console.log('Servidor escuchando en puerto 3000');
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/view/index.html');
});

var sp = new SerialPort("/dev/ttyACM0",{
	baudrate: 9600,
	parser: serialport.parsers.readline(":")
});

sp.open(function(){
	sp.on("data", function(data){
		var string = data;
		// delimit using the , to separate every value
		var res = string.split(",");
    for (var i = 0; i < 4; i++) {
      Cultivo.setMoisture(i,res[i]);
    }
    Cultivo.setPromedio(res[4]);
    Cultivo.setTemperature(res[5]);
    Cultivo.setEstado_Bombeo(res[6]);
	});
});

var sockets = {};

io.on('connection', function(socket) {

  sockets[socket.id] = socket;
  console.log("Clientes conectados ", Object.keys(sockets).length);

  socket.on('disconnect', function() {
    delete sockets[socket.id];
    console.log("Cliente Desconectado");
    console.log("Clientes conectados ", Object.keys(sockets).length);
  });

});
setInterval(function(){
    io.emit('emit-m', {'s1':Cultivo.getMoisture(0),'s2':Cultivo.getMoisture(1),'s3':Cultivo.getMoisture(2),'s4':Cultivo.getMoisture(3),'tem':Cultivo.getTemperature(),'est':Cultivo.getEstado_Bombeo()});  
}, 100);

var express = require('express'),
    app = express(),
    router = express.Router(),
    http = require('http').createServer(app),
    io = require('socket.io')(http),
    mongo = require('mongoose'),
    crossroads = require('crossroads'),
    schema = mongo.Schema,
    swig = require('swig'),
		serialport = require('serialport'),
		SerialPort = serialport.SerialPort;

mongo.connect('mongodb://localhost/smartdrip');

var riegoSchema = new schema({
  created_at: Date,
  timer: Number,
  sensor1: Number,
  sensor2: Number,
  sensor3: Number,
  sensor4: Number,
  temperature: Number,
  estado: Number,
  promedio: Number
});

var Riego = mongo.model('Riego', riegoSchema);


swig.setDefaults({
	cache : 'memory'
});

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', './app/views');

app.use( express.static(__dirname + '/public') );
app.use(router);

// Calling routers
var homeRouter = require('./app/routers/home');
var moistureRouter = require('./app/routers/moisture');
var temperatureRouter = require('./app/routers/temperature');
homeRouter(router);
moistureRouter(router);
temperatureRouter(router);

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
  var datos = new Riego({
    created_at: new Date(),
    timer: (new Date()).getTime(),
    sensor1: this.Moistures[0],
    sensor2: this.Moistures[1],
    sensor3: this.Moistures[2],
    sensor4: this.Moistures[3],
    temperature: this.Temperature,
    estado: this.Estado_Bombeo,
    promedio: this.Promedio
  });

  datos.save();

}
var Cultivo = new CultivoClass();

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
      Cultivo.setMoisture(i,parseInt(res[i]));
    }
    if(parseInt(res[5])<0){
      Cultivo.setTemperature(parseInt(res[5])*(-1));
    }else {
      Cultivo.setTemperature(parseInt(res[5]);
    }
    Cultivo.setPromedio(parseInt(res[4]));

    Cultivo.setEstado_Bombeo(parseInt(res[6]));
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

  Riego.find({}, function(err, datos) {
    if (err) throw err;
    socket.emit('moistures', datos);
  });
  //

});

http.listen(3000, function() {
  console.log('Servidor escuchando en puerto 3000');
});
setInterval(function(){
    io.emit('emit-m', {'s1':Cultivo.getMoisture(0),'s2':Cultivo.getMoisture(1),'s3':Cultivo.getMoisture(2),'s4':Cultivo.getMoisture(3),'tem':Cultivo.getTemperature(),'est':Cultivo.getEstado_Bombeo(),'timer':(new Date).getTime(),'promedio': Cultivo.getPromedio()});
    Cultivo.saveDataBase();
}, 1000);

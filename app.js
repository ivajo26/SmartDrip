// Se importar y se inicializan las liberias.
var express = require('express'), //Liberia crear servidor web
    app = express(), //Se crea un servidor para la app
    router = express.Router(), //Se genera un enrutador para las vistar
    http = require('http').createServer(app), //Se activan los protocolos http para el servidor
    io = require('socket.io')(http), //Se crea la configuracion para conexiones socket con el servidor
    mongo = require('mongoose'), //Liberia con funciones para acceder a mongoDB
    crossroads = require('crossroads'), //Libreria para saltar entre entornos de trabajo
    schema = mongo.Schema, // Iniciamos los esquemas para la base de datos
    swig = require('swig'), // Motor de plantillas a implementar
		serialport = require('serialport'), // Libreria para la lectura del puerto serial
		SerialPort = serialport.SerialPort; // Se inicializa una variables para su control.

//Se conecta con la base de datos
mongo.connect('mongodb://localhost/smartdrip');

//Se crea un esquema para guardar los datos en la DB
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

//Se inicializa un modelo en la DB a partir del esquema creado
var Riego = mongo.model('Riego', riegoSchema);

//Configuramos el motor de plantillas
swig.setDefaults({
	cache : 'memory'
});

//Se configura el servidor para renderirar las plantillas
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', './app/views');

//Se establecen los archivos estaticos del server
app.use( express.static(__dirname + '/public') );
app.use(router);

// Se llaman a las rutas
var homeRouter = require('./app/routers/home');
var moistureRouter = require('./app/routers/moisture');
var temperatureRouter = require('./app/routers/temperature');
homeRouter(router);
moistureRouter(router);
temperatureRouter(router);

//Se crea una clase para modificar y obtener informacion
var CultivoClass = function (){
  this.Moistures = [];
  this.Temperature=0;
  this.Promedio=0;
  this.Estado_Bombeo = false;
}
//Se crean los metodos de la clase
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

//Se crea una instancia e inicializa la clase
var Cultivo = new CultivoClass();

//Se crear e inicializa la lectura del puerto serial
var sp = new SerialPort("/dev/ttyACM0",{
	baudrate: 9600,
	parser: serialport.parsers.readline(":")
});

//Se abre la conexcion del puerto serial
sp.open(function(){
  //Se establece un callback para la lectura del puerto serial
	sp.on("data", function(data){
		var string = data;
		// Se delimita y convierte en vector la informacion enviada
		var res = string.split(",");
    // Se guardan en la clase lo valores obtenidos
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
//Se crea un callback para escuchar conexciones socket
io.on('connection', function(socket) {

  sockets[socket.id] = socket;
  console.log("Clientes conectados ", Object.keys(sockets).length);

  //Funcion para cuando se deconecta un cliente
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
//Se activa la escucha del servidor web por el puerto 300
http.listen(3000, function() {
  console.log('Servidor escuchando en puerto 3000');
});

//FUncion intervalo para el envio de nuevos valores y guardado en base de datos
setInterval(function(){
    //Envio de nuevos valores
    io.emit('emit-m', {'s1':Cultivo.getMoisture(0),'s2':Cultivo.getMoisture(1),'s3':Cultivo.getMoisture(2),'s4':Cultivo.getMoisture(3),'tem':Cultivo.getTemperature(),'est':Cultivo.getEstado_Bombeo(),'timer':(new Date).getTime(),'promedio': Cultivo.getPromedio()});
    //Funcion para guardar en la base de datos.
    Cultivo.saveDataBase();
}, 1000);

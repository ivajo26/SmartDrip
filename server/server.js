var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

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
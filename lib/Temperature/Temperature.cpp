#include "Temperature.h"

Temperature::Temperature(int pin){
	pinMode(pin,INPUT);
	dat=0,val=0;
	p=pin;
}

int Temperature::getTemperature(){
	val=analogRead(p);
	dat=(500*val)/1024;
	return dat;
}

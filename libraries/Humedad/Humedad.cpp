#include "Humedad.h"

Humedad::Humedad(int pin1, int pin2, int pin3, int pin4){
	pinMode(pin1, INPUT);
	pinMode(pin2, INPUT);
	pinMode(pin3, INPUT);
	pinMode(pin4, INPUT);
	p1=pin1;
	p2=pin2;
	p3=pin3;
	p4=pin4;
}

float Humedad::getSensor1(){
	int val;
	val = analogRead(p1);
	return val;
}

float Humedad::getSensor2(){
	int val;
	val = analogRead(p2);
	return val;
}

float Humedad::getSensor3(){
	int val;
	val = analogRead(p3);
	return val;
}

float Humedad::getSensor4(){
	int val;
	val = analogRead(p4);
	return val;
}

float Humedad::getPromedio(){
	float suma=0, prom=0;
	suma=getSensor1()+getSensor2()+getSensor3()+getSensor4();
	prom=suma/4;
	return prom;
}

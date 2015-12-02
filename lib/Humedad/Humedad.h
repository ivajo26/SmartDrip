#ifndef Humedad_h
#define Humedad_h
#include "Arduino.h"

class Humedad
{
	public:
		Humedad(int pin1, int pin2, int pin3, int pin4);
		int getHumedad();
		float getSensor1();
		float getSensor2();
		float getSensor3();
		float getSensor4();
		float getPromedio();
		
	private:
		int p1, p2, p3, p4;
			
};
#endif

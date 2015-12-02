#ifndef Temperature_h
#define Temperature_h
#include "Arduino.h"

class Temperature
{
	public:
		Temperature(int pin);
		int getTemperature();
		
	private:
		int p;
		int val;
		int dat;


	
};
#endif

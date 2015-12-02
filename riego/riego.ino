#include <Temperature.h>
#include <Humedad.h>

Humedad sensorH = Humedad(A0,A1,A2,A3);
int relay = 12;
Temperature sensorT = Temperature(A4);

void setup(){
  Serial.begin(9600);
  pinMode(relay,OUTPUT);
}

void loop(){
  Serial.print(sensorH.getSensor1());
  Serial.print(",");
  Serial.print(sensorH.getSensor2());
  Serial.print(",");
  Serial.print(sensorH.getSensor3());
  Serial.print(",");
  Serial.print(sensorH.getSensor4());
  Serial.print(",");
  Serial.print(sensorH.getPromedio());
  Serial.print(",");
  Serial.print(sensorT.getTemperature());
  Serial.print(":");
  if (sensorH.getPromedio() <= 300){
    digitalWrite(relay,HIGH);
    delay(3000);
    digitalWrite(relay,LOW);
   }
}


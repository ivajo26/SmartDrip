#include <Temperature.h>
#include <Humedad.h>

Humedad sensorH = Humedad(A0,A1,A2,A3);
int relay = 12;
Temperature sensorT = Temperature(A4);
bool valvula_estado = false;
int tiempo_de_bombeo = 3000;
int tiempo_de_cierre = 0 ;

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
  Serial.print(",");
  Serial.print(valvula_estado);
  Serial.print(":");
  if (sensorH.getPromedio() <= 300){
    if(valvula_estado!=true){
      digitalWrite(relay,HIGH);
      tiempo_de_cierre = millis()+tiempo_de_bombeo;
      valvula_estado=true;
    }
   }
  if(tiempo_de_cierre<=millis()){
    digitalWrite(relay,LOW);
    valvula_estado=false;
  }
}

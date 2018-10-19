#include <SoftwareSerial.h>

SoftwareSerial mySerial(10, 11); // rx tx

String phone = "+12065555555";

void setup() {

  Serial.begin(115200); // to A6 module
  while (!Serial) {
    ;
  }

  mySerial.begin(115200); // serial breakout with SoftwareSerial (for monitoring)

  // texting yall

  Serial.println("AT+CMGF=1");
  delay(200);
  Serial.println("AT+CMGS=\"" + phone + "\"\r");
  delay(200);
  Serial.print("test message from A6");
  Serial.println (char(26)); // ctrl-z

  // calling yall

  Serial.println("AT+ATD"+"0794whatevz");
  Serial.println (char(26));

}

void loop(){

  if (Serial.available()) {
    mySerial.write(Serial.read());
  }

  if (mySerial.available()) {
    Serial.write(mySerial.read());
  }

}

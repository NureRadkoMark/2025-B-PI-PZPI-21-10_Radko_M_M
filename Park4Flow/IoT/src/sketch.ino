#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Keypad.h>
#include <ESP32Servo.h>  

// WiFi config
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* serverName = "http://host.wokwi.internal:5000/api/parkingActions/IOT/start";

// LED and servo config
const int ledPinRed = 2;
const int ledPinGreen = 13;
const int servoPin = 5;

// Keypad config
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {23, 22, 21, 19};
byte colPins[COLS] = {18, 17, 16, 15};

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

String securityCode = "";
String parkPlaceID = "";
bool enteringSecurityCode = true;

Servo myServo;  //  Servo

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 started");

  WiFi.begin(ssid, password, 6);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");

  pinMode(ledPinRed, OUTPUT);
  pinMode(ledPinGreen, OUTPUT);

  // Разрешаем использование таймеров ESP32 для сервопривода
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  myServo.setPeriodHertz(50);  // Стандартная частота для сервоприводов
  myServo.attach(servoPin, 500, 2400);  // Прикрепляем сервопривод с калибровкой импульсов

  Serial.println("Enter 6-digit Security Code:");
}

void loop() {
  char key = keypad.getKey();
  if (key) {
    if (key >= '0' && key <= '9') {
      if (enteringSecurityCode && securityCode.length() < 6) {
        securityCode += key;
        Serial.print(key);
        if (securityCode.length() == 6) {
          Serial.println("\nEnter ParkPlaceID:");
        }
      } else if (!enteringSecurityCode) {
        parkPlaceID += key;
        Serial.print(key);
      }
    } else if (key == '#') {
      Serial.println();
      if (securityCode.length() == 6 && parkPlaceID.length() > 0) {
        Serial.println("Sending data to server...");
        if (sendToServer(securityCode, parkPlaceID)) {
          myServo.write(90);  // Поворачиваем сервопривод на 90 градусов
          digitalWrite(ledPinGreen, HIGH);
          delay(1000);
          myServo.write(0);   // Возвращаем в исходное положение
          delay(1000);
          myServo.write(90);  // Снова поворачиваем на 90 градусов
          digitalWrite(ledPinGreen, LOW);
        } else {
          digitalWrite(ledPinRed, HIGH);
          delay(5000);
          digitalWrite(ledPinRed, LOW);
        }
        // Reset
        securityCode = "";
        parkPlaceID = "";
        enteringSecurityCode = true;
        Serial.println("Enter 6-digit Security Code:");
      } else if (securityCode.length() == 6) {
        enteringSecurityCode = false;
        Serial.println("Enter ParkPlaceID:");
      } else {
        Serial.println("Invalid input. Start over.");
        securityCode = "";
        parkPlaceID = "";
        enteringSecurityCode = true;
        Serial.println("Enter 6-digit Security Code:");
      }
    } else if (key == '*') {
      securityCode = "";
      parkPlaceID = "";
      enteringSecurityCode = true;
      Serial.println("\nInput reset. Enter 6-digit Security Code:");
    }
  }
}

bool sendToServer(String securityCode, String parkPlaceID) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");
  

    String jsonPayload = "{\"SecurityCode\":\"" + securityCode + "\",\"ParkPlaceID\":\"" + parkPlaceID + "\"}";
    Serial.println("Request Payload: " + jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response Code: " + String(httpResponseCode));
      Serial.println("Server Response: " + response);

      DynamicJsonDocument doc(512);
      DeserializationError error = deserializeJson(doc, response);

      if (error) {
        Serial.print("JSON Parsing Error: ");
        Serial.println(error.c_str());
        http.end();
        return false;
      }

      if (httpResponseCode == 201) {
        Serial.println("✅ Parking session started successfully.");
        http.end();
        return true;
      } else {
        const char* errMsg = doc["error"] | "Unknown server error.";
        Serial.print("❌ Server error: ");
        Serial.println(errMsg);
        http.end();
        return false;
      }
    } else {
      Serial.print("❌ HTTP POST Error: ");
      Serial.println(http.errorToString(httpResponseCode));
      http.end();
      return false;
    }
  } else {
    Serial.println("❌ WiFi disconnected.");
    return false;
  }
}
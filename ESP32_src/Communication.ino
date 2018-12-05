/*
    Video: https://www.youtube.com/watch?v=oCMOYS71NIU
    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleNotify.cpp
    Ported to Arduino ESP32 by Evandro Copercini

   Create a BLE server that, once we receive a connection, will send periodic notifications.
   The service advertises itself as: 6E400001-B5A3-F393-E0A9-E50E24DCCA9E
   Has a characteristic of: 6E400002-B5A3-F393-E0A9-E50E24DCCA9E - used for receiving data with "WRITE" 
   Has a characteristic of: 6E400003-B5A3-F393-E0A9-E50E24DCCA9E - used to send data with  "NOTIFY"

   The design of creating the BLE server is:
   1. Create a BLE Server
   2. Create a BLE Service
   3. Create a BLE Characteristic on the Service
   4. Create a BLE Descriptor on the characteristic
   5. Start the service.
   6. Start advertising.

   In this example rxValue is the data received (only accessible inside that function).
   And txValue is the data to be sent, in this example just a byte incremented every second.



    REF https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/peripherals/adc.html
*/
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#include "driver/gpio.h"
#include "driver/adc.h"
#include "esp_adc_cal.h"
#include "Multimeter.h"

const int global_verbosity = 1;

BLEServer *pServer = NULL;
BLECharacteristic * pTxCharacteristic;
bool deviceConnected = false;
bool oldDeviceConnected = false;
int rxDelay;
int adc1_voltage;

// Init multimeter
Multimeter * pMultimeter;


// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E" // UART service UUID
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"


class ConnectionCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      if(global_verbosity == 1){
        Serial.print("Client connected to ");
        Serial.println(pServer->getConnectedCount());
      }
      deviceConnected = true;
    };

    void onDisconnect(BLEServer* pServer) {
      Serial.print("Client disconnected from ");
      Serial.println(pServer->getConnectedCount());
      deviceConnected = false;
    }
};
class ReceptionCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string rxValue = pCharacteristic->getValue();

      if (rxValue.length() > 0) {
        if(global_verbosity == 1) {
          Serial.println("*********");
          Serial.print("Received Value: ");
          for (int i = 0; i < rxValue.length(); i++) {
            Serial.print(rxValue[i]);
          }
        }
        
        const char *cstr = rxValue.c_str();
        rxDelay = atoi(cstr);

        
        if(global_verbosity == 1) {
          Serial.print("Delay : ");
          Serial.println(rxDelay);
  
  
          Serial.println();
          Serial.println("*********");
        }
      }
    }
};

void setup() {
  Serial.begin(115200);
  rxDelay = 1000; 
  adc1_voltage = -1;

  // Create the BLE Device
  BLEDevice::init("UART Service");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ConnectionCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic
  pTxCharacteristic = pService->createCharacteristic(
										CHARACTERISTIC_UUID_TX,
										BLECharacteristic::PROPERTY_NOTIFY
									);
                      
  pTxCharacteristic->addDescriptor(new BLE2902());

  BLECharacteristic * pRxCharacteristic = pService->createCharacteristic(
											 CHARACTERISTIC_UUID_RX,
                       BLECharacteristic::PROPERTY_READ |  
											 BLECharacteristic::PROPERTY_WRITE
										);

  pRxCharacteristic->setCallbacks(new ReceptionCallbacks());

  // Start the service
  pService->start();

  
  BLEAdvertisementData * pData = new BLEAdvertisementData();
  pData->setCompleteServices(BLEUUID(SERVICE_UUID));
  
  
  // Start advertising
  pServer->getAdvertising()->setAdvertisementData(*pData);
  pServer->getAdvertising()->start();
  
  Serial.println("Waiting a client connection to notify...");

  // Multimeter
  pMultimeter = new Multimeter();
  pMultimeter->set_verbosity(global_verbosity);
  pMultimeter->set_atten(ADC_ATTEN_DB_11);

}

void loop() {
//    if (deviceConnected) {
    if (true) {
//        adc1_voltage = pMultimeter->voltage_adc1((adc1_channel_t) ADC_CHANNEL_6);

        
//        pMultimeter->voltage_adc1((adc1_channel_t) ADC_CHANNEL_7);
        adc1_voltage = pMultimeter->between_channels_adc1((adc1_channel_t) ADC_CHANNEL_6, (adc1_channel_t) ADC_CHANNEL_5);
         
        if(global_verbosity == 1) {
          printf("\n\t\tVoltage: %dmV\n", adc1_voltage);
        }
        
        pTxCharacteristic->setValue(adc1_voltage);
        pTxCharacteristic->notify();
  		  delay(rxDelay); // bluetooth stack will go into congestion, if too many packets are sent
  	}

    // disconnecting
    if (!deviceConnected && oldDeviceConnected) {
        delay(500); // give the bluetooth stack the chance to get things ready
        pServer->startAdvertising(); // restart advertising
        if(global_verbosity == 1) {
          Serial.println("start advertising");
        }
        oldDeviceConnected = deviceConnected;
    }
    // connecting
    if (deviceConnected && !oldDeviceConnected) {
		// do stuff here on connecting
        oldDeviceConnected = deviceConnected;
    }
}

import { AxiosError } from 'axios';
import { Service, PlatformAccessory } from 'homebridge';

import { NetBMEHomebridgePlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class EnvironmentPlatformAccessory {
  private temperatureService: Service;
  private humidityService: Service;
  private axios = require('axios');




  constructor(
    private readonly platform: NetBMEHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Farland Engineering')
      .setCharacteristic(this.platform.Characteristic.Model, 'RPi BME280')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.UUID);

    this.temperatureService = this.accessory.getService(this.platform.Service.TemperatureSensor)
      || this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.humidityService = this.accessory.getService(this.platform.Service.HumiditySensor)
      || this.accessory.addService(this.platform.Service.HumiditySensor);


    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.temperatureService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
    this.humidityService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb


    setInterval(() => {
      // EXAMPLE - inverse the trigger



      let url = platform.config.endpoint;
      let protocolNeeded = false;
      if (!url.includes("http://") && !url.includes("https://")) {
        url = "http://" + url;
        protocolNeeded = true;
      }
      url += ":" + platform.config.port;
      this.axios.get(url).then(resp => {
        const temperature = resp.data.data.temperature;
        const humidity = resp.data.data.humidity;
        this.temperatureService.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, temperature);
        this.humidityService.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, humidity);

      }).catch((err: AxiosError) => {

        platform.log.error(`
        Failed to reach 
        ${platform.config.endpoint} 
        ${protocolNeeded ? "(HTTP protocol prepended)" : ""} 
        on port ${platform.config.port}: ${err}
        `);
      });


    }, 10000);
  }

}
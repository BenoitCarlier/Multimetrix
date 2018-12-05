#include "Multimeter.h"
#include "Arduino.h"
#include "driver/adc.h"
#include "esp_adc_cal.h"

Multimeter::Multimeter() {
  adc1_set_config();
}

Multimeter::~Multimeter() {}

void Multimeter::adc1_set_config() {
    //Configure ADC
    adc1_config_width(m_width_bit);

    //Characterize ADC
    m_p_adc1_chars = (esp_adc_cal_characteristics_t*)calloc(1, sizeof(esp_adc_cal_characteristics_t));
    m_adc1_val_type = esp_adc_cal_characterize(ADC_UNIT_1, m_attenuation, m_width_bit, m_reference_voltage, m_p_adc1_chars);
}

void Multimeter::adc2_set_config() {
    //Characterize ADC
    m_p_adc2_chars = (esp_adc_cal_characteristics_t*)calloc(1, sizeof(esp_adc_cal_characteristics_t));
    m_adc2_val_type = esp_adc_cal_characterize(ADC_UNIT_2, m_attenuation, m_width_bit, m_reference_voltage, m_p_adc2_chars);
}

uint32_t Multimeter::voltage_adc1(adc1_channel_t channel) {
    adc1_config_channel_atten(channel, m_attenuation);
    uint32_t adc_reading = 0;
    //Multisampling
    for (int i = 0; i < m_no_of_samples; i++) {
        adc_reading += adc1_get_raw(channel);
    }
    adc_reading /= m_no_of_samples;
    //Convert adc_reading to voltage in mV
    uint32_t voltage = esp_adc_cal_raw_to_voltage(adc_reading, m_p_adc1_chars);
    if(m_verbosity == 1){
      printf("ADC 1\t\tRaw: %d\tVoltage: %dmV\n", adc_reading, voltage);
    }
    return voltage;
}

uint32_t Multimeter::between_channels_adc1(adc1_channel_t channel_high, adc1_channel_t channel_low) {
    adc1_config_channel_atten(channel_high, m_attenuation);
    adc1_config_channel_atten(channel_low, m_attenuation);
    uint32_t adc_reading_high = 0;
    uint32_t adc_reading_low = 0;
    //Multisampling
    for (int i = 0; i < m_no_of_samples; i++) {
        adc_reading_high += adc1_get_raw(channel_high);
        adc_reading_low += adc1_get_raw(channel_low);
    }
    adc_reading_high /= m_no_of_samples;
    adc_reading_low /= m_no_of_samples;
    //Convert adc_reading to voltage in mV
    uint32_t voltage_high = esp_adc_cal_raw_to_voltage(adc_reading_high, m_p_adc1_chars);
    uint32_t voltage_low = esp_adc_cal_raw_to_voltage(adc_reading_low, m_p_adc1_chars);
    if(m_verbosity == 1){
      printf("ADC 1\t\tRaw: %d\tVoltage high: %dmV\n", adc_reading_high, voltage_high);
      printf("ADC 1\t\tRaw: %d\tVoltage low: %dmV\n", adc_reading_low, voltage_low);
    }

    return (uint32_t)(voltage_high - voltage_low);
}

uint32_t Multimeter::voltage_adc2(adc2_channel_t channel) {
    adc2_config_channel_atten((adc2_channel_t)channel, m_attenuation);

    uint32_t adc_reading = 0;
    //Multisampling
    for (int i = 0; i < m_no_of_samples; i++) {
      int raw;
      adc2_get_raw((adc2_channel_t)channel, m_width_bit, &raw);
      adc_reading += raw;
    }
    adc_reading /= m_no_of_samples;
    //Convert adc_reading to voltage in mV
    uint32_t voltage = esp_adc_cal_raw_to_voltage(adc_reading, m_p_adc2_chars);
    if(m_verbosity == 1){
      printf("ADC 2\t\tRaw: %d\tVoltage: %dmV\n", adc_reading, voltage);
    }
    return voltage;
}

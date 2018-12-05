/*
  Multimeter.h - Library for using the measurement of voltage with an ESP32.
  Created by Clement Ponthieu, November 24, 2007.
  Released into the public domain.
*/

#include <driver/adc.h>
#include <esp_adc_cal.h>
#include "Arduino.h"

#include "driver/adc.h"
#include "soc/adc_channel.h"


#define DEFAULT_VREF    1088        //Use adc2_vref_to_gpio() to obtain a better estimate
#define NO_OF_SAMPLES   150          //Multisampling


class Multimeter
{
  public:
    /**
     * @brief Instanciate a Multimeter object to Take an ADC2 reading on a single channel. 
     *        Configure the ADC2 channel, including setting attenuation.
     *
     * @note This function also configures the input GPIO pin mux to
     * connect it to the ADC2 channel. 
     *
     * The default ADC full-scale voltage is 1.1V. To read higher voltages (up to the pin maximum voltage,
     * usually 3.3V) requires setting >0dB signal attenuation for that ADC channel.
     *
     * When VDD_A is 3.3V:
     *
     * - 0dB attenuaton (ADC_ATTEN_0db) gives full-scale voltage 1.1V
     * - 2.5dB attenuation (ADC_ATTEN_2_5db) gives full-scale voltage 1.5V
     * - 6dB attenuation (ADC_ATTEN_6db) gives full-scale voltage 2.2V
     * - 11dB attenuation (ADC_ATTEN_11db) gives full-scale voltage 3.9V (see note below)
     *
     * @note The full-scale voltage is the voltage corresponding to a maximum reading 
     * (depending on ADC2 configured bit width, this value is: 4095 for 12-bits, 2047 
     * for 11-bits, 1023 for 10-bits, 511 for 9 bits.)
     * 
     * @note At 11dB attenuation the maximum voltage is limited by VDD_A, not the full scale voltage.
     *
     * @note  Set the adc width (Default: ADC_WIDTH_BIT_12):
     *  - ADC capture width is 9Bit (ADC_WIDTH_BIT_9)
     *  - ADC capture width is 10Bit (ADC_WIDTH_BIT_10)
     *  - ADC capture width is 11Bit (ADC_WIDTH_BIT_11)
     *  - ADC capture width is 12Bit (ADC_WIDTH_BIT_12)
     *  
     * @param  channel ADC2 channel to read
     *  
     * @param  float reference value for voltage
     * 
     * @param atten  Attenuation level  (Default: ADC_ATTEN_0db)
     * 
     * @param width_bit Bit capture width for ADC (Default: ADC_WIDTH_BIT_12)
     * 
     * @param no_of_samples number of samples for multisampling (Default: 150)
     */
    Multimeter();
    virtual ~Multimeter();

    uint32_t voltage_adc1(adc1_channel_t channel);
    uint32_t voltage_adc2(adc2_channel_t channel);
    uint32_t between_channels_adc1(adc1_channel_t channel_high, adc1_channel_t channel_low);
    
    /**
     * @param set verbosity: 
     *  - 0(default): no print
     *  - 1: print
     */
     void set_verbosity(int v) {m_verbosity = v;};
    
     void set_reference_voltage(uint32_t v) {m_reference_voltage = v;};
     void set_atten(adc_atten_t v) {m_attenuation = v;};
     void set_bits_width(adc_bits_width_t v) {m_width_bit = v;};
     void set_no_of_samples(uint32_t v) {m_no_of_samples = v;};

  private:
    void adc1_set_config();
    void adc2_set_config();
    uint32_t                   m_reference_voltage{DEFAULT_VREF};
    adc_atten_t             m_attenuation{ADC_ATTEN_DB_11};
    adc_bits_width_t        m_width_bit{ADC_WIDTH_BIT_12};
    int m_verbosity{0};
    uint32_t m_no_of_samples{NO_OF_SAMPLES};

    // ADC1
    esp_adc_cal_characteristics_t *m_p_adc1_chars;
    esp_adc_cal_value_t m_adc1_val_type;
    
    // ADC2
    esp_adc_cal_characteristics_t *m_p_adc2_chars;
    esp_adc_cal_value_t m_adc2_val_type;
    
    
};

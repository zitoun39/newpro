import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { BaseCalculator } from '@/src/components/calculators/BaseCalculator';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/contexts/ThemeContext';
import { fmt } from '@/src/utils/format';
import { toNum } from '@/src/utils/validation';

type VolumeUnit = 'm3' | 'L' | 'cm3' | 'gallon' | 'ml';

interface ConversionResult {
  unit: VolumeUnit;
  value: number;
  label: string;
}

const volumeUnits: { [key in VolumeUnit]: { label: string; toLiters: number } } = {
  m3: { label: 'متر مكعب (m³)', toLiters: 1000 },
  L: { label: 'لتر (L)', toLiters: 1 },
  ml: { label: 'مليلتر (ml)', toLiters: 0.001 },
  cm3: { label: 'سنتيمتر مكعب (cm³)', toLiters: 0.001 },
  gallon: { label: 'جالون أمريكي (gallon)', toLiters: 3.785 },
};

const VOLUME_FORMULA_INFO = {
  title: 'محول وحدات الحجم',
  formula: `معاملات التحويل القياسية:

1 متر مكعب = 1000 لتر
1 لتر = 1000 مليلتر
1 لتر = 1000 سنتيمتر مكعب
1 جالون أمريكي = 3.785 لتر

أمثلة عملية:
• خزان 5m³ = 5,000 لتر
• زجاجة 500ml = 0.5 لتر
• برميل 200L = 0.2 متر مكعب

هذه الوحدات مهمة جداً لحسابات الخزانات والتدفق في محطات المعالجة.`
};

export default function VolumeConverter() {
  const { theme } = useTheme();
  const [value, setValue] = useState<string>('');
  const [inputUnit, setInputUnit] = useState<VolumeUnit>('L');
  const [results, setResults] = useState<ConversionResult[]>([]);

  const calculateConversions = (inputValue: string, fromUnit: VolumeUnit) => {
    const numValue = toNum(inputValue);
    
    if (!numValue && numValue !== 0) {
      setResults([]);
      return;
    }

    const litersValue = numValue * volumeUnits[fromUnit].toLiters;
    const conversions: ConversionResult[] = [];

    Object.entries(volumeUnits).forEach(([unit, config]) => {
      if (unit !== fromUnit) {
        const convertedValue = litersValue / config.toLiters;
        conversions.push({
          unit: unit as VolumeUnit,
          value: convertedValue,
          label: config.label,
        });
      }
    });

    setResults(conversions);
  };

  useEffect(() => {
    calculateConversions(value, inputUnit);
  }, [value, inputUnit]);

  return (
    <BaseCalculator
      title="محول وحدات الحجم"
      subtitle="تحويل سريع بين وحدات الحجم المختلفة"
      formulaInfo={VOLUME_FORMULA_INFO}
      favKey="/calculators/volume-converter"
      favTitle="محول وحدات الحجم"
      favRoute="/calculators/volume-converter"
      favGroup="تحويلات"
    >
      {/* Input Unit Selection */}
      <View style={{ marginBottom: 16 }}>
        <Text style={[{ 
          fontSize: 16, 
          fontWeight: '600', 
          color: theme.colors.text,
          textAlign: 'right',
          marginBottom: 8 
        }]}>
          نوع الوحدة
        </Text>
        <View style={{ 
          flexDirection: 'row-reverse', 
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 16
        }}>
          {Object.entries(volumeUnits).map(([unit, config]) => (
            <Card
              key={unit}
              style={{
                backgroundColor: inputUnit === unit 
                  ? theme.colors.primary + '20' 
                  : theme.colors.surface,
                borderWidth: 1,
                borderColor: inputUnit === unit 
                  ? theme.colors.primary 
                  : theme.colors.border,
                padding: 10,
                minWidth: 80,
              }}
              onPress={() => setInputUnit(unit as VolumeUnit)}
            >
              <Text style={{
                color: inputUnit === unit 
                  ? theme.colors.primary 
                  : theme.colors.text,
                textAlign: 'center',
                fontWeight: inputUnit === unit ? '600' : 'normal',
                fontSize: 12,
              }}>
                {config.label.split(' ')[0]}
              </Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Value Input */}
      <Input
        label={`القيمة (${volumeUnits[inputUnit].label})`}
        value={value}
        onChangeText={setValue}
        placeholder="مثال: 100"
        keyboardType="numeric"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Results */}
      {results.length > 0 && (
        <Card variant="elevated" style={{ marginTop: 8 }}>
          <Text style={[{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'right',
            marginBottom: 12,
          }]}>
            النتائج المحولة
          </Text>
          {results.map((result, index) => (
            <View key={index} style={{
              flexDirection: 'row-reverse',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 8,
              borderBottomWidth: index < results.length - 1 ? 1 : 0,
              borderBottomColor: theme.colors.border,
            }}>
              <Text style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                flex: 1,
              }}>
                {result.label}
              </Text>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.primary,
              }}>
                {fmt(result.value)}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Common Volume References */}
      <Card style={{ 
        backgroundColor: theme.colors.warning + '20',
        borderColor: theme.colors.warning + '40',
        marginTop: 16 
      }}>
        <Text style={[{
          fontSize: 14,
          fontWeight: '600',
          color: theme.colors.warningText,
          textAlign: 'right',
          marginBottom: 8,
        }]}>
          أحجام شائعة في معالجة المياه:
        </Text>
        <Text style={[{
          fontSize: 12,
          color: theme.colors.warningText,
          textAlign: 'right',
          lineHeight: 18,
        }]}>
          • خزان منزلي صغير: 500-1000 لتر{"\n"}
          • خزان منزلي متوسط: 2000-5000 لتر{"\n"}
          • صهريج توريد: 10-20 متر مكعب{"\n"}
          • زجاجة مياه: 500 مليلتر = 0.5 لتر
        </Text>
      </Card>
    </BaseCalculator>
  );
}


import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { BaseCalculator } from '@/src/components/calculators/BaseCalculator';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/contexts/ThemeContext';
import { fmt } from '@/src/utils/format';
import { toNum } from '@/src/utils/validation';

type GasVariable = "P" | "V" | "n" | "T";

interface GasLawInputs {
  P: string; // Pressure (atm)
  V: string; // Volume (L)
  n: string; // Moles (mol)
  T: string; // Temperature (K)
}

const R = 0.0821; // Gas constant L·atm/(mol·K)

const IDEAL_GAS_FORMULA_INFO = {
  title: 'قانون الغازات المثالية',
  formula: `المعادلة: PV = nRT

حيث:
• P = الضغط (atm)
• V = الحجم (L)
• n = عدد المولات (mol)
• T = درجة الحرارة (K)
• R = ثابت الغازات = 0.0821 L·atm/(mol·K)

يمكن حل المعادلة لأي متغير:
• P = nRT/V (الضغط)
• V = nRT/P (الحجم)
• n = PV/RT (المولات)
• T = PV/nR (درجة الحرارة)

الشروط المثالية:
• الغاز مثالي عند ضغوط منخفضة
• الجزيئات لا تتفاعل
• حجم الجزيئات مهمل
• صالح للغازات في الظروف العادية`
};

export default function IdealGasLaw() {
  const { theme } = useTheme();
  const [selectedVariable, setSelectedVariable] = useState<GasVariable>("P");
  const [inputs, setInputs] = useState<GasLawInputs>({
    P: "",
    V: "",
    n: "",
    T: "",
  });
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const variableLabels: { [key in GasVariable]: string } = {
    P: "الضغط (atm)",
    V: "الحجم (L)",
    n: "عدد المولات (mol)",
    T: "درجة الحرارة (K)",
  };

  const handleInputChange = (field: keyof GasLawInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    const P = toNum(inputs.P);
    const V = toNum(inputs.V);
    const n = toNum(inputs.n);
    const T = toNum(inputs.T);

    let calculatedValue: number;

    try {
      switch (selectedVariable) {
        case "P":
          if (V > 0 && n > 0 && T > 0) {
            calculatedValue = (n * R * T) / V;
            setResult(calculatedValue);
            setError(null);
          } else {
            setResult(null);
          }
          break;
        case "V":
          if (P > 0 && n > 0 && T > 0) {
            calculatedValue = (n * R * T) / P;
            setResult(calculatedValue);
            setError(null);
          } else {
            setResult(null);
          }
          break;
        case "n":
          if (P > 0 && V > 0 && T > 0) {
            calculatedValue = (P * V) / (R * T);
            setResult(calculatedValue);
            setError(null);
          } else {
            setResult(null);
          }
          break;
        case "T":
          if (P > 0 && V > 0 && n > 0) {
            calculatedValue = (P * V) / (n * R);
            setResult(calculatedValue);
            setError(null);
          } else {
            setResult(null);
          }
          break;
        default:
          setResult(null);
      }
    } catch (e: any) {
      setError(e.message);
      setResult(null);
    }
  }, [inputs, selectedVariable]);

  const getUnit = (variable: GasVariable): string => {
    switch (variable) {
      case 'P': return 'atm';
      case 'V': return 'L';
      case 'n': return 'mol';
      case 'T': return 'K';
      default: return '';
    }
  };

  return (
    <BaseCalculator
      title="قانون الغازات المثالية"
      subtitle="حساب متغيرات الغاز المثالي باستخدام PV = nRT"
      isCalculating={false}
      error={error}
      formulaInfo={IDEAL_GAS_FORMULA_INFO}
      favKey="/calculators/ideal-gas-law"
      favTitle="قانون الغازات المثالية"
      favRoute="/calculators/ideal-gas-law"
      favGroup="أنظمة عامة"
    >
      {/* Variable Selection */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={[
          {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'right',
            marginBottom: 12,
          }
        ]}>
          اختر المتغير المطلوب حسابه
        </Text>
        <View style={{ flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(variableLabels).map(([key, label]) => (
            <Card
              key={key}
              style={{
                padding: 12,
                backgroundColor: selectedVariable === key 
                  ? theme.colors.primary + '20' 
                  : theme.colors.surfaceVariant,
                borderWidth: 1,
                borderColor: selectedVariable === key 
                  ? theme.colors.primary 
                  : theme.colors.border,
                minWidth: 100,
              }}
              onPress={() => setSelectedVariable(key as GasVariable)}
            >
              <Text style={{
                color: selectedVariable === key 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary,
                fontSize: 14,
                textAlign: 'center',
                fontWeight: selectedVariable === key ? '600' : 'normal',
              }}>
                {label}
              </Text>
            </Card>
          ))}
        </View>
      </Card>

      {/* Input Fields */}
      {Object.entries(variableLabels).map(([variable, label]) => {
        if (variable === selectedVariable) return null;
        
        return (
          <Input
            key={variable}
            label={label}
            value={inputs[variable as GasVariable]}
            onChangeText={(value) => handleInputChange(variable as GasVariable, value)}
            placeholder="أدخل القيمة"
            keyboardType="numeric"
            helpText={`قيمة ${label} (يجب أن تكون موجبة)`}
            containerStyle={{ marginBottom: 16 }}
          />
        );
      })}

      {/* Results */}
      {result !== null && (
        <Card variant="elevated" style={{ marginTop: 8 }}>
          <Text style={[
            {
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
              textAlign: 'right',
              marginBottom: 12,
            }
          ]}>
            نتيجة الحساب
          </Text>
          
          <View style={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            backgroundColor: theme.colors.primary + '20',
            borderRadius: theme.radius.md,
            paddingHorizontal: 12,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.colors.primary,
              flex: 1,
            }}>
              {variableLabels[selectedVariable]}
            </Text>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.primary,
            }}>
              {fmt(result)} {getUnit(selectedVariable)}
            </Text>
          </View>
        </Card>
      )}

      {/* Standard Conditions Info */}
      <Card style={{ 
        backgroundColor: theme.colors.info + '20',
        borderColor: theme.colors.info + '40',
        marginTop: 16 
      }}>
        <Text style={[
          {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'right',
            marginBottom: 8,
          }
        ]}>
          🌡️ الظروف القياسية (STP):
        </Text>
        <Text style={[
          {
            fontSize: 12,
            color: theme.colors.textSecondary,
            textAlign: 'right',
            lineHeight: 18,
          }
        ]}>
          • درجة الحرارة: 273.15 K (0°C){"\n"}
          • الضغط: 1 atm (101.325 kPa){"\n"}
          • حجم المول الواحد: 22.4 L{"\n"}
          • ثابت الغازات: R = 0.0821 L·atm/(mol·K)
        </Text>
      </Card>
    </BaseCalculator>
  );
}

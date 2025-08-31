import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { BaseCalculator } from '@/src/components/calculators/BaseCalculator';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/contexts/ThemeContext';
import { fmt } from '@/src/utils/format';
import { toNum } from '@/src/utils/validation';

type FlowVariable = "Q" | "V" | "A";

interface FlowInputs {
  Q: string; // Flow rate (m³/s)
  V: string; // Velocity (m/s)
  A: string; // Area (m²)
  diameter: string; // Diameter for area calculation (m)
}

const PROCESS_FLOW_FORMULA_INFO = {
  title: 'حسابات تدفق العمليات',
  formula: `معادلة التدفق الأساسية:

Q = V × A

حيث:
• Q = معدل التدفق الحجمي (m³/s)
• V = سرعة المائع (m/s)
• A = مساحة المقطع العرضي (m²)

لحساب المساحة من القطر:
A = π × (d/2)²

حيث:
• d = قطر الأنبوب (m)
• π = 3.14159...

وحدات شائعة:
• m³/s → m³/h: × 3600
• L/s → m³/s: ÷ 1000
• L/min → L/s: ÷ 60

التطبيقات:
• حساب تدفق المضخات
• تصميم أنظمة الأنابيب
• حساب سعة المعالجة
• تقدير استهلاك الطاقة`
};

export default function ProcessFlow() {
  const { theme } = useTheme();
  const [selectedVariable, setSelectedVariable] = useState<FlowVariable>("Q");
  const [inputs, setInputs] = useState<FlowInputs>({
    Q: "",
    V: "",
    A: "",
    diameter: "",
  });
  const [result, setResult] = useState<number | null>(null);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const variableLabels: { [key in FlowVariable]: string } = {
    Q: "معدل التدفق (m³/s)",
    V: "السرعة (m/s)",
    A: "المساحة (m²)",
  };

  const handleInputChange = (field: keyof FlowInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Calculate area from diameter
  useEffect(() => {
    const diameter = toNum(inputs.diameter);
    if (diameter > 0) {
      const area = Math.PI * (diameter / 2) ** 2;
      setCalculatedArea(area);
    } else {
      setCalculatedArea(null);
    }
  }, [inputs.diameter]);

  // Auto-calculate when inputs change
  useEffect(() => {
    const Q = toNum(inputs.Q);
    const V = toNum(inputs.V);
    const directA = toNum(inputs.A);
    const A = directA || calculatedArea; // Use direct area or calculated from diameter

    if (!A && calculatedArea === null && inputs.diameter && !directA) {
      return; // Still calculating area from diameter
    }

    let calculatedValue: number;

    try {
      switch (selectedVariable) {
        case "Q":
          if (V > 0 && A !== null && A > 0) {
            calculatedValue = V * A;
            setResult(calculatedValue);
            setError(null);
          } else {
            setResult(null);
          }
          break;
        case "V":
          if (Q > 0 && A !== null && A > 0) {
            calculatedValue = Q / A;
            setResult(calculatedValue);
            setError(null);
          } else {
            setResult(null);
          }
          break;
        case "A":
          if (Q > 0 && V > 0) {
            calculatedValue = Q / V;
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
  }, [inputs, selectedVariable, calculatedArea]);

  const getUnit = (variable: FlowVariable): string => {
    switch (variable) {
      case 'Q': return 'm³/s';
      case 'V': return 'm/s';
      case 'A': return 'm²';
      default: return '';
    }
  };

  return (
    <BaseCalculator
      title="حسابات تدفق العمليات"
      subtitle="حساب معدل التدفق والسرعة والمساحة في الأنابيب"
      isCalculating={false}
      error={error}
      formulaInfo={PROCESS_FLOW_FORMULA_INFO}
      favKey="/calculators/process-flow"
      favTitle="حسابات تدفق العمليات"
      favRoute="/calculators/process-flow"
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
              onPress={() => setSelectedVariable(key as FlowVariable)}
            >
              <Text style={{
                color: selectedVariable === key 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary,
                fontSize: 12,
                textAlign: 'center',
                fontWeight: selectedVariable === key ? '600' : 'normal',
              }}>
                {label}
              </Text>
            </Card>
          ))}
        </View>
      </Card>

      {/* Flow Rate Input */}
      {selectedVariable !== "Q" && (
        <Input
          label="معدل التدفق (m³/s)"
          value={inputs.Q}
          onChangeText={(value) => handleInputChange("Q", value)}
          placeholder="أدخل معدل التدفق"
          keyboardType="numeric"
          helpText="معدل التدفق الحجمي بوحدة المتر المكعب في الثانية"
          containerStyle={{ marginBottom: 16 }}
        />
      )}

      {/* Velocity Input */}
      {selectedVariable !== "V" && (
        <Input
          label="السرعة (m/s)"
          value={inputs.V}
          onChangeText={(value) => handleInputChange("V", value)}
          placeholder="أدخل السرعة"
          keyboardType="numeric"
          helpText="سرعة المائع داخل الأنبوب بوحدة المتر في الثانية"
          containerStyle={{ marginBottom: 16 }}
        />
      )}

      {/* Area Input */}
      {selectedVariable !== "A" && (
        <>
          <Input
            label="المساحة (m²)"
            value={inputs.A}
            onChangeText={(value) => handleInputChange("A", value)}
            placeholder="أدخل المساحة مباشرة"
            keyboardType="numeric"
            helpText="مساحة المقطع العرضي للأنبوب بوحدة المتر المربع"
            containerStyle={{ marginBottom: 16 }}
          />

          <Text style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginVertical: 8,
            fontStyle: 'italic',
          }}>
            أو
          </Text>

          <Input
            label="قطر الأنبوب (m)"
            value={inputs.diameter}
            onChangeText={(value) => handleInputChange("diameter", value)}
            placeholder="أدخل القطر لحساب المساحة"
            keyboardType="numeric"
            helpText="قطر الأنبوب الداخلي بوحدة المتر - سيتم حساب المساحة تلقائياً"
            containerStyle={{ marginBottom: 16 }}
          />

          {calculatedArea !== null && (
            <Card style={{
              backgroundColor: theme.colors.success + '20',
              borderColor: theme.colors.success + '40',
              padding: 12,
              marginBottom: 16,
            }}>
              <Text style={{
                fontSize: 14,
                color: theme.colors.success,
                textAlign: 'right',
                fontWeight: '600',
              }}>
                📊 المساحة المحسوبة: {fmt(calculatedArea)} m²
              </Text>
            </Card>
          )}
        </>
      )}

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

      {/* Unit Conversions */}
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
          🔄 تحويلات الوحدات:
        </Text>
        <Text style={[
          {
            fontSize: 12,
            color: theme.colors.textSecondary,
            textAlign: 'right',
            lineHeight: 18,
          }
        ]}>
          • m³/s → m³/h: × 3600{"\n"}
          • L/s → m³/s: ÷ 1000{"\n"}
          • L/min → L/s: ÷ 60{"\n"}
          • مثال: 50 L/min = 0.833 L/s = 0.000833 m³/s
        </Text>
      </Card>
    </BaseCalculator>
  );
}

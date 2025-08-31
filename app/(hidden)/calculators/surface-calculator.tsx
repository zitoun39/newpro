import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { BaseCalculator } from '@/src/components/calculators/BaseCalculator';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/contexts/ThemeContext';
import { fmt } from '@/src/utils/format';
import { toNum } from '@/src/utils/validation';

type ShapeType = "square" | "rectangle" | "circle";

interface ShapeConfig {
  label: string;
  inputs: string[];
  calculate: (values: number[]) => number;
}

const shapes: { [key in ShapeType]: ShapeConfig } = {
  square: {
    label: "مربع",
    inputs: ["طول الضلع"],
    calculate: ([side]) => side * side,
  },
  rectangle: {
    label: "مستطيل",
    inputs: ["الطول", "العرض"],
    calculate: ([length, width]) => length * width,
  },
  circle: {
    label: "دائرة",
    inputs: ["نصف القطر"],
    calculate: ([radius]) => Math.PI * radius * radius,
  },
};

const SURFACE_FORMULA_INFO = {
  title: 'حاسبة المساحة',
  formula: `المعادلات المستخدمة:

• المربع: المساحة = طول الضلع²
  A = s²

• المستطيل: المساحة = الطول × العرض
  A = L × W

• الدائرة: المساحة = π × نصف القطر²
  A = π × r²

حيث:
• s = طول الضلع (m)
• L = الطول (m)
• W = العرض (m)
• r = نصف القطر (m)
• π = 3.14159...

التطبيقات:
• حساب مساحات الخزانات والأحواض
• تصميم أنظمة المعالجة
• حساب المساحات السطحية للمرشحات
• تقدير استهلاك المواد`
};

export default function SurfaceCalculator() {
  const { theme } = useTheme();
  const [selectedShape, setSelectedShape] = useState<ShapeType>("square");
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [area, setArea] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const inputCount = shapes[selectedShape].inputs.length;
    setInputValues(new Array(inputCount).fill(""));
    setArea(null);
    setError(null);
  }, [selectedShape]);

  // Auto-calculate area when inputs change
  useEffect(() => {
    const numValues = inputValues.map(val => toNum(val));
    
    if (numValues.every(val => val !== null && val > 0)) {
      try {
        const result = shapes[selectedShape].calculate(numValues as number[]);
        setArea(result);
        setError(null);
      } catch (e: any) {
        setError(e.message);
        setArea(null);
      }
    } else {
      setArea(null);
      setError(null);
    }
  }, [inputValues, selectedShape]);

  const updateInputValue = (index: number, value: string) => {
    const newValues = [...inputValues];
    newValues[index] = value;
    setInputValues(newValues);
    setError(null);
  };

  return (
    <BaseCalculator
      title="حاسبة المساحة"
      subtitle="حساب مساحات الأشكال الهندسية الأساسية"
      isCalculating={false}
      error={error}
      formulaInfo={SURFACE_FORMULA_INFO}
      favKey="/calculators/surface-calculator"
      favTitle="حاسبة المساحة"
      favRoute="/calculators/surface-calculator"
      favGroup="أنظمة عامة"
    >
      {/* Shape Selection */}
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
          اختر الشكل الهندسي
        </Text>
        <View style={{ flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(shapes).map(([key, config]) => (
            <Card
              key={key}
              style={{
                padding: 12,
                backgroundColor: selectedShape === key 
                  ? theme.colors.primary + '20' 
                  : theme.colors.surfaceVariant,
                borderWidth: 1,
                borderColor: selectedShape === key 
                  ? theme.colors.primary 
                  : theme.colors.border,
                minWidth: 80,
              }}
              onPress={() => setSelectedShape(key as ShapeType)}
            >
              <Text style={{
                color: selectedShape === key 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary,
                fontSize: 14,
                textAlign: 'center',
                fontWeight: selectedShape === key ? '600' : 'normal',
              }}>
                {config.label}
              </Text>
            </Card>
          ))}
        </View>
      </Card>

      {/* Input Fields */}
      {shapes[selectedShape].inputs.map((inputLabel, index) => (
        <Input
          key={index}
          label={inputLabel}
          value={inputValues[index] || ""}
          onChangeText={(value) => updateInputValue(index, value)}
          placeholder="أدخل القيمة"
          keyboardType="numeric"
          helpText={`قيمة ${inputLabel} بوحدة المتر (m)`}
          containerStyle={{ marginBottom: 16 }}
        />
      ))}

      {/* Results */}
      {area !== null && (
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
              المساحة
            </Text>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.primary,
            }}>
              {fmt(area)} m²
            </Text>
          </View>
        </Card>
      )}

      {/* Common Applications */}
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
          📊 أمثلة عملية:
        </Text>
        <Text style={[
          {
            fontSize: 12,
            color: theme.colors.textSecondary,
            textAlign: 'right',
            lineHeight: 18,
          }
        ]}>
          • خزان مربع (5m × 5m): 25 m²{"\n"}
          • حوض مستطيل (10m × 4m): 40 m²{"\n"}
          • مرشح دائري (نق = 2m): 12.57 m²{"\n"}
          • أنبوب دائري (نق = 0.5m): 0.785 m²
        </Text>
      </Card>
    </BaseCalculator>
  );
}

﻿﻿﻿﻿import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { BaseCalculator } from '@/src/components/calculators/BaseCalculator';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/contexts/ThemeContext';
import { fmt } from '@/src/utils/format';
import { toNum } from '@/src/utils/validation';
import { chlorineDosePumpFlow_Lph } from '@/src/utils/dosing';

const CHLORINE_DOSE_FORMULA_INFO = {
  title: 'جرعة الكلور / الهيبو',
  formula: `الطريقة الحسابية لجرعة الكلور (NaOCl):

Dose (mg/L) = (C_stock (mg/L) × Q_dose (L/h)) / (1000 × Q_water (m³/h))
⇒ Q_dose = Dose × 1000 × Q_water / C_stock

حساب تركيز المحلول:
C_stock (mg/L) = الكثافة (kg/L) × Available% × 1e6

ملاحظات:
• الكثافة الشائعة لمحلول NaOCl 12–15% ≈ 1.20 g/mL.
• "Available %" هي نسبة الكلور الفعّال (وليس % NaOCl فقط).
• النتائج تقديريةً، اضبط الجرعة ميدانياً حسب المتبقي الحر (Free Cl).

أمثلة عملية:
• محطة 50 m³/h، جرعة 2 mg/L، محلول 12% ⇒ 0.83 L/h
• شبكة 200 m³/h، جرعة 1.5 mg/L، محلول 15% ⇒ 2 L/h`
};

export default function ChlorineDosePage() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    flow: '',          // m3/h
    dose: '',          // mg/L
    available: '12.5', // %
    density: '1.20'    // g/mL
  });
  const [results, setResults] = useState<{C_stock_mgL: number; Q_dose_Lph: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    const { flow, dose, available, density } = formData;
    const flowNum = toNum(flow);
    const doseNum = toNum(dose);
    const availableNum = toNum(available);
    const densityNum = toNum(density);

    if (flowNum > 0 && doseNum > 0 && availableNum > 0 && densityNum > 0) {
      try {
        const result = chlorineDosePumpFlow_Lph(flowNum, doseNum, availableNum, densityNum);
        setResults(result);
        setError(null);
      } catch (e: any) {
        setError(e.message);
        setResults(null);
      }
    } else {
      setResults(null);
      setError(null);
    }
  }, [formData]);

  return (
    <BaseCalculator
      title="جرعة الكلور / الهيبو"
      subtitle="حساب جرعة مضخة الكلور حسب التدفق والتركيز المطلوب"
      isCalculating={false}
      error={error}
      formulaInfo={CHLORINE_DOSE_FORMULA_INFO}
      favKey="/calculators/dosing/chlorine-dose"
      favTitle="حاسبة جرعة الكلور"
      favRoute="/calculators/dosing/chlorine-dose"
      favGroup="الجرعات"
    >
      {/* Flow Input */}
      <Input
        label="تدفق الماء (m³/h)"
        value={formData.flow}
        onChangeText={(value) => handleInputChange('flow', value)}
        placeholder="مثال: 20"
        keyboardType="numeric"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Target Dose Input */}
      <Input
        label="الجرعة المستهدفة (mg/L)"
        value={formData.dose}
        onChangeText={(value) => handleInputChange('dose', value)}
        placeholder="مثال: 2"
        keyboardType="numeric"
        helpText="الكلور الحر المطلوب في الشبكة"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Available Chlorine Input */}
      <Input
        label="Available % (الكلور الفعّال)"
        value={formData.available}
        onChangeText={(value) => handleInputChange('available', value)}
        placeholder="مثال: 12.5"
        keyboardType="numeric"
        helpText="نسبة الكلور الفعال في المحلول (ليس % NaOCl)"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Solution Density Input */}
      <Input
        label="كثافة المحلول (g/mL)"
        value={formData.density}
        onChangeText={(value) => handleInputChange('density', value)}
        placeholder="مثال: 1.20"
        keyboardType="numeric"
        helpText="كثافة محلول الهيبوكلوريت (عادة 1.15-1.25)"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Results */}
      {results && (
        <Card variant="elevated" style={{ marginTop: 8 }}>
          <Text style={[{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'right',
            marginBottom: 12,
          }]}>
            نتائج الحساب
          </Text>
          
          <View style={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}>
            <Text style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
              flex: 1,
            }}>
              تركيز المحلول
            </Text>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.primary,
            }}>
              {fmt(results.C_stock_mgL)} mg/L
            </Text>
          </View>

          <View style={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
          }}>
            <Text style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
              flex: 1,
            }}>
              تدفق مضخة الجرعات المطلوب
            </Text>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.success || theme.colors.primary,
            }}>
              {fmt(results.Q_dose_Lph)} L/h
            </Text>
          </View>
        </Card>
      )}

      {/* Safety Tips */}
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
          ⚠️ نصائح السلامة:
        </Text>
        <Text style={[{
          fontSize: 12,
          color: theme.colors.warningText,
          textAlign: 'right',
          lineHeight: 18,
        }]}>
          • راقب الكلور المتبقي الحر واضبط الجرعة تدريجياً.{"\n"}
          • لا تستخدم المضخة بأقل من 20% من سعتها.{"\n"}
          • تحقق من توافق المواد (PVC, PE أفضل من المعادن) مع NaOCl.{"\n"}
          • استخدم معدات حماية شخصية عند التعامل مع الكيماويات.
        </Text>
      </Card>
    </BaseCalculator>
  );
}
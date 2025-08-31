﻿﻿﻿import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { BaseCalculator } from '@/src/components/calculators/BaseCalculator';
import { Input, Card, Button } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { acidAlkaliDose_Lph } from '@/src/utils/dosing';
import { fmt } from '@/src/utils/format';
import { toNum } from '@/src/utils/validation';

const ACID_ALKALI_FORMULA_INFO = {
  title: 'جرعات الأحماض/القلويات',
  formula: `تقدير أولي لجرعات الأحماض/القلويات:

ΔAlk_meq/L = ΔAlk_mg/L as CaCO3 ÷ 50
Q_chem (L/h) = (ΔAlk_meq/L × Q_water (m³/h)) ÷ N
⇒⇒ Q_chem (L/h) = (ΔAlk_mg/L ÷ 50) × (Q ÷ N)

ملاحظات:
• هذه تقديرات أولية؛ اضبطها باختبار ميداني (Jar test).
• احسب Normality بعد أي تخفيف للمحلول.
• التزم بوسائل السلامة PPE وتوافق المواد.`
};

export default function AcidAlkaliDosePage() {
  const { theme } = useTheme();
  const [inputs, setInputs] = useState({
    flow: '20',        // m3/h
    deltaAlk: '50',    // mg/L as CaCO3
    N: '0.1'           // Normality
  });
  const [result, setResult] = useState<{ Q_chem_Lph: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof inputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const calculate = () => {
    try {
      const flowNum = toNum(inputs.flow);
      const deltaAlkNum = toNum(inputs.deltaAlk);
      const nNum = toNum(inputs.N);
      
      if (!flowNum || !deltaAlkNum || !nNum) {
        setError('يرجى إدخال جميع القيم المطلوبة');
        return;
      }
      
      const res = acidAlkaliDose_Lph(flowNum, deltaAlkNum, nNum);
      setResult(res);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'خطأ في الحساب');
      setResult(null);
    }
  };

  const renderResults = () => {
    if (!result) return null;

    return (
      <Card>
        <Text style={{
          fontSize: 14,
          color: theme.colors.textSecondary,
          textAlign: 'right',
          marginBottom: 8,
        }}>
          معدل الحقن المطلوب:
        </Text>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: theme.colors.primary,
          textAlign: 'right',
        }}>
          {fmt(result.Q_chem_Lph)} L/h
        </Text>
      </Card>
    );
  };

  return (
    <BaseCalculator
      title="حاسبة جرعة الحمض/القلوي"
      subtitle="حساب جرعة مضخة حسب تغيير القلوية"
      error={error}
      results={renderResults()}
      formulaInfo={ACID_ALKALI_FORMULA_INFO}
      warningMessage="هذه تقديرات أولية. اضبطها باختبار ميداني (Jar test). التزم بوسائل السلامة."
      favKey="/calculators/dosing/acid-alkali-dose"
      favTitle="حاسبة جرعة الحمض/القلوي"
      favRoute="/calculators/dosing/acid-alkali-dose"
      favGroup="الجرعات"
    >
      <Input
        label="تدفق الماء (m³/h)"
        value={inputs.flow}
        onChangeText={(value) => handleInputChange('flow', value)}
        placeholder="مثال: 20"
        keyboardType="numeric"
        containerStyle={{ marginBottom: 16 }}
      />

      <Input
        label="ΔAlk المطلوب (mg/L as CaCO₃)"
        value={inputs.deltaAlk}
        onChangeText={(value) => handleInputChange('deltaAlk', value)}
        placeholder="مثال: 50"
        keyboardType="numeric"
        helpText="التغيير المطلوب في القلوية"
        containerStyle={{ marginBottom: 16 }}
      />

      <Input
        label="Normality (N)"
        value={inputs.N}
        onChangeText={(value) => handleInputChange('N', value)}
        placeholder="مثال: 0.1"
        keyboardType="numeric"
        helpText="تركيز المحلول بالنورماليتي"
        containerStyle={{ marginBottom: 16 }}
      />
      
      <Button
        title="احسب"
        onPress={calculate}
        style={{ marginTop: 16 }}
      />
    </BaseCalculator>
  );
}

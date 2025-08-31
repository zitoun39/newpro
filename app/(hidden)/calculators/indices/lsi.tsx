import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { BaseCalculator } from '@/src/components/calculators/BaseCalculator';
import { Input, Card } from '@/src/components/ui';
import { useTheme } from '@/src/contexts/ThemeContext';
import { LSI, RSI_from_LSI, pHs } from '@/src/utils/indices';
import { fmt } from '@/src/utils/format';
import { toNum } from '@/src/utils/validation';

const LSI_RSI_FORMULA_INFO = {
  title: 'مؤشرا لانجليير وريزنر للتشبع',
  formula: `LSI = pH - pHs
RSI = 2 × pHs - pH

حيث:
pHs = (9.3 + A + B) - (C + D)

A = (log₁₀(TDS) - 1) / 10
B = -13.12 × log₁₀(T + 273) + 34.55
C = log₁₀(Ca²⁺) - 0.4
D = log₁₀(Alkalinity)

تفسير LSI:
• LSI > 0.1: قابلية للترسيب (خطر القشور)
• LSI < -0.1: قابلية للتآكل
• LSI ≈ 0: ماء متوازن

تفسير RSI:
• RSI < 6.5: قابلية للترسيب
• RSI > 7.5: قابلية للتآكل
• 6.5 ≤ RSI ≤ 7.5: ماء متوازن`
};

export default function LSIRSICalculatorScreen() {
  const { theme } = useTheme();
  
  const [inputs, setInputs] = useState({
    pH: '7.8',
    temperature: '25',
    tds: '500',
    calciumHardness: '120',
    alkalinity: '100'
  });
  
  const [results, setResults] = useState<{
    lsi: number;
    rsi: number;
    pHs: number;
    lsiInterpretation: string;
    rsiInterpretation: string;
  } | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate when all inputs are valid
  useEffect(() => {
    const { pH, temperature, tds, calciumHardness, alkalinity } = inputs;
    const values = {
      pH: toNum(pH),
      temperature: toNum(temperature),
      tds: toNum(tds),
      calciumHardness: toNum(calciumHardness),
      alkalinity: toNum(alkalinity)
    };

    // All values > 0 to start auto-calculation
    if (Object.values(values).every(v => typeof v === 'number' && v > 0)) {
      try {
        const lsiValue = LSI(
          values.pH,
          values.temperature,
          values.tds,
          values.calciumHardness,
          values.alkalinity
        );
        const rsiValue = RSI_from_LSI(lsiValue);
        const pHsValue = pHs(
          values.temperature,
          values.tds,
          values.calciumHardness,
          values.alkalinity
        );

        // LSI interpretation
        let lsiInterpretation: string;
        if (lsiValue > 0.1) lsiInterpretation = 'الماء له قابلية للترسيب';
        else if (lsiValue < -0.1) lsiInterpretation = 'الماء له قابلية للتآكل';
        else lsiInterpretation = 'الماء متوازن';
        
        // RSI interpretation
        let rsiInterpretation: string;
        if (rsiValue < 6.5) rsiInterpretation = 'الماء له قابلية للترسيب';
        else if (rsiValue > 7.5) rsiInterpretation = 'الماء له قابلية للتآكل';
        else rsiInterpretation = 'الماء متوازن';

        setResults({
          lsi: lsiValue,
          rsi: rsiValue,
          pHs: pHsValue,
          lsiInterpretation,
          rsiInterpretation
        });
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? 'خطأ في الحساب');
        setResults(null);
      }
    } else {
      setResults(null);
      setError(null);
    }
  }, [inputs]);

  const handleInputChange = (field: keyof typeof inputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const getInterpretationColor = (interpretation: string) => {
    if (interpretation.includes('ترسيب')) return theme.colors.error; // Red for scaling
    if (interpretation.includes('تآكل')) return '#ea580c'; // Orange for corrosion
    return theme.colors.success; // Green for balanced
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <View style={{ gap: 16 }}>
        {/* LSI Result */}
        <Card>
          <Text style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'right',
            marginBottom: 4,
          }}>
            مؤشر لانجليير (LSI)
          </Text>
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: theme.colors.primary,
            textAlign: 'right',
            marginBottom: 8,
          }}>
            {fmt(results.lsi)}
          </Text>
          <Card style={{
            backgroundColor: `${getInterpretationColor(results.lsiInterpretation)}20`,
            borderWidth: 1,
            borderColor: getInterpretationColor(results.lsiInterpretation),
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: getInterpretationColor(results.lsiInterpretation),
              textAlign: 'right',
            }}>
              {results.lsiInterpretation}
            </Text>
          </Card>
        </Card>

        {/* RSI Result */}
        <Card>
          <Text style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'right',
            marginBottom: 4,
          }}>
            مؤشر ريزنر (RSI)
          </Text>
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: theme.colors.primary,
            textAlign: 'right',
            marginBottom: 8,
          }}>
            {fmt(results.rsi)}
          </Text>
          <Card style={{
            backgroundColor: `${getInterpretationColor(results.rsiInterpretation)}20`,
            borderWidth: 1,
            borderColor: getInterpretationColor(results.rsiInterpretation),
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: getInterpretationColor(results.rsiInterpretation),
              textAlign: 'right',
            }}>
              {results.rsiInterpretation}
            </Text>
          </Card>
        </Card>

        {/* pHs Value */}
        <Card>
          <Text style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'right',
            marginBottom: 4,
          }}>
            pH التشبع (pHs)
          </Text>
          <Text style={{
            fontSize: 24,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'right',
          }}>
            {fmt(results.pHs)}
          </Text>
        </Card>
      </View>
    );
  };

  return (
    <BaseCalculator
      title="مؤشرا لانجليير وريزنر"
      subtitle="حساب قابلية الماء للترسيب أو التآكل (LSI & RSI)"
      error={error}
      results={renderResults()}
      formulaInfo={LSI_RSI_FORMULA_INFO}
      warningMessage="هذه النتائج تقديرية. يُنصح بإجراء تحاليل مختبرية للتأكد من دقة القياسات."
      favKey="/calculators/indices/lsi"
      favTitle="مؤشرا لانجليير وريزنر"
      favRoute="/calculators/indices/lsi"
      favGroup="مؤشرات المياه"
    >
      <Input
        label="قيمة الأس الهيدروجيني (pH)"
        value={inputs.pH}
        onChangeText={(value) => handleInputChange('pH', value)}
        placeholder="مثال: 7.8"
        helpText="القيمة النموذجية: 6.5 - 8.5"
        containerStyle={{ marginBottom: 16 }}
        keyboardType="numeric"
      />

      <Input
        label="درجة الحرارة (°C)"
        value={inputs.temperature}
        onChangeText={(value) => handleInputChange('temperature', value)}
        placeholder="مثال: 25"
        helpText="درجة حرارة الماء بالدرجة المئوية"
        containerStyle={{ marginBottom: 16 }}
        keyboardType="numeric"
      />

      <Input
        label="مجموع الأملاح الذائبة (mg/L)"
        value={inputs.tds}
        onChangeText={(value) => handleInputChange('tds', value)}
        placeholder="مثال: 500"
        helpText="TDS أو الناقلية المحولة إلى TDS"
        containerStyle={{ marginBottom: 16 }}
        keyboardType="numeric"
      />

      <Input
        label="عسر الكالسيوم (mg/L as CaCO₃)"
        value={inputs.calciumHardness}
        onChangeText={(value) => handleInputChange('calciumHardness', value)}
        placeholder="مثال: 120"
        helpText="تركيز الكالسيوم معبراً عنه بكربونات الكالسيوم"
        containerStyle={{ marginBottom: 16 }}
        keyboardType="numeric"
      />

      <Input
        label="القلوية الكلية (mg/L as CaCO₃)"
        value={inputs.alkalinity}
        onChangeText={(value) => handleInputChange('alkalinity', value)}
        placeholder="مثال: 100"
        helpText="القلوية الكلية معبراً عنها بكربونات الكالسيوم"
        keyboardType="numeric"
      />
    </BaseCalculator>
  );
}

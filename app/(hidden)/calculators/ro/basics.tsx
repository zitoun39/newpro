import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { BaseCalculator } from '@/src/components/calculators/BaseCalculator';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/contexts/ThemeContext';
import { recoveryPct, flux_LMH, SEC_kWh_per_m3, saltRejectionPct } from '@/src/utils/ro';
import { fmt } from '@/src/utils/format';
import { toNum } from '@/src/utils/validation';

const RO_BASICS_FORMULA_INFO = {
  title: 'أساسيات RO (التناضح العكسي)',
  formula: `المعادلات الأساسية:

1. Recovery (%) = (Qp / Qf) × 100
2. Salt Rejection (%) = (1 - Cp/Cf) × 100
3. Flux (LMH) = (Qp × 1000) / Area
4. SEC (kWh/m³) = P(kW) / Qp(m³/h)

حيث:
• Qf = تدفق التغذية (m³/h)
• Qp = تدفق النفاذ (m³/h)  
• Cf = TDS التغذية (mg/L)
• Cp = TDS النفاذ (mg/L)
• Area = مساحة الغشاء (m²)
• P = قدرة المضخة (kW)
• LMH = Liters per square Meter per Hour
• SEC = Specific Energy Consumption

القيم النموذجية:
• Recovery: 75-85% (أغشية بحرية)
• Salt Rejection: 99.0-99.7%
• Flux: 15-25 LMH (مياه البحر)
• SEC: 2.5-4.5 kWh/m³`
};

export default function ROBasicsCalculator() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    Qf: '20',      // m3/h
    Qp: '15',      // m3/h
    Area: '200',   // m2
    PkW: '30',     // kW
    Cf: '35000',   // mg/L
    Cp: '350'      // mg/L
  });
  const [results, setResults] = useState<{
    R: number;
    J: number;
    SEC: number;
    Rej: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    const { Qf, Qp, Area, PkW, Cf, Cp } = formData;
    const values = {
      Qf: toNum(Qf),
      Qp: toNum(Qp),
      Area: toNum(Area),
      PkW: toNum(PkW),
      Cf: toNum(Cf),
      Cp: toNum(Cp)
    };

    if (Object.values(values).every(v => v > 0)) {
      try {
        const R = recoveryPct(values.Qp, values.Qf);
        const J = flux_LMH(values.Qp, values.Area);
        const SEC = SEC_kWh_per_m3(values.PkW, values.Qp);
        const Rej = saltRejectionPct(values.Cp, values.Cf);
        setResults({ R, J, SEC, Rej });
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
      title="أساسيات RO (التناضح العكسي)"
      subtitle="حساب Recovery, Flux, SEC, Salt Rejection"
      isCalculating={false}
      error={error}
      formulaInfo={RO_BASICS_FORMULA_INFO}
      favKey="/calculators/ro/basics"
      favTitle="أساسيات التناضح العكسي"
      favRoute="/calculators/ro/basics"
      favGroup="التناضح العكسي"
    >
      {/* Feed Flow Input */}
      <Input
        label="تدفق التغذية (m³/h)"
        value={formData.Qf}
        onChangeText={(value) => handleInputChange('Qf', value)}
        placeholder="20"
        keyboardType="numeric"
        helpText="معدل تدفق المياه الداخلة للنظام"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Permeate Flow Input */}
      <Input
        label="تدفق النفاذ (m³/h)"
        value={formData.Qp}
        onChangeText={(value) => handleInputChange('Qp', value)}
        placeholder="15"
        keyboardType="numeric"
        helpText="معدل تدفق المياه المنتجة النقية"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Membrane Area Input */}
      <Input
        label="مساحة الغشاء (m²)"
        value={formData.Area}
        onChangeText={(value) => handleInputChange('Area', value)}
        placeholder="200"
        keyboardType="numeric"
        helpText="المساحة الفعالة لأغشية RO"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Power Input */}
      <Input
        label="قدرة المضخة (kW)"
        value={formData.PkW}
        onChangeText={(value) => handleInputChange('PkW', value)}
        placeholder="30"
        keyboardType="numeric"
        helpText="القدرة الكهربائية المستهلكة"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Feed TDS Input */}
      <Input
        label="TDS التغذية (mg/L)"
        value={formData.Cf}
        onChangeText={(value) => handleInputChange('Cf', value)}
        placeholder="35000"
        keyboardType="numeric"
        helpText="تركيز الأملاح في مياه التغذية"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Permeate TDS Input */}
      <Input
        label="TDS النفاذ (mg/L)"
        value={formData.Cp}
        onChangeText={(value) => handleInputChange('Cp', value)}
        placeholder="350"
        keyboardType="numeric"
        helpText="تركيز الأملاح في المياه المنتجة"
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
              معدل الاستخلاص (Recovery)
            </Text>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.success || theme.colors.primary,
            }}>
              {fmt(results.R)}%
            </Text>
          </View>

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
              رفض الأملاح (Salt Rejection)
            </Text>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.success || theme.colors.primary,
            }}>
              {fmt(results.Rej)}%
            </Text>
          </View>

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
              التدفق النوعي (Flux)
            </Text>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.primary,
            }}>
              {fmt(results.J)} LMH
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
              استهلاك الطاقة النوعي (SEC)
            </Text>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.colors.warning || theme.colors.primary,
            }}>
              {fmt(results.SEC)} kWh/m³
            </Text>
          </View>
        </Card>
      )}

      {/* Performance Assessment */}
      {results && (
        <Card style={{ 
          backgroundColor: theme.colors.info + '20',
          borderColor: theme.colors.info + '40',
          marginTop: 16 
        }}>
          <Text style={[{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'right',
            marginBottom: 8,
          }]}>
            📊 تقييم الأداء:
          </Text>
          <Text style={[{
            fontSize: 12,
            color: theme.colors.textSecondary,
            textAlign: 'right',
            lineHeight: 18,
          }]}>
            • Recovery {results.R > 80 ? '✓ ممتاز' : results.R > 70 ? '⚡ جيد' : '⚠️ منخفض'}: {results.R.toFixed(1)}%{"\n"}
            • Salt Rejection {results.Rej > 99 ? '✓ ممتاز' : results.Rej > 97 ? '⚡ جيد' : '⚠️ ضعيف'}: {results.Rej.toFixed(2)}%{"\n"}
            • Flux {results.J > 20 && results.J < 30 ? '✓ مثالي' : results.J > 15 ? '⚡ مقبول' : '⚠️ منخفض'}: {results.J.toFixed(1)} LMH{"\n"}
            • SEC {results.SEC < 4 ? '✓ اقتصادي' : results.SEC < 6 ? '⚡ مقبول' : '⚠️ مرتفع'}: {results.SEC.toFixed(2)} kWh/m³
          </Text>
        </Card>
      )}
    </BaseCalculator>
  );
}

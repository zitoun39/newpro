import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { BaseCalculator } from '@/src/components/calculators/BaseCalculator';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/contexts/ThemeContext';
import { hazenWilliamsHeadLoss, minorLossesHead, totalDynamicHead } from '@/src/utils/engineering';
import { fmt } from '@/src/utils/format';
import { toNum } from '@/src/utils/validation';

const TDH_FORMULA_INFO = {
  title: 'الرفع الديناميكي الكلي (TDH)',
  formula: `TDH = Static Head + Friction Losses + Minor Losses

فواقد الاحتكاك (Hazen-Williams):
hf = 10.67 × L × Q^1.852 / (C^1.852 × D^4.87)

الفواقد الموضعية:
hm = ΣK × v² / (2g)

حيث:
• L: الطول المكافئ (m)
• Q: التدفق (m³/s)
• C: معامل Hazen-Williams
• D: القطر الداخلي (m)
• K: معاملات الفواقد الموضعية
• v: السرعة (m/s)
• g: تسارع الجاذبية (9.81 m/s²)

المرجع: Crane TP-410 (صيغة HW شائعة بالـ SI)`
};

export default function TDHCalculator() {
  const { theme } = useTheme();
  const [inputs, setInputs] = useState({
    staticHead: '15',
    flowRate: '60',
    diameter: '150',
    length: '120',
    hwCoefficient: '130',
    sumK: '2.5'
  });
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { staticHead, flowRate, diameter, length, hwCoefficient, sumK } = inputs;
    const values = {
      staticHead: toNum(staticHead),
      Q: toNum(flowRate),
      D: toNum(diameter),
      L: toNum(length),
      C: toNum(hwCoefficient),
      sumK: toNum(sumK)
    };

    if (Object.values(values).every(v => v > 0)) {
      try {
        const hf = hazenWilliamsHeadLoss(values.C, values.Q, values.D, values.L);
        const hm = minorLossesHead(values.sumK, values.Q, values.D);
        const tdh = totalDynamicHead({
          staticHead_m: values.staticHead,
          frictionHead_m: hf,
          minorHead_m: hm,
          includeVelocityHead: false
        });
        
        setResults({ hf, hm, tdh });
        setError(null);
      } catch (e: any) {
        setError(e.message);
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

  return (
    <BaseCalculator
      title="الرفع الديناميكي الكلي (TDH)"
      subtitle="حساب TDH باستخدام Hazen–Williams والفواقد الموضعية"
      isCalculating={false}
      error={error}
      formulaInfo={TDH_FORMULA_INFO}
      favKey="/calculators/pumps/tdh"
      favTitle="حاسبة الرفع الديناميكي"
      favRoute="/calculators/pumps/tdh"
      favGroup="المضخات"
    >
      {/* Static Head Input */}
      <Input
        label="الرفع الساكن (m)"
        value={inputs.staticHead}
        onChangeText={(value) => handleInputChange('staticHead', value)}
        placeholder="مثال: 15"
        keyboardType="numeric"
        helpText="الفرق في الارتفاع بين نقطتي الشفط والطرد"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Flow Rate Input */}
      <Input
        label="التدفق (m³/h)"
        value={inputs.flowRate}
        onChangeText={(value) => handleInputChange('flowRate', value)}
        placeholder="مثال: 60"
        keyboardType="numeric"
        helpText="معدل التدفق المطلوب للمضخة"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Diameter Input */}
      <Input
        label="قطر الأنبوب (mm)"
        value={inputs.diameter}
        onChangeText={(value) => handleInputChange('diameter', value)}
        placeholder="مثال: 150"
        keyboardType="numeric"
        helpText="القطر الداخلي لأنبوب الطرد"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Length Input */}
      <Input
        label="الطول المكافئ (m)"
        value={inputs.length}
        onChangeText={(value) => handleInputChange('length', value)}
        placeholder="مثال: 120"
        keyboardType="numeric"
        helpText="الطول الكلي مع الطول المكافئ للتركيبات"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Hazen-Williams Coefficient Input */}
      <Input
        label="معامل Hazen-Williams (C)"
        value={inputs.hwCoefficient}
        onChangeText={(value) => handleInputChange('hwCoefficient', value)}
        placeholder="مثال: 130"
        keyboardType="numeric"
        helpText="معامل خشونة الأنبوب (100-150 للأنابيب المعدنية)"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Sum K Input */}
      <Input
        label="مجموع معاملات الفواقد (ΣK)"
        value={inputs.sumK}
        onChangeText={(value) => handleInputChange('sumK', value)}
        placeholder="مثال: 2.5"
        keyboardType="numeric"
        helpText="مجموع معاملات الفواقد للصمامات والتركيبات"
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
              الرفع الساكن
            </Text>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.colors.text,
            }}>
              {fmt(toNum(inputs.staticHead) || 0)} m
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
              فواقد الاحتكاك
            </Text>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.colors.text,
            }}>
              {fmt(results.hf)} m
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
              الفواقد الموضعية
            </Text>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.colors.text,
            }}>
              {fmt(results.hm)} m
            </Text>
          </View>

          <View style={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            backgroundColor: theme.colors.primary + '20',
            borderRadius: theme.radius.md,
            marginTop: 8,
            paddingHorizontal: 12,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.colors.primary,
              flex: 1,
            }}>
              TDH الكلي
            </Text>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.primary,
            }}>
              {fmt(results.tdh)} m
            </Text>
          </View>
        </Card>
      )}

      {/* Engineering Notes */}
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
          ⚠️ ملاحظات هندسية:
        </Text>
        <Text style={[{
          fontSize: 12,
          color: theme.colors.warningText,
          textAlign: 'right',
          lineHeight: 18,
        }]}>
          • هذا الحساب يستخدم معادلة Hazen-Williams للفواقد.{"\n"}
          • راع الظروف الفعلية للتشغيل (درجة الحرارة، اللزوجة).{"\n"}
          • أضف هامش أمان 10-20% لاختيار المضخة.{"\n"}
          • تحقق من منحنى المضخة للتأكد من نقطة التشغيل.
        </Text>
      </Card>
    </BaseCalculator>
  );
}

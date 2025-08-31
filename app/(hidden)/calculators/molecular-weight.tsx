import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { BaseCalculator } from '@/src/components/calculators/BaseCalculator';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/contexts/ThemeContext';
import { fmt } from '@/src/utils/format';

// Atomic weights map for molecular weight calculation
const atomicWeights: { [key: string]: number } = {
  H: 1.008, He: 4.003, Li: 6.94, Be: 9.012, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974,
  S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867,
  V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546,
  Zn: 65.38, Ga: 69.723, Ge: 72.630, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798,
  Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224, Nb: 92.906, Mo: 95.95, Tc: 98,
  Ru: 101.07, Rh: 102.906, Pd: 106.42, Ag: 107.868, Cd: 112.411, In: 114.818,
  Sn: 118.710, Sb: 121.760, Te: 127.60, I: 126.904, Xe: 131.293, Cs: 132.905,
  Ba: 137.327, La: 138.905, Ce: 140.116, Pr: 140.908, Nd: 144.242, Pm: 145,
  Sm: 150.36, Eu: 151.964, Gd: 157.25, Tb: 158.925, Dy: 162.500, Ho: 164.930,
  Er: 167.259, Tm: 168.934, Yb: 173.045, Lu: 174.967, Hf: 178.49, Ta: 180.948,
  W: 183.84, Re: 186.207, Os: 190.23, Ir: 192.217, Pt: 195.084, Au: 196.967,
  Hg: 200.592, Tl: 204.38, Pb: 207.2, Bi: 208.980
};

const calculateMolecularWeight = (formula: string): number => {
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;
  let totalWeight = 0;
  let hasValidElements = false;

  while ((match = regex.exec(formula)) !== null) {
    const element = match[1];
    const count = match[2] ? parseInt(match[2]) : 1;

    if (atomicWeights[element]) {
      totalWeight += atomicWeights[element] * count;
      hasValidElements = true;
    } else {
      throw new Error(`عنصر غير معروف: ${element}`);
    }
  }

  if (!hasValidElements) {
    throw new Error('صيغة كيميائية غير صحيحة');
  }

  return totalWeight;
};

const MW_FORMULA_INFO = {
  title: 'حاسبة الوزن الجزيئي',
  formula: `حساب الوزن الجزيئي (MW) للمركبات الكيميائية:

MW = Σ (nᵢ × AWᵢ)

حيث:
• MW = الوزن الجزيئي (g/mol)
• nᵢ = عدد ذرات العنصر i
• AWᵢ = الوزن الذري للعنصر i

طريقة الاستخدام:
• اكتب الصيغة الكيميائية (مثال: H2O, CaCO3)
• استخدم رموز العناصر الصحيحة
• أضف الأرقام بعد رمز العنصر

أمثلة شائعة:
• H2O = 18.015 g/mol (الماء)
• NaCl = 58.44 g/mol (كلوريد الصوديوم)
• CaCO3 = 100.087 g/mol (كربونات الكالسيوم)
• H2SO4 = 98.074 g/mol (حمض الكبريتيك)
• C6H12O6 = 180.156 g/mol (الجلوكوز)

التطبيقات:
• حساب تراكيز المحاليل
• تحضير المحاليل القياسية
• حساب الجرعات الكيميائية
• تحاليل جودة المياه`
};

export default function MolecularWeightCalculator() {
  const { theme } = useTheme();
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate when formula changes
  useEffect(() => {
    if (formula.trim()) {
      try {
        const mw = calculateMolecularWeight(formula.trim());
        setResult(mw);
        setError(null);
      } catch (e: any) {
        setError(e.message || 'خطأ في تحليل الصيغة الكيميائية');
        setResult(null);
      }
    } else {
      setResult(null);
      setError(null);
    }
  }, [formula]);

  const commonCompounds = [
    { formula: 'H2O', name: 'الماء', mw: 18.015 },
    { formula: 'NaCl', name: 'كلوريد الصوديوم', mw: 58.44 },
    { formula: 'CaCO3', name: 'كربونات الكالسيوم', mw: 100.087 },
    { formula: 'H2SO4', name: 'حمض الكبريتيك', mw: 98.074 },
    { formula: 'C6H12O6', name: 'الجلوكوز', mw: 180.156 },
    { formula: 'CaCl2', name: 'كلوريد الكالسيوم', mw: 110.98 },
  ];

  return (
    <BaseCalculator
      title="حاسبة الوزن الجزيئي"
      subtitle="حساب الوزن الجزيئي للمركبات الكيميائية"
      isCalculating={false}
      error={error}
      formulaInfo={MW_FORMULA_INFO}
      favKey="/calculators/molecular-weight"
      favTitle="حاسبة الوزن الجزيئي"
      favRoute="/calculators/molecular-weight"
      favGroup="أنظمة عامة"
    >
      {/* Formula Input */}
      <Input
        label="الصيغة الكيميائية"
        value={formula}
        onChangeText={setFormula}
        placeholder="H2SO4, CaCO3, C6H12O6"
        autoCapitalize="characters"
        helpText="أدخل الصيغة باستخدام رموز العناصر والأرقام"
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Results */}
      {result !== null && (
        <Card variant="elevated" style={{ marginTop: 8 }}>
          <Text style={[{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'right',
            marginBottom: 12,
          }]}>
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
              الوزن الجزيئي
            </Text>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.primary,
            }}>
              {fmt(result)} g/mol
            </Text>
          </View>
        </Card>
      )}

      {/* Common Compounds */}
      <View style={{ marginTop: 16 }}>
        <Text style={[{
          fontSize: 14,
          fontWeight: '600',
          color: theme.colors.textSecondary,
          textAlign: 'right',
          marginBottom: 8,
        }]}>
          مركبات شائعة:
        </Text>
        <View style={{ flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' }}>
          {commonCompounds.map((compound) => (
            <Card
              key={compound.formula}
              style={{
                padding: 8,
                backgroundColor: formula === compound.formula 
                  ? theme.colors.primary + '20' 
                  : theme.colors.surfaceVariant,
                borderWidth: 1,
                borderColor: formula === compound.formula 
                  ? theme.colors.primary 
                  : theme.colors.border,
                minWidth: 80,
              }}
              onPress={() => setFormula(compound.formula)}
            >
              <Text style={{
                color: formula === compound.formula 
                  ? theme.colors.primary 
                  : theme.colors.text,
                fontSize: 14,
                textAlign: 'center',
                fontWeight: 'bold',
              }}>
                {compound.formula}
              </Text>
              <Text style={{
                color: theme.colors.textSecondary,
                fontSize: 10,
                textAlign: 'center',
                marginTop: 2,
              }}>
                {compound.mw} g/mol
              </Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Examples Table */}
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
          📊 أمثلة تفصيلية:
        </Text>
        {commonCompounds.map((compound, index) => (
          <View key={index} style={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 6,
            borderBottomWidth: index < commonCompounds.length - 1 ? 1 : 0,
            borderBottomColor: theme.colors.border + '50',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: theme.colors.text,
                textAlign: 'right',
              }}>
                {compound.formula}
              </Text>
              <Text style={{
                fontSize: 12,
                color: theme.colors.textSecondary,
                textAlign: 'right',
              }}>
                {compound.name}
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: theme.colors.primary,
            }}>
              {compound.mw} g/mol
            </Text>
          </View>
        ))}
      </Card>
    </BaseCalculator>
  );
}
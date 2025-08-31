﻿import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { BaseCalculator } from '@/src/components/calculators/BaseCalculator';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/contexts/ThemeContext';
import { m3h_to_Ls, Ls_to_m3h, m3h_to_gpm, gpm_to_m3h } from '@/src/utils/conversions';
import { fmt } from '@/src/utils/format';
import { toNum } from '@/src/utils/validation';

type FlowUnit = 'm3h' | 'Ls' | 'gpm';

interface FlowValues {
  m3h: number;
  Ls: number;
  gpm: number;
}

const FLOW_FORMULA_INFO = {
  title: 'محول وحدات التدفق',
  formula: `معاملات التحويل:

• 1 m³/h = 0.278 L/s
• 1 L/s = 3.6 m³/h
• 1 GPM = 0.227 m³/h
• 1 GPM = 0.063 L/s
• 1 m³/h = 4.4 GPM
• 1 L/s = 15.85 GPM

وحدات التدفق الشائعة:
• m³/h: متر مكعب في الساعة
• L/s: لتر في الثانية  
• GPM: جالون في الدقيقة (أمريكي)

الاستخدامات:
• تصميم أنظمة الضخ
• حسابات الأنابيب
• معدات المعالجة
• أنظمة التبريد والتكييف`
};

export default function FlowConverter() {
  const { theme } = useTheme();
  const [inputs, setInputs] = useState({
    m3h: '10',
    Ls: '',
    gpm: ''
  });
  const [results, setResults] = useState<FlowValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeInput, setActiveInput] = useState<FlowUnit>('m3h');

  // Auto-calculate when inputs change
  useEffect(() => {
    const { m3h, Ls, gpm } = inputs;
    let calculatedValues: FlowValues | null = null;
    
    try {
      if (activeInput === 'm3h' && m3h) {
        const value = toNum(m3h);
        if (value > 0) {
          calculatedValues = {
            m3h: value,
            Ls: m3h_to_Ls(value),
            gpm: m3h_to_gpm(value)
          };
        }
      } else if (activeInput === 'Ls' && Ls) {
        const value = toNum(Ls);
        if (value > 0) {
          calculatedValues = {
            m3h: Ls_to_m3h(value),
            Ls: value,
            gpm: m3h_to_gpm(Ls_to_m3h(value))
          };
        }
      } else if (activeInput === 'gpm' && gpm) {
        const value = toNum(gpm);
        if (value > 0) {
          const m3hValue = gpm_to_m3h(value);
          calculatedValues = {
            m3h: m3hValue,
            Ls: m3h_to_Ls(m3hValue),
            gpm: value
          };
        }
      }
      
      setResults(calculatedValues);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'خطأ في الحساب');
      setResults(null);
    }
  }, [inputs, activeInput]);

  const handleInputChange = (unit: FlowUnit, value: string) => {
    // Clear other inputs when user starts typing in a new field
    if (unit !== activeInput) {
      setInputs({
        m3h: unit === 'm3h' ? value : '',
        Ls: unit === 'Ls' ? value : '',
        gpm: unit === 'gpm' ? value : ''
      });
      setActiveInput(unit);
    } else {
      setInputs(prev => ({ ...prev, [unit]: value }));
    }
    setError(null);
  };

  return (
    <BaseCalculator
      title="محول وحدات التدفق"
      subtitle="تحويل سريع بين m³/h و L/s و GPM"
      isCalculating={false}
      error={error}
      formulaInfo={FLOW_FORMULA_INFO}
      favKey="/calculators/conversions/flow"
      favTitle="محول وحدات التدفق"
      favRoute="/calculators/conversions/flow"
      favGroup="تحويلات"
    >
      {/* Instructions */}
      <Card style={{ 
        backgroundColor: theme.colors.info + '20',
        borderColor: theme.colors.info + '40',
        marginBottom: 16 
      }}>
        <Text style={[{
          fontSize: 14,
          color: theme.colors.text,
          textAlign: 'right',
          lineHeight: 20,
        }]}>
          💡 أدخل قيمة واحدة وسيتم تحويل الباقي تلقائياً
        </Text>
      </Card>

      {/* m³/h Input */}
      <Input
        label="متر مكعب في الساعة (m³/h)"
        value={inputs.m3h}
        onChangeText={(value) => handleInputChange('m3h', value)}
        placeholder="مثال: 10"
        keyboardType="numeric"
        helpText="وحدة شائعة في أنظمة المعالجة والضخ"
        containerStyle={{ 
          marginBottom: 16,
          backgroundColor: activeInput === 'm3h' ? theme.colors.primary + '10' : undefined
        }}
      />

      {/* L/s Input */}
      <Input
        label="لتر في الثانية (L/s)"
        value={inputs.Ls}
        onChangeText={(value) => handleInputChange('Ls', value)}
        placeholder="مثال: 2.78"
        keyboardType="numeric"
        helpText="وحدة مفيدة للحسابات السريعة"
        containerStyle={{ 
          marginBottom: 16,
          backgroundColor: activeInput === 'Ls' ? theme.colors.primary + '10' : undefined
        }}
      />

      {/* GPM Input */}
      <Input
        label="جالون في الدقيقة (GPM)"
        value={inputs.gpm}
        onChangeText={(value) => handleInputChange('gpm', value)}
        placeholder="مثال: 44"
        keyboardType="numeric"
        helpText="الوحدة الأمريكية القياسية"
        containerStyle={{ 
          marginBottom: 16,
          backgroundColor: activeInput === 'gpm' ? theme.colors.primary + '10' : undefined
        }}
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
            نتائج التحويل
          </Text>
          
          <View style={{ gap: 8 }}>
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
                m³/h (متر مكعب/ساعة)
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.colors.primary,
              }}>
                {fmt(results.m3h)}
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
                L/s (لتر/ثانية)
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.colors.primary,
              }}>
                {fmt(results.Ls)}
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
                GPM (جالون/دقيقة)
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.colors.primary,
              }}>
                {fmt(results.gpm)}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Common Examples */}
      <Card style={{ 
        backgroundColor: theme.colors.warning + '20',
        borderColor: theme.colors.warning + '40',
        marginTop: 16 
      }}>
        <Text style={[{
          fontSize: 14,
          fontWeight: '600',
          color: theme.colors.text,
          textAlign: 'right',
          marginBottom: 8,
        }]}>
          📊 أمثلة شائعة:
        </Text>
        <Text style={[{
          fontSize: 12,
          color: theme.colors.textSecondary,
          textAlign: 'right',
          lineHeight: 18,
        }]}>
          • مضخة منزلية: 2 m³/h = 0.56 L/s = 8.8 GPM{"\n"}
          • مضخة حريق: 500 m³/h = 139 L/s = 2200 GPM{"\n"}
          • مضخة صناعية: 100 m³/h = 28 L/s = 440 GPM{"\n"}
          • نظام ري: 50 m³/h = 14 L/s = 220 GPM
        </Text>
      </Card>
    </BaseCalculator>
  );
}



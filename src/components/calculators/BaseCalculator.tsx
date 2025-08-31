import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { Info, AlertTriangle } from 'lucide-react-native';
import { Screen } from '../ui/Screen';
import { Button } from '../ui/Button';
import { LoadingIndicator } from '../ui/LoadingIndicator';
import { Card } from '../ui/Card';
import { FavoriteButton } from '../ui/FavoriteButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { FavoriteItem } from '@/src/stores/favoritesStore';

interface BaseCalculatorProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  results?: React.ReactNode;
  isCalculating?: boolean;
  error?: string | null;
  onShowInfo?: () => void;
  formulaInfo?: {
    title: string;
    formula: string;
  };
  warningMessage?: string;
  // Favorite functionality props
  favKey?: string;
  favTitle?: string;
  favRoute?: string;
  favGroup?: string;
}

export const BaseCalculator: React.FC<BaseCalculatorProps> = ({
  title,
  subtitle,
  children,
  results,
  isCalculating = false,
  error,
  onShowInfo,
  formulaInfo,
  warningMessage,
  favKey,
  favTitle,
  favRoute,
  favGroup,
}) => {
  const { theme } = useTheme();

  const handleShowInfo = () => {
    if (onShowInfo) {
      onShowInfo();
    } else if (formulaInfo) {
      router.push({
        pathname: '/info-modal',
        params: {
          title: formulaInfo.title,
          formula: formulaInfo.formula,
        },
      });
    }
  };

  // Create favorite item if all required props are provided
  const favoriteItem = React.useMemo(() => {
    if (!favKey || !favTitle || !favRoute) return null;
    
    return {
      key: favKey,
      title: favTitle,
      route: favRoute,
      group: favGroup,
    };
  }, [favKey, favTitle, favRoute, favGroup]);

  return (
    <Screen scrollable safeArea contentContainerStyle={{ paddingTop: 24 }}>
      {/* Calculator Title Section - More Prominent */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        
        <View style={styles.headerActions}>
          {favoriteItem && (
            <FavoriteButton
              variant="icon"
              item={favoriteItem}
              size={22}
            />
          )}
          
          {(onShowInfo || formulaInfo) && (
            <Button
              title=""
              onPress={handleShowInfo}
              variant="ghost"
              size="sm"
              icon={<Info color={theme.colors.primary} size={22} />}
              accessibilityLabel="عرض معلومات الصيغة"
              style={{
                ...styles.infoButton,
                backgroundColor: `${theme.colors.primary}20`,
              } as ViewStyle}
            />
          )}
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <Card 
          variant="outline" 
          style={{
            ...styles.errorCard,
            borderColor: theme.colors.error,
          } as ViewStyle}
        >
          <View style={styles.errorContent}>
            <AlertTriangle color={theme.colors.error} size={20} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          </View>
        </Card>
      )}

      {/* Inputs Section */}
      <Card variant="elevated" style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          المدخلات
        </Text>
        {children}
      </Card>

      {/* Loading State */}
      {isCalculating && (
        <LoadingIndicator
          message="جاري الحساب..."
          style={styles.section}
        />
      )}

      {/* Results Section */}
      {results && !isCalculating && (
        <Card variant="elevated" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            النتائج
          </Text>
          {results}
        </Card>
      )}

      {/* Warning Message */}
      {warningMessage && (
        <Card 
          style={{
            ...styles.warningCard,
            backgroundColor: `${theme.colors.warning}20`,
          } as ViewStyle}
        >
          <View style={styles.warningHeader}>
            <AlertTriangle color={theme.colors.warning} size={20} />
            <Text style={[styles.warningTitle, { color: theme.colors.warning }]}>
              تنبيه مهم
            </Text>
          </View>
          <Text style={[styles.warningText, { color: theme.colors.warning }]}>
            {warningMessage}
          </Text>
        </Card>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'right',
  },
  infoButton: {
    padding: 8,
    borderRadius: 12,
    marginLeft: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 16,
  },
  errorCard: {
    marginBottom: 16,
  },
  errorContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  warningCard: {
    marginTop: 8,
  },
  warningHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    textAlign: 'right',
    lineHeight: 20,
  },
});
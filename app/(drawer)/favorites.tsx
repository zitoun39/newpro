import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { FavoriteButton } from '@/src/components/ui/FavoriteButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useFavoritesStore, FavoriteItem } from '@/src/stores/favoritesStore';

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const { hasHydrated, error, clear } = useFavoritesStore();
  const favorites = useFavoritesStore((s) => s.list());

  // Loading state while hydrating from AsyncStorage
  if (!hasHydrated) {
    return (
      <Screen safeArea>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: theme.colors.text,
              textAlign: 'right',
            }}
          >
            الحاسبات المفضّلة
          </Text>
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: theme.colors.textSecondary,
              textAlign: 'center',
            }}
          >
            جاري تحميل المفضّلة...
          </Text>
        </View>
      </Screen>
    );
  }

  const handlePress = (item: FavoriteItem) => {
    try {
      router.push(item.route as any);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في فتح الحاسبة');
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'مسح جميع المفضّلة',
      'هل أنت متأكد من رغبتك في مسح جميع الحاسبات المفضّلة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'مسح الكل', 
          style: 'destructive',
          onPress: () => clear()
        }
      ]
    );
  };

  const renderHeader = () => (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
    >
      <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: theme.colors.text,
              textAlign: 'right',
            }}
          >
            الحاسبات المفضّلة
          </Text>
          {favorites.length > 0 && (
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                textAlign: 'right',
                marginTop: 4,
              }}
            >
              {favorites.length} حاسبة مفضّلة
            </Text>
          )}
        </View>
        
        {favorites.length > 0 && (
          <Button
            title="مسح الكل"
            variant="ghost"
            size="sm"
            onPress={handleClearAll}
            style={{
              backgroundColor: theme.colors.error + '20',
              borderColor: theme.colors.error + '40',
            }}
            textStyle={{ color: theme.colors.error }}
          />
        )}
      </View>
      
      {/* Error Display */}
      {error && (
        <Card 
          style={{
            marginTop: 12,
            backgroundColor: theme.colors.error + '20',
            borderColor: theme.colors.error + '40',
          }}
        >
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
            <Feather name="alert-triangle" size={16} color={theme.colors.error} />
            <Text style={{ color: theme.colors.error, fontSize: 14, flex: 1, textAlign: 'right' }}>
              {error}
            </Text>
          </View>
        </Card>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 }}>
      <Feather name="star" size={48} color={theme.colors.textSecondary} style={{ marginBottom: 16 }} />
      <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, textAlign: 'center', marginBottom: 8 }}>
        لا توجد عناصر مفضلة بعد
      </Text>
      <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
        اضغط على أيقونة النجمة في أي حاسبة{'\n'}لإضافتها إلى المفضّلة
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <Card variant="outline" style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}>
      <TouchableOpacity
        onPress={() => handlePress(item)}
        style={{ flexDirection: 'row-reverse', alignItems: 'center', padding: 4 }}
        activeOpacity={0.7}
      >
        {/* النصوص */}
        <View style={{ flex: 1, marginEnd: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
              textAlign: 'right',
              marginBottom: 4,
            }}
          >
            {item.title}
          </Text>
          {!!item.group && (
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary, textAlign: 'right' }}>
              {item.group}
            </Text>
          )}
        </View>

        {/* أزرار */}
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
          <FavoriteButton variant="icon" item={item} size={20} />
          <Feather name="chevron-left" size={20} color={theme.colors.textSecondary} style={{ marginEnd: 8 }} />
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <Screen safeArea>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.key || item.route}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ 
          padding: 16, 
          paddingBottom: 32,
          flexGrow: 1
        }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </Screen>
  );
}
// src/stores/favoritesStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteItem {
  key: string;
  title: string;
  route: string;
  group?: string;
  addedAt: number;
}

interface FavoritesState {
  favorites: Record<string, FavoriteItem>;
  hasHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  isFav: (key: string) => boolean;
  toggle: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  remove: (key: string) => void;
  clear: () => void;
  list: () => FavoriteItem[];
  setHydrated: (hydrated: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: {},
      hasHydrated: false,
      isLoading: false,
      error: null,
      
      isFav: (key: string) => {
        if (!key || !get().hasHydrated) return false;
        return key in get().favorites;
      },
      
      toggle: (item: Omit<FavoriteItem, 'addedAt'>) => {
        try {
          if (!item.key || !get().hasHydrated) {
            console.warn('FavoritesStore: Cannot toggle - not hydrated or missing key');
            return;
          }

          const { favorites } = get();
          const { key } = item;
          
          if (key in favorites) {
            // Remove from favorites
            const newFavorites = { ...favorites };
            delete newFavorites[key];
            set({ favorites: newFavorites, error: null });
            console.log('Removed favorite:', key);
          } else {
            // Add to favorites
            const newFavorite: FavoriteItem = {
              ...item,
              addedAt: Date.now(),
            };
            set({
              favorites: {
                ...favorites,
                [key]: newFavorite,
              },
              error: null
            });
            console.log('Added favorite:', key);
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
          get().setError('فشل في تحديث المفضّلة');
        }
      },
      
      remove: (key: string) => {
        try {
          if (!key) return;
          
          const { favorites } = get();
          if (key in favorites) {
            const newFavorites = { ...favorites };
            delete newFavorites[key];
            set({ favorites: newFavorites, error: null });
          }
        } catch (error) {
          console.error('Error removing favorite:', error);
          get().setError('فشل في حذف المفضّلة');
        }
      },
      
      clear: () => {
        try {
          set({ favorites: {}, error: null });
          console.log('✅ Cleared all favorites');
        } catch (error) {
          console.error('Error clearing favorites:', error);
          get().setError('فشل في مسح المفضّلة');
        }
      },
      
      list: () => {
        try {
          if (!get().hasHydrated) {
            console.log('Store not hydrated yet, returning empty list');
            return [];
          }
          const { favorites } = get();
          const list = Object.values(favorites).sort((a, b) => b.addedAt - a.addedAt);
          console.log('Favorites list:', list.length, 'items');
          return list;
        } catch (error) {
          console.error('Error listing favorites:', error);
          return [];
        }
      },

      setHydrated: (hydrated: boolean) => {
        set({ hasHydrated: hydrated });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'hakoolab:favorites:v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to hydrate favorites store:', error);
          if (state) {
            state.hasHydrated = true;
            state.error = 'فشل في تحميل البيانات المحفوظة';
          }
        } else if (state) {
          // Validate and clean up data
          const cleanedFavorites: Record<string, FavoriteItem> = {};
          let removedCount = 0;
          
          if (state.favorites && typeof state.favorites === 'object') {
            Object.entries(state.favorites).forEach(([key, item]) => {
              // Validate required fields
              if (
                item && 
                typeof item === 'object' && 
                item.key && 
                item.title && 
                item.route &&
                typeof item.addedAt === 'number'
              ) {
                cleanedFavorites[key] = item as FavoriteItem;
              } else {
                removedCount++;
                console.warn('Removed invalid favorite item:', item);
              }
            });
          }
          
          state.favorites = cleanedFavorites;
          state.hasHydrated = true;
          state.error = null;
          
          const validCount = Object.keys(cleanedFavorites).length;
          console.log('✅ Favorites store hydrated successfully, favorites count:', validCount);
          if (removedCount > 0) {
            console.log('Cleaned up', removedCount, 'invalid favorites');
          }
        }
      },
      // Add version and migration handling
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...persistedState,
            hasHydrated: false,
            isLoading: false,
            error: null,
          };
        }
        return persistedState;
      },
    }
  )
);
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './',
          '@/contexts': './contexts',
          '@/src': './src',
          '@/src/utils': './src/utils',
          '@/src/components': './src/components',
          '@/src/hooks': './src/hooks',
          '@/src/stores': './src/stores',
          '@/src/theme': './src/theme',
          '@/src/types': './src/types',
          '@/src/config': './src/config',
          '@assets': './assets',
        },
      }],
      'react-native-reanimated/plugin',
    ],
  };
};

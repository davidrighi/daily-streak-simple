import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9cba5e6c70534ca28c2045fad97111d7',
  appName: 'daily-streak-simple',
  webDir: 'dist',
  server: {
    url: 'https://9cba5e6c-7053-4ca2-8c20-45fad97111d7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
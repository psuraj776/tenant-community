/**
 * Main App Component
 * Entry point for the React Native application
 */

import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';

import {store, useAppDispatch, useAppSelector} from './store';
import {Navigation} from './navigation';
import {loadAuthFromStorage} from '@modules/auth';
import {logger, setupGlobalErrorHandler} from '@services/logging';
import {validateConfig} from '@config';

// Setup global error handling
setupGlobalErrorHandler();

/**
 * App Content Component
 * Contains navigation and handles auth state
 */
function AppContent() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    // Validate configuration on startup
    try {
      validateConfig();
    } catch (error) {
      logger.error('Configuration validation failed', error as Error);
    }

    // Load auth from storage
    dispatch(loadAuthFromStorage())
      .finally(() => {
        setIsReady(true);
      });
  }, [dispatch]);

  if (!isReady) {
    // Could show a splash screen here
    return null;
  }

  return <Navigation isAuthenticated={isAuthenticated} />;
}

/**
 * Root App Component
 * Provides Redux store and other providers
 */
function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <Provider store={store}>
          <AppContent />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

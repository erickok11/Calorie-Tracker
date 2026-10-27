import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const subscribe = () => () => {};

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true,   // value on the client
    () => false,  // value during server rendering / hydration
  );

  const colorScheme = useRNColorScheme();
  return hasHydrated ? colorScheme : 'light';
}
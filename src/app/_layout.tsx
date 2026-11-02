import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useIsRestoring } from '@tanstack/react-query';
import {
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client';

import { persistOptions, queryClient } from '../lib/queryClient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ConexionProvider } from '../contexts/ConexionContext';
import { SesionProvider, useSesion } from '../contexts/SesionContext';
import SincronizacionAutomatica from '../components/SincronizacionAutomatica';

function informarErrorRestauracion() {
  // Si la restauración falla, la aplicación continúa con la caché vacía:
  // cada consulta intentará volver a obtener los datos cuando haya conexión.
  console.warn(
    'No se pudo restaurar la caché persistente de consultas de medidores.',
  );
}

function PantallaArranque() {
  return (
    <View style={styles.arranque}>
      <ActivityIndicator
        accessibilityLabel="Cargando aplicación"
        color={colors.marca}
      />
      <Text style={styles.arranqueTexto}>
        Restaurando datos y comprobando la sesión…
      </Text>
    </View>
  );
}

function NavegacionRaiz() {
  const { estado } = useSesion();
  const restaurandoCache = useIsRestoring();

  if (estado === 'cargando' || restaurandoCache) {
    return <PantallaArranque />;
  }

  const autenticado = estado === 'autenticado';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.fondo },
      }}
    >
      <Stack.Protected guard={autenticado}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!autenticado}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
      onError={informarErrorRestauracion}
    >
      <SesionProvider>
        <ConexionProvider>
          <SincronizacionAutomatica />
          <NavegacionRaiz />
        </ConexionProvider>
      </SesionProvider>
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create({
  arranque: {
    alignItems: 'center',
    backgroundColor: colors.fondo,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  arranqueTexto: {
    ...typography.body,
    color: colors.textoSecundario,
  },
});

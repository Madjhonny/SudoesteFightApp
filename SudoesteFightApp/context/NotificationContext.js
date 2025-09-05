import React, { createContext, useState, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext({});

// Esta é a "chave" que usaremos para guardar o dado no telemóvel.
const LAST_AVISO_TIMESTAMP_KEY = '@last_aviso_timestamp';

export const NotificationProvider = ({ children }) => {
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  // Usamos uma variável global para guardar o timestamp mais recente do servidor
  // para não precisarmos de o passar entre funções.
  let latestTimestampFromServer = null;

  /**
   * Compara o timestamp do aviso mais recente do servidor
   * com o último timestamp que o utilizador viu (guardado no telemóvel).
   */
  const checkForUpdates = useCallback(async (avisos) => {
    // Se não houver avisos, não há atualizações.
    if (!avisos || avisos.length === 0) {
      setHasNewUpdate(false);
      return;
    }
    
    // Pega o timestamp do primeiro aviso (o mais recente) e converte para número.
    latestTimestampFromServer = new Date(avisos[0].data_postagem).getTime();
    const lastSeenTimestamp = await AsyncStorage.getItem(LAST_AVISO_TIMESTAMP_KEY);

    // Se o utilizador nunca viu nenhum aviso, ou se o aviso do servidor é mais recente,
    // então há uma nova atualização.
    if (!lastSeenTimestamp || latestTimestampFromServer > parseInt(lastSeenTimestamp, 10)) {
      setHasNewUpdate(true);
    } else {
      setHasNewUpdate(false);
    }
  }, []);

  /**
   * Quando o utilizador visita a página de eventos, esta função é chamada
   * para guardar o timestamp do aviso mais recente como "o último visto".
   */
  const markUpdatesAsSeen = useCallback(async () => {
    if (hasNewUpdate && latestTimestampFromServer) {
      await AsyncStorage.setItem(LAST_AVISO_TIMESTAMP_KEY, latestTimestampFromServer.toString());
      setHasNewUpdate(false);
    }
  }, [hasNewUpdate]);

  return (
    <NotificationContext.Provider value={{ hasNewUpdate, checkForUpdates, markUpdatesAsSeen }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook customizado para facilitar o acesso ao contexto.
export const useNotification = () => {
  return useContext(NotificationContext);
};


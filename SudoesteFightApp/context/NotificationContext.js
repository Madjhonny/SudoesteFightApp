import React, { createContext, useState, useContext, useCallback, useEffect, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Confirme se o IP está correto
const API_URL = "http://192.168.100.7:3000"; 
const LAST_AVISO_TIMESTAMP_KEY = '@last_aviso_timestamp';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  // Usamos um 'ref' para guardar o timestamp mais recente sem causar re-renderizações desnecessárias
  const latestTimestampRef = useRef(null);

  const checkForUpdates = useCallback(async (avisos) => {
    if (!avisos || avisos.length === 0) {
      setHasNewUpdate(false);
      return;
    }
    
    const latestTimestamp = new Date(avisos[0].data_postagem).getTime();
    latestTimestampRef.current = latestTimestamp; // Guarda o valor no ref

    const lastSeenTimestamp = await AsyncStorage.getItem(LAST_AVISO_TIMESTAMP_KEY);

    if (!lastSeenTimestamp || latestTimestamp > parseInt(lastSeenTimestamp, 10)) {
      setHasNewUpdate(true);
    } else {
      setHasNewUpdate(false);
    }
  }, []);

  const silentCheckForUpdates = useCallback(async () => {
    try {
        const response = await axios.get(`${API_URL}/api/avisos`);
        await checkForUpdates(response.data);
    } catch (error) {
        // Ignora erros silenciosamente
    }
  }, [checkForUpdates]);


  // Esta função agora é estável porque não depende do estado
  const markUpdatesAsSeen = useCallback(async () => {
    if (latestTimestampRef.current) {
      await AsyncStorage.setItem(LAST_AVISO_TIMESTAMP_KEY, latestTimestampRef.current.toString());
      setHasNewUpdate(false);
    }
  }, []);

  // Verifica as atualizações quando a app inicia
  useEffect(() => {
    silentCheckForUpdates();
  }, [silentCheckForUpdates]);

  // 'useMemo' garante que o objeto de contexto só muda quando 'hasNewUpdate' muda
  const value = useMemo(() => ({
    hasNewUpdate,
    checkForUpdates,
    markUpdatesAsSeen
  }), [hasNewUpdate, checkForUpdates, markUpdatesAsSeen]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};


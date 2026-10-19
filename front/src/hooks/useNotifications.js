import { useCallback, useState } from 'react';
import { fetchNotifications } from '../services/api.js';
import useApi from './useApi.js';

const READ_KEY = 'notifications_read';
const EMPTY = [];

function readIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Notificaciones del servidor + cuáles ya leyó este navegador. */
export default function useNotifications(currency) {
  const { data, ...rest } = useApi(() => fetchNotifications(currency), [currency], { initialData: EMPTY });
  const notifications = data ?? EMPTY;
  const [readIdsState, setReadIds] = useState(readIds);
  const read = new Set(readIdsState);

  const markAllRead = useCallback(() => {
    const ids = notifications.map((n) => n.id);
    // Solo se conservan los ids vigentes para que la lista no crezca sin fin.
    setReadIds(ids);
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(ids));
    } catch {
      // almacenamiento no disponible
    }
  }, [notifications]);

  return {
    notifications: notifications.map((n) => ({ ...n, read: read.has(n.id) })),
    unread: notifications.filter((n) => !read.has(n.id)).length,
    markAllRead,
    ...rest,
  };
}

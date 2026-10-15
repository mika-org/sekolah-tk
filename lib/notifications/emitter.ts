import { EventEmitter } from 'events'

export type NotificationType = 'NEW_REGISTRATION' | 'PAYMENT_SUBMITTED' | 'FORM_COMPLETED'

export interface PPDBNotification {
  id: string
  type: NotificationType
  title: string
  studentName: string
  parentName?: string
  phone?: string
  message: string
  link: string
  createdAt: string
  read?: boolean
}

interface NotificationStore {
  emitter: EventEmitter
  recent: PPDBNotification[]
}

declare global {
  // eslint-disable-next-line no-var
  var __ppdbNotificationStore: NotificationStore | undefined
}

function getStore(): NotificationStore {
  if (!global.__ppdbNotificationStore) {
    const emitter = new EventEmitter()
    emitter.setMaxListeners(100)
    global.__ppdbNotificationStore = {
      emitter,
      recent: [],
    }
  }
  return global.__ppdbNotificationStore
}

export function broadcastPPDBNotification(
  payload: Omit<PPDBNotification, 'id' | 'createdAt'>
): PPDBNotification {
  const store = getStore()
  const notification: PPDBNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...payload,
  }

  // Prepend to recent list (limit to 50 items)
  store.recent = [notification, ...store.recent].slice(0, 50)

  // Emit event to active SSE streams
  store.emitter.emit('ppdb_notification', notification)

  return notification
}

export function subscribePPDBNotification(
  listener: (notification: PPDBNotification) => void
): () => void {
  const store = getStore()
  store.emitter.on('ppdb_notification', listener)

  return () => {
    store.emitter.off('ppdb_notification', listener)
  }
}

export function getRecentNotifications(): PPDBNotification[] {
  const store = getStore()
  return [...store.recent]
}

export function markNotificationsAsRead(): void {
  const store = getStore()
  store.recent = store.recent.map((n) => ({ ...n, read: true }))
}

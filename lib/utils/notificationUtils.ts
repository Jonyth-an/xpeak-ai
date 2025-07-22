// lib/utils/notificationUtils.ts

export type NotificationPayload = {
  title: string;
  body: string;
  icon?: string;
  url?: string;
};

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationSupported()) return null;
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (!isNotificationSupported()) return null;
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return null;
  }
}

export function showNativeNotification(payload: NotificationPayload): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return null;
  const notification = new Notification(payload.title, {
    body: payload.body,
    icon: payload.icon || '/favicon.ico',
    data: { url: payload.url },
  });
  notification.onclick = (event) => {
    event.preventDefault();
    if (payload.url) {
      window.open(payload.url, '_blank');
    } else {
      window.focus();
    }
  };
  return notification;
} 
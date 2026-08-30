/**
 * notificationEngine — Deterministic Clinical Nudge & Pre-Meal Bolus Push Notification Manager
 */

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

/**
 * Checks current browser notification permission status.
 */
export const getNotificationPermission = (): NotificationPermissionState => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
};

/**
 * Prompts user for browser notification permission.
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionState> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[NotificationEngine] Notifications not supported in this browser.');
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log(`[NotificationEngine] Permission requested: ${permission}`);
    return permission as NotificationPermissionState;
  } catch (err) {
    console.error('[NotificationEngine] Error requesting permission:', err);
    return 'denied';
  }
};

/**
 * Shows an immediate notification via ServiceWorker registration or standard Notification API.
 */
export const triggerImmediateNotification = async (
  title: string,
  body: string,
  data: any = {}
): Promise<boolean> => {
  if (getNotificationPermission() !== 'granted') {
    console.warn('[NotificationEngine] Cannot trigger notification: permission not granted.');
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, {
          body,
          icon: '/recipe_detail_desktop.png',
          badge: '/favicon.ico',
          tag: 'glyco-nudge',
          data,
        });
        return true;
      }
    }

    // Fallback for direct browser window Notification
    new Notification(title, {
      body,
      icon: '/recipe_detail_desktop.png',
      data,
    });
    return true;
  } catch (err) {
    console.error('[NotificationEngine] Error showing notification:', err);
    return false;
  }
};

/**
 * Schedules a pre-meal bolus reminder offset from meal time.
 * @param mealTime Target meal time (Date, ISO string, or timestamp)
 * @param bolusOffsetMinutes Calibrated bolus offset (e.g., 15 minutes before meal)
 * @param recipeName Name of the scheduled recipe
 * @param recipeId Optional recipe ID to route to cook mode on notification click
 */
export const scheduleBolusReminder = (
  mealTime: Date | string | number,
  bolusOffsetMinutes: number = 15,
  recipeName: string = 'Scheduled Meal',
  recipeId: string = '1'
): { scheduledTime: Date; timerId: number } => {
  const mealTimestamp = new Date(mealTime).getTime();
  const offsetMs = bolusOffsetMinutes * 60 * 1000;
  const triggerTimestamp = mealTimestamp - offsetMs;
  const now = Date.now();
  const delayMs = Math.max(0, triggerTimestamp - now);

  console.log(`[NotificationEngine] Scheduling bolus reminder for "${recipeName}" in ${Math.round(delayMs / 1000)}s (Offset: ${bolusOffsetMinutes}m)`);

  const title = '💉 Pre-Meal Bolus Reminder';
  const body = `Time to dose for ${recipeName}. Your clinical offset is ${bolusOffsetMinutes} minutes.`;

  // If already past or due within 5 seconds, trigger immediately
  if (delayMs <= 5000) {
    triggerImmediateNotification(title, body, { url: `/#/recipe/${recipeId}/cook` });
    return { scheduledTime: new Date(triggerTimestamp), timerId: 0 };
  }

  // Active in-app timer
  const timerId = window.setTimeout(() => {
    triggerImmediateNotification(title, body, { url: `/#/recipe/${recipeId}/cook` });
  }, delayMs);

  return { scheduledTime: new Date(triggerTimestamp), timerId };
};

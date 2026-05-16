import { useEffect, useState } from "react";
import { listMyNotifications } from "./api";

export function useUnreadNotificationsCount(isAuthenticated) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    async function load() {
      if (!isAuthenticated) {
        if (!cancelled) setUnreadCount(0);
        return;
      }
      try {
        const { items } = await listMyNotifications({ page: 1, pageSize: 20 });
        if (cancelled) return;
        const unread = items.filter((n) => !n.readAt).length;
        setUnreadCount(unread);
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    }

    load();
    if (isAuthenticated) {
      timer = setInterval(load, 30000);
    }
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [isAuthenticated]);

  return unreadCount;
}

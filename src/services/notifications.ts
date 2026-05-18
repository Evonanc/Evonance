import { createClient } from "@/lib/supabase/client";

export async function getNotifications(userId: string, limit = 20) {
  const supabase = createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function markAllRead(userId: string) {
  const supabase = createClient();
  await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

export async function markRead(notificationId: string) {
  const supabase = createClient();
  await supabase.from("notifications").update({ read: true }).eq("id", notificationId);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  return count ?? 0;
}

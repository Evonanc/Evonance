import { createClient } from "@/lib/supabase/client";
import type { UserSettings, UserProfile } from "@/types/database";

export async function getSettings(userId: string): Promise<UserSettings | null> {
  const supabase = createClient();
  const { data } = await supabase.from("user_settings").select("*").eq("user_id", userId).single();
  return data as UserSettings | null;
}

export async function updateSettings(userId: string, updates: Partial<UserSettings>) {
  const supabase = createClient();
  const { error } = await supabase.from("user_settings").update(updates).eq("user_id", userId);
  return { success: !error, error: error?.message };
}

export async function updateProfile(userId: string, updates: Partial<Pick<UserProfile, "first_name" | "last_name" | "avatar_url">>) {
  const supabase = createClient();
  const { error } = await supabase.from("user_profiles").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", userId);
  return { success: !error, error: error?.message };
}

export async function changePassword(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { success: !error, error: error?.message };
}

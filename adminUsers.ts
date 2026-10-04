import { supabase } from "./supabaseClient";

export async function adminUserAction(payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("admin-user", { body: payload });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

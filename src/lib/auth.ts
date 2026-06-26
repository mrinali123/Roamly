import { createClient } from "@/lib/supabase/client";

export type AuthError = { message: string };

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  emailRedirectTo?: string
): Promise<{ error: AuthError | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // Always derive the base URL from the browser so production deployments
      // never embed localhost. Callers may pass a full URL (e.g. with ?next=)
      // to thread a post-confirmation redirect through the callback route.
      emailRedirectTo: emailRedirectTo ?? `${window.location.origin}/auth/callback`,
    },
  });
  return { error: error ? { message: error.message } : null };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ error: AuthError | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error ? { message: error.message } : null };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function sendPasswordResetEmail(
  email: string
): Promise<{ error: AuthError | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { error: error ? { message: error.message } : null };
}

export async function updatePassword(
  newPassword: string
): Promise<{ error: AuthError | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error ? { message: error.message } : null };
}

export function useAuth() {
  const supabase = useSupabaseClient();

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error)
      throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error)
      throw error;
  };

  return { signIn, signOut };
}

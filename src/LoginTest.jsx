import { supabase } from "./supabaseClient";

function LoginTest() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/my`,
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
    }
  };

  return (
    <button onClick={handleGoogleLogin} style={{ padding: 10 }}>
      Continue with Google
    </button>
  );
}

export default LoginTest;
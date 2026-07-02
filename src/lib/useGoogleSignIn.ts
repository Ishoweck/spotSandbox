import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { getFirebaseAuth } from "./firebase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function useGoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signInWithGoogle = async (role: "customer" | "vendor" = "customer") => {
    setError("");
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch(`${API_BASE}/auth/oauth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Google sign-in failed. Please try again.");
      }

      const token = json.data?.accessToken || json.data?.token;
      if (!token) throw new Error("No token received from server.");

      localStorage.setItem("vendorspot_token", token);
      if (json.data?.user) localStorage.setItem("vendorspot_user", JSON.stringify(json.data.user));

      return json.data;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return null;
      }
      const msg = err instanceof Error ? err.message : "Google sign-in failed. Please try again.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading, error, setError };
}

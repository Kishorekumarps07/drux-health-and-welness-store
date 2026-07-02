"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/**
 * AuthHashHandler — mounts once at root layout level.
 *
 * Handles two scenarios where Supabase redirects to the root URL
 * instead of /auth/reset-password (due to unwhitelisted redirect URL):
 *
 * 1. PASSWORD_RECOVERY event — Supabase auto-processes the hash token and
 *    fires this event. We intercept it here and redirect to the reset page.
 *
 * 2. Error in hash (#error=access_denied&error_code=otp_expired) — We parse
 *    the hash, show a toast, and redirect to forgot-password.
 */
export function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    // ── Listener 1: Catch PASSWORD_RECOVERY event globally ─────────────────
    // Supabase fires this when a recovery link token is processed — even if
    // the hash has already been cleared from the URL by the time React mounts.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          // Do NOT let the user stay logged in on the home page.
          // Redirect immediately to the password reset form.
          router.replace("/auth/reset-password");
        }
      }
    );

    // ── Listener 2: Catch error hashes at root ─────────────────────────────
    // If Supabase sends an error (e.g., otp_expired) it appends it as a hash.
    const hash = window.location.hash;
    if (hash && hash !== "#") {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const error     = params.get("error");
      const errorCode = params.get("error_code");

      if (error) {
        // Clean the hash from URL immediately
        window.history.replaceState(null, "", window.location.pathname);

        let message = "The link is invalid or has expired.";
        if (errorCode === "otp_expired") {
          message = "Your reset link has expired. Please request a new one.";
        } else if (errorCode === "access_denied") {
          message = "Access denied. Please request a new password reset link.";
        }

        toast.error(message, { duration: 6000 });

        setTimeout(() => {
          router.replace("/vendor/forgot-password");
        }, 1500);
      }
    }

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}

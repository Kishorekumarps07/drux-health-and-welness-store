"use client";

import { AdminAuthForm } from "@/components/auth/AdminAuthForm";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="w-full px-6">
      <AdminAuthForm />
    </div>
  );
}

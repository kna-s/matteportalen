"use client";

import AdminPanel from "@/components/AdminPanel";
import { RequireLogin } from "@/components/ui";

export default function AdminPage() {
  return (
    <RequireLogin roles={["admin"]}>
      <AdminPanel />
    </RequireLogin>
  );
}

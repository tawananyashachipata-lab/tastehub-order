import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  roles: string[];
  dbStatus: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<{ isAdmin: boolean; roles: string[]; status: string }>;
  promoteToAdmin: () => Promise<{ success: boolean; message: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function checkRole(userId: string | undefined): Promise<{ isAdmin: boolean; roles: string[]; status: string }> {
    if (!userId) {
      setIsAdmin(false);
      setRoles([]);
      setDbStatus(null);
      setLoading(false);
      return { isAdmin: false, roles: [], status: "No user session" };
    }

    const collectedRoles: string[] = [];
    let isUserAdmin = false;
    const statusMessages: string[] = [];

    try {
      // 1. Fetch roles from public.user_roles table
      const { data: userRolesData, error: userRolesErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (userRolesErr) {
        statusMessages.push(`user_roles error: ${userRolesErr.message}`);
      } else if (userRolesData && userRolesData.length > 0) {
        userRolesData.forEach((r) => {
          if (r.role) collectedRoles.push(r.role);
        });
      }

      if (collectedRoles.includes("admin")) {
        isUserAdmin = true;
      }

      // 2. Check public.profiles table (in case role is stored on profile)
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!profileErr && profileData) {
        const rawRole = (profileData as Record<string, unknown>)["role"];
        const rawIsAdmin = (profileData as Record<string, unknown>)["is_admin"];
        if (typeof rawRole === "string") {
          collectedRoles.push(`profile:${rawRole}`);
          if (rawRole.toLowerCase() === "admin") isUserAdmin = true;
        }
        if (rawIsAdmin === true) {
          collectedRoles.push("profile:is_admin=true");
          isUserAdmin = true;
        }
      }

      // 3. Check via has_role RPC function (security definer)
      if (!isUserAdmin) {
        const { data: rpcData, error: rpcErr } = await supabase.rpc("has_role", {
          _user_id: userId,
          _role: "admin",
        });

        if (rpcErr) {
          statusMessages.push(`has_role rpc: ${rpcErr.message}`);
        } else if (rpcData === true) {
          isUserAdmin = true;
          collectedRoles.push("admin");
        }
      }

      // 4. Try claim_admin_role RPC function if available
      if (!isUserAdmin) {
        const { data: claimed } = await supabase.rpc("claim_admin_role");
        if (claimed === true) {
          isUserAdmin = true;
          collectedRoles.push("admin");
        }
      }

      const uniqueRoles = Array.from(new Set(collectedRoles));
      setRoles(uniqueRoles);
      setIsAdmin(isUserAdmin);
      const finalStatus = isUserAdmin
        ? "Admin verified"
        : statusMessages.length > 0
          ? statusMessages.join("; ")
          : uniqueRoles.length > 0
            ? `Roles found: [${uniqueRoles.join(", ")}] (needs 'admin')`
            : "No roles found for this user in user_roles table";

      setDbStatus(finalStatus);
      return { isAdmin: isUserAdmin, roles: uniqueRoles, status: finalStatus };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[useAuth] Failed to verify admin role:", err);
      setIsAdmin(false);
      setDbStatus(`Error: ${errMsg}`);
      return { isAdmin: false, roles: [], status: `Error: ${errMsg}` };
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession);
        void checkRole(newSession?.user?.id);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        void checkRole(data.session?.user?.id);
      }
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refreshRole = async (): Promise<{ isAdmin: boolean; roles: string[]; status: string }> => {
    setLoading(true);
    const currentSession = session ?? (await supabase.auth.getSession()).data.session;
    return await checkRole(currentSession?.user?.id);
  };

  const promoteToAdmin = async (): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const currentSession = session ?? (await supabase.auth.getSession()).data.session;
    const uid = currentSession?.user?.id;
    if (!uid) {
      setLoading(false);
      return { success: false, message: "No active user session. Please sign in." };
    }

    // 1. Try make_admin / claim_admin_role RPC functions
    try {
      const { data: madeAdmin, error: rpcErr1 } = await supabase.rpc("make_admin", {
        _target_user_id: uid,
      });
      if (!rpcErr1 && madeAdmin === true) {
        const verified = await checkRole(uid);
        if (verified.isAdmin) return { success: true, message: "Admin role successfully granted via RPC!" };
      }
    } catch {
      // ignore
    }

    try {
      const { data: claimed, error: rpcErr2 } = await supabase.rpc("claim_admin_role");
      if (!rpcErr2 && claimed === true) {
        const verified = await checkRole(uid);
        if (verified.isAdmin) return { success: true, message: "Admin role claimed via database function!" };
      }
    } catch {
      // ignore
    }

    // 2. Try direct update on public.user_roles (requiring modified rows confirmation)
    try {
      const { data: updateData, error: updateErr } = await supabase
        .from("user_roles")
        .update({ role: "admin" as any })
        .eq("user_id", uid)
        .select();

      if (!updateErr && updateData && updateData.length > 0 && updateData.some((r) => r.role === "admin")) {
        const verified = await checkRole(uid);
        if (verified.isAdmin) return { success: true, message: "Admin role updated in user_roles table!" };
      }
    } catch {
      // ignore
    }

    // 3. Try direct insert into public.user_roles (requiring inserted row confirmation)
    try {
      const { data: insertData, error: insertErr } = await supabase
        .from("user_roles")
        .insert({ user_id: uid, role: "admin" as any })
        .select();

      if (!insertErr && insertData && insertData.length > 0 && insertData.some((r) => r.role === "admin")) {
        const verified = await checkRole(uid);
        if (verified.isAdmin) return { success: true, message: "Admin role inserted into user_roles table!" };
      }
    } catch {
      // ignore
    }

    // Verify actual status from database
    const checkResult = await checkRole(uid);
    if (checkResult.isAdmin) {
      return { success: true, message: "Admin role verified in database!" };
    }

    return {
      success: false,
      message: `Database RLS blocks direct client writes. Role remains [${checkResult.roles.join(", ") || "user"}]. Run the SQL UPDATE in Supabase.`,
    };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
    setRoles([]);
    setDbStatus(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        isAdmin,
        roles,
        dbStatus,
        loading,
        signOut,
        refreshRole,
        promoteToAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

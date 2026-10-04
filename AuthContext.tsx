import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Profile, Role } from "../types";

interface AuthContextValue {
  profile: Profile | null;
  studentId: number | null;
  companyId: number | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  role: Exclude<Role, "admin">;
  fullName: string;
  phone: string;
  rollNumber?: string;
  branch?: string;
  semester?: number;
  cgpa?: number;
  skills?: string;
  resumeSummary?: string;
  companyName?: string;
  industry?: string;
  website?: string;
  description?: string;
  location?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  async function restoreLinks(p: Profile) {
    if (p.role === "student") {
      const { data } = await supabase.from("students").select("id").eq("profile_id", p.id).maybeSingle();
      setStudentId(data?.id ?? null);
      setCompanyId(null);
    } else if (p.role === "company") {
      const { data } = await supabase.from("companies").select("id").eq("profile_id", p.id).maybeSingle();
      setCompanyId(data?.id ?? null);
      setStudentId(null);
    } else {
      setStudentId(null);
      setCompanyId(null);
    }
  }

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      setStudentId(null);
      setCompanyId(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (error || !data) {
      await supabase.auth.signOut();
      setProfile(null);
      setStudentId(null);
      setCompanyId(null);
      return;
    }

    const p = data as Profile;
    setProfile(p);
    await restoreLinks(p);
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      await loadProfile();
      if (mounted) setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (!mounted) return;
      // Avoid awaiting Supabase calls inside the auth event callback itself.
      setTimeout(() => {
        void loadProfile().finally(() => {
          if (mounted) setLoading(false);
        });
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    await loadProfile();
    return { ok: true };
  }

  async function register(d: RegisterData) {
    const { data, error } = await supabase.auth.signUp({
      email: d.email,
      password: d.password,
      options: {
        data: {
          role: d.role,
          full_name: d.fullName,
          phone: d.phone,
          roll_number: d.rollNumber,
          branch: d.branch,
          semester: d.semester,
          cgpa: d.cgpa,
          skills: d.skills,
          resume_summary: d.resumeSummary,
          company_name: d.companyName,
          industry: d.industry,
          website: d.website,
          description: d.description,
          location: d.location,
        },
      },
    });

    if (error) return { ok: false, error: error.message };

    // The database trigger creates the profile/student/company records from Auth metadata.
    if (data.session) {
      await loadProfile();
      return { ok: true };
    }

    return {
      ok: true,
      error: "Account created. Please verify your email, then sign in to continue.",
    };
  }

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null);
    setStudentId(null);
    setCompanyId(null);
  }

  return (
    <AuthContext.Provider value={{ profile, studentId, companyId, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

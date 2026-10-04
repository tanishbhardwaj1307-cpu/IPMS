import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/DashboardLayout";
import { PageHeader, Spinner, EmptyState, StatusBadge } from "../../components/ui";
import type { Interview } from "../../types";

export default function StudentInterviews() {
  const { studentId } = useAuth();
  const [rows, setRows] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    (async () => {
      const { data: apps } = await supabase
        .from("applications")
        .select("id")
        .eq("student_id", studentId);
      if (!apps || apps.length === 0) { setLoading(false); return; }
      const appIds = apps.map((a: { id: number }) => a.id);
      const { data } = await supabase
        .from("interviews")
        .select("*, application:applications(*, internship:internships(*), job:jobs(*))")
        .in("application_id", appIds)
        .order("interview_date", { ascending: false });
      if (data) setRows(data as Interview[]);
      setLoading(false);
    })();
  }, [studentId]);

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="My Interview Schedule" subtitle="Track your upcoming and past interviews" />

      {rows.length === 0 ? <EmptyState message="No interviews scheduled yet. Your interviews will appear here once a company schedules one." /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{r.application?.internship?.title ?? r.application?.job?.title}</h3>
                  <p className="text-sm text-slate-500">{r.application?.internship?.title ? "Internship" : "Job"} Application</p>
                </div>
                <StatusBadge status={r.result} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  {r.interview_date}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {r.interview_time}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {r.mode}
                </div>
                {r.rounds && <p className="text-slate-600"><span className="font-medium">Rounds:</span> {r.rounds}</p>}
                {r.location_link && <a href={r.location_link} target="_blank" rel="noopener noreferrer" className="block truncate text-brand-600 hover:underline">{r.location_link}</a>}
                {r.notes && <p className="text-slate-500 italic">{r.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

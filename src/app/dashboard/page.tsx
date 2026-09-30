import LogoutButton from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalMembers, error: membersError },
    { count: totalWorkers, error: workersError },
    { count: totalLeaders, error: leadersError },
    { data: familyData, error: familiesError },
    { data: departmentData, error: departmentsError },
  ] = await Promise.all([
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),

    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("is_worker", true),

    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("is_leader", true),

    supabase
    .from("church_families")
    .select(`
        id,
        name,
        members (
        id
        )
    `)
    .eq("is_active", true)
    .eq("members.is_active", true)
    .order("name"),

    supabase
    .from("departments")
    .select(`
        id,
        name,
        member_departments (
        member_id,
        members!inner (
            id
        )
        )
    `)
    .eq("is_active", true)
    .eq("member_departments.members.is_active", true)
    .order("name"),
  ]);

  const error =
    membersError || workersError || leadersError || familiesError || departmentsError;

  if (error) {
    return (
      <main className="p-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load dashboard data.
        </div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <p className="mt-2 text-gray-600">
            Welcome to MyChurchApp.
          </p>
        </div>

        <LogoutButton />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-500">Active members</p>

          <p className="mt-2 text-3xl font-bold">
            {totalMembers ?? 0}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-500">Active workers</p>

          <p className="mt-2 text-3xl font-bold">
            {totalWorkers ?? 0}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-500">Active leaders</p>

          <p className="mt-2 text-3xl font-bold">
            {totalLeaders ?? 0}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Members by church family
        </h2>

        <div className="mt-4 space-y-3">
          {(familyData ?? []).map((family) => (
            <div
              key={family.id}
              className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
            >
              <span className="text-sm">{family.name}</span>

              <span className="font-semibold">
                {family.members?.length ?? 0}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Active workers by department
        </h2>

        <div className="mt-4 space-y-3">
          {(departmentData ?? []).map((department) => (
            <div
              key={department.id}
              className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
            >
              <span className="text-sm">{department.name}</span>

              <span className="font-semibold">
                {department.member_departments?.length ?? 0}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
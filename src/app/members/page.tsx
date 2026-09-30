import { createClient } from "@/lib/supabase/server";
import MembersClient from "./members-client";

export default async function MembersPage() {
  const supabase = await createClient();

  const [{ data: members, error }, { data: families }] =
    await Promise.all([
      supabase
        .from("members")
        .select(`
          id,
          member_id,
          first_name,
          last_name,
          gender,
          phone,
          email,
          is_worker,
          is_leader,
          is_active,
          church_families (
            name
          )
        `)
        .order("last_name", { ascending: true })
        .order("first_name", { ascending: true }),

      supabase
        .from("church_families")
        .select("name")
        .eq("is_active", true)
        .order("name"),
    ]);

  if (error) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load members.
        </div>
      </main>
    );
  }

  return (
    <MembersClient
      initialMembers={members ?? []}
      families={(families ?? []).map((family) => family.name)}
    />
  );
}
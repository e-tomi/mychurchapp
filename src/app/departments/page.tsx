import { createClient } from "@/lib/supabase/server";
import DepartmentsClient from "./departments-client";

export default async function DepartmentsPage() {
  const supabase = await createClient();

  const { data: departments, error } = await supabase
    .from("departments")
    .select("id, name, description, is_active")
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="p-6 md:p-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load departments.
        </div>
      </main>
    );
  }

  return <DepartmentsClient initialDepartments={departments ?? []} />;
}
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type MemberPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MemberPage({
  params,
}: MemberPageProps) {
  const { id } = await params;

  const supabase = await createClient();

    const { data: member, error } = await supabase
    .from("members")
    .select(`
        id,
        member_id,
        first_name,
        last_name,
        gender,
        phone,
        email,
        address,
        birth_day,
        birth_month,
        is_worker,
        is_leader,
        is_active,
        notes,
        church_families (
        name
        ),
        member_departments (
        departments (
            id,
            name
        )
        )
    `)
    .eq("id", id)
    .single();

  if (error || !member) {
    notFound();
  }

  const family = Array.isArray(member.church_families)
    ? member.church_families[0]
    : member.church_families;

  const monthNames = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const birthday =
    member.birth_day && member.birth_month
      ? `${member.birth_day} ${monthNames[member.birth_month]}`
      : "Not provided";

  return (
    <main className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/members"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to members
            </Link>

            <h1 className="mt-4 text-3xl font-bold">
              {member.first_name} {member.last_name}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              CH-{String(member.member_id).padStart(6, "0")}
            </p>
          </div>

          <Link
            href={`/members/${member.id}/edit`}
            className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Edit member
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Personal information
            </h2>

            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Gender</dt>
                <dd className="mt-1">{member.gender}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Birthday</dt>
                <dd className="mt-1">{birthday}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Church family</dt>
                <dd className="mt-1">{family?.name ?? "Not assigned"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Contact information
            </h2>

            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="mt-1">{member.phone || "Not provided"}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="mt-1">{member.email || "Not provided"}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Address</dt>
                <dd className="mt-1 whitespace-pre-wrap">
                  {member.address || "Not provided"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Church involvement
            </h2>

            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Worker</dt>
                <dd className="mt-1">
                  {member.is_worker ? "Yes" : "No"}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Leader</dt>
                <dd className="mt-1">
                  {member.is_leader ? "Yes" : "No"}
                </dd>
              </div>

            <div>
            <p className="text-sm text-gray-500">Departments</p>

            {!member.is_worker ? (
                <p className="mt-1">None</p>
            ) : member.member_departments?.length ? (
                <div className="mt-1 flex flex-wrap gap-2">
                {member.member_departments.map((item) => (
                    <span
                    key={item.departments.id}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                    >
                    {item.departments.name}
                    </span>
                ))}
                </div>
            ) : (
                <p className="mt-1">No departments assigned</p>
            )}
            </div>

              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="mt-1">
                  {member.is_active ? "Active" : "Inactive"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Notes
            </h2>

            <p className="mt-5 whitespace-pre-wrap text-gray-700">
              {member.notes || "No notes"}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
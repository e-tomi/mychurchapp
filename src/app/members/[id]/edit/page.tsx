"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Family = {
  id: string;
  name: string;
};

type Member = {
  id: string;
  member_id: number;
  first_name: string;
  last_name: string;
  gender: "Male" | "Female";
  phone: string | null;
  email: string | null;
  address: string | null;
  birth_day: number | null;
  birth_month: number | null;
  family_id: string | null;
  is_worker: boolean;
  is_leader: boolean;
  is_active: boolean;
  notes: string | null;
};

export default function EditMemberPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [member, setMember] = useState<Member | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    [],
    );
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
    >([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    birth_day: "",
    birth_month: "",
    family_id: "",
    is_worker: false,
    is_leader: false,
    is_active: true,
    notes: "",
  });

  useEffect(() => {
    async function loadData() {
        const [memberResult, familiesResult, departmentsResult, activeDepartmentsResult,] =
        await Promise.all([
            supabase
            .from("members")
            .select("*")
            .eq("id", params.id)
            .single(),

            supabase
            .from("church_families")
            .select("id, name")
            .eq("is_active", true)
            .order("name"),

            supabase
            .from("member_departments")
            .select(`
                department_id,
                departments (
                id,
                name
                )
            `)
            .eq("member_id", params.id),

            supabase
            .from("departments")
            .select("id, name")
            .eq("is_active", true)
            .order("name"),
        ]);

      if (memberResult.error || !memberResult.data) {
        setError("Unable to load member.");
        setLoading(false);
        return;
      }

      if (familiesResult.error) {
        setError("Unable to load church families.");
        setLoading(false);
        return;
      }

        if (departmentsResult.error) {
        setError("Unable to load member departments.");
        return;
        }

        setSelectedDepartments(
        (departmentsResult.data ?? []).map((item) => item.department_id),
        );

        if (activeDepartmentsResult.error) {
        setError("Unable to load departments.");
        return;
        }

        setDepartments(activeDepartmentsResult.data ?? []);

      const loadedMember = memberResult.data as Member;

      setMember(loadedMember);

      setForm({
        first_name: loadedMember.first_name,
        last_name: loadedMember.last_name,
        gender: loadedMember.gender,
        phone: loadedMember.phone ?? "",
        email: loadedMember.email ?? "",
        address: loadedMember.address ?? "",
        birth_day: loadedMember.birth_day?.toString() ?? "",
        birth_month: loadedMember.birth_month?.toString() ?? "",
        family_id: loadedMember.family_id ?? "",
        is_worker: loadedMember.is_worker,
        is_leader: loadedMember.is_leader,
        is_active: loadedMember.is_active,
        notes: loadedMember.notes ?? "",
      });

      setFamilies(familiesResult.data ?? []);
      setLoading(false);
    }

    loadData();
  }, [params.id]);

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!member) return;

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("members")
      .update({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        gender: form.gender,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        birth_day: form.birth_day ? Number(form.birth_day) : null,
        birth_month: form.birth_month ? Number(form.birth_month) : null,
        family_id: form.family_id || null,
        is_worker: form.is_worker,
        is_leader: form.is_leader,
        is_active: form.is_active,
        notes: form.notes.trim() || null,
      })
      .eq("id", member.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    const { error: deleteDepartmentsError } = await supabase
    .from("member_departments")
    .delete()
    .eq("member_id", params.id);

    if (deleteDepartmentsError) {
    setError("Member was updated, but departments could not be updated.");
    setSaving(false);
    return;
    }

    if (form.is_worker && selectedDepartments.length > 0) {
    const { error: insertDepartmentsError } = await supabase
        .from("member_departments")
        .insert(
        selectedDepartments.map((departmentId) => ({
            member_id: params.id,
            department_id: departmentId,
        })),
        );

    if (insertDepartmentsError) {
        setError("Member was updated, but departments could not be updated.");
        setSaving(false);
        return;
    }
    }
    
    router.push(`/members/${member.id}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="p-6 md:p-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-gray-600">Loading member...</p>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="p-6 md:p-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div>
          <button
            type="button"
            onClick={() => router.push(`/members/${member.id}`)}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to member
          </button>

          <h1 className="mt-4 text-3xl font-bold">
            Edit member
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            CH-{String(member.member_id).padStart(6, "0")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-8"
        >
          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Basic information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium"
                >
                  First name *
                </label>

                <input
                  id="first_name"
                  required
                  value={form.first_name}
                  onChange={(event) =>
                    updateField("first_name", event.target.value)
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium"
                >
                  Last name *
                </label>

                <input
                  id="last_name"
                  required
                  value={form.last_name}
                  onChange={(event) =>
                    updateField("last_name", event.target.value)
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium"
                >
                  Gender *
                </label>

                <select
                  id="gender"
                  required
                  value={form.gender}
                  onChange={(event) =>
                    updateField("gender", event.target.value)
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="family_id"
                  className="block text-sm font-medium"
                >
                  Church family
                </label>

                <select
                  id="family_id"
                  value={form.family_id}
                  onChange={(event) =>
                    updateField("family_id", event.target.value)
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="">Select family</option>

                  {families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Contact information
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium"
                >
                  Phone
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium"
                >
                  Address
                </label>

                <textarea
                  id="address"
                  rows={3}
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Birthday
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="birth_day"
                  className="block text-sm font-medium"
                >
                  Day
                </label>

                <input
                  id="birth_day"
                  type="number"
                  min="1"
                  max="31"
                  value={form.birth_day}
                  onChange={(event) =>
                    updateField("birth_day", event.target.value)
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="birth_month"
                  className="block text-sm font-medium"
                >
                  Month
                </label>

                <select
                  id="birth_month"
                  value={form.birth_month}
                  onChange={(event) =>
                    updateField("birth_month", event.target.value)
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="">Select month</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Church involvement
            </h2>

            <div className="mt-5 space-y-4">
                <label className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={form.is_worker}
                    onChange={(event) => {
                    const isWorker = event.target.checked;

                    updateField("is_worker", isWorker);

                    if (!isWorker) {
                        setSelectedDepartments([]);
                    }
                    }}
                    className="h-4 w-4"
                />
                <span className="text-sm">
                    This member is a worker
                </span>
                </label>

                <div>
                <label className="mb-2 block text-sm font-medium">
                    Departments
                </label>

                {!form.is_worker ? (
                    <p className="text-sm text-gray-500">
                    Select "This member is a worker" to assign departments.
                    </p>
                ) : departments.length === 0 ? (
                    <p className="text-sm text-gray-500">
                    No active departments available.
                    </p>
                ) : (
                    <div className="space-y-2">
                    {departments.map((department) => (
                        <label
                        key={department.id}
                        className="flex items-center gap-2 text-sm"
                        >
                        <input
                            type="checkbox"
                            checked={selectedDepartments.includes(department.id)}
                            onChange={(event) => {
                            if (event.target.checked) {
                                setSelectedDepartments((current) => [
                                ...current,
                                department.id,
                                ]);
                            } else {
                                setSelectedDepartments((current) =>
                                current.filter((id) => id !== department.id),
                                );
                            }
                            }}
                        />

                        {department.name}
                        </label>
                    ))}
                    </div>
                )}
                </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_leader}
                  onChange={(event) =>
                    updateField("is_leader", event.target.checked)
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">
                  This member is a leader
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Membership status
            </h2>

            <label className="mt-5 flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  updateField("is_active", event.target.checked)
                }
                className="h-4 w-4"
              />
              <span className="text-sm">
                Member is active
              </span>
            </label>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Notes
            </h2>

            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) =>
                updateField("notes", event.target.value)
              }
              className="mt-5 w-full rounded-md border px-3 py-2"
              placeholder="Optional notes"
            />
          </section>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push(`/members/${member.id}`)}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
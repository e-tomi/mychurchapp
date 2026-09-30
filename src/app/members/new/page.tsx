"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Family = {
  id: string;
  name: string;
};

type Department = {
  id: string;
  name: string;
};

export default function NewMemberPage() {
  const router = useRouter();
  const supabase = createClient();

  const [families, setFamilies] = useState<Family[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    notes: "",
  });

  useEffect(() => {
    async function loadFamilies() {
      const { data, error } = await supabase
        .from("church_families")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) {
        setError("Unable to load church families.");
      } else {
        setFamilies(data ?? []);
      }

      setLoadingFamilies(false);
    }

    loadFamilies();
  }, []);

  useEffect(() => {
    async function loadDepartments() {
        const { data, error } = await supabase
        .from("departments")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

        if (error) {
        setError("Unable to load departments.");
        } else {
        setDepartments(data ?? []);
        }

        setLoadingDepartments(false);
    }

    loadDepartments();
    }, []);

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

    setSaving(true);
    setError("");

    const { data, error } = await supabase
        .from("members")
        .insert({
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
        notes: form.notes.trim() || null,
        })
        .select("id")
        .single();

    if (error) {
        setError(error.message);
        setSaving(false);
        return;
    }

    if (form.is_worker && selectedDepartments.length > 0) {
        const { error: departmentError } = await supabase
        .from("member_departments")
        .insert(
            selectedDepartments.map((departmentId) => ({
            member_id: data.id,
            department_id: departmentId,
            })),
        );

        if (departmentError) {
        setError(
            "Member was created, but departments could not be assigned.",
        );
        setSaving(false);
        return;
        }
    }

    router.push("/members");
    router.refresh();
  }

  return (
    <main className="p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold">Add member</h1>
          <p className="mt-2 text-gray-600">
            Add a new member to the church database.
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
                  disabled={loadingFamilies}
                  onChange={(event) =>
                    updateField("family_id", event.target.value)
                  }
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="">
                    {loadingFamilies
                      ? "Loading families..."
                      : "Select family"}
                  </option>

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

            <p className="mt-1 text-sm text-gray-600">
              Only the day and month are stored.
            </p>

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
                ) : loadingDepartments ? (
                    <p className="text-sm text-gray-500">
                    Loading departments...
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

            </div>
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
              onClick={() => router.push("/members")}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save member"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
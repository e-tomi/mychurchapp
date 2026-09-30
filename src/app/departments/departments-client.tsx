"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Department = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

export default function DepartmentsClient({
  initialDepartments,
}: {
  initialDepartments: Department[];
}) {
  const [departments, setDepartments] =
    useState<Department[]>(initialDepartments);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAddDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Department name is required.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("departments")
      .insert({
        name: trimmedName,
        description: trimmedDescription || null,
      })
      .select("id, name, description, is_active")
      .single();

    setSaving(false);

    if (error) {
      if (error.code === "23505") {
        setError("A department with this name already exists.");
      } else {
        setError("Unable to add department.");
      }

      return;
    }

    if (data) {
      setDepartments((current) =>
        [...current, data].sort((a, b) => a.name.localeCompare(b.name)),
      );
    }

    setName("");
    setDescription("");
  }

  async function toggleDepartment(department: Department) {
    setError("");

    const supabase = createClient();

    const { error } = await supabase
      .from("departments")
      .update({
        is_active: !department.is_active,
      })
      .eq("id", department.id);

    if (error) {
      setError("Unable to update department.");
      return;
    }

    setDepartments((current) =>
      current.map((item) =>
        item.id === department.id
          ? { ...item, is_active: !item.is_active }
          : item,
      ),
    );
  }

  return (
    <main className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Departments</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage the departments available for church workers.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Add department</h2>

          <form onSubmit={handleAddDepartment} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium"
              >
                Department name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Choir"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="Optional description"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add department"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border bg-white">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold">
              Departments ({departments.length})
            </h2>
          </div>

          {departments.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">
              No departments have been added yet.
            </div>
          ) : (
            <div className="divide-y">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <div className="font-medium">{department.name}</div>

                    {department.description && (
                      <div className="mt-1 text-sm text-gray-600">
                        {department.description}
                      </div>
                    )}

                    <div className="mt-1 text-xs text-gray-500">
                      {department.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDepartment(department)}
                    className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    {department.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
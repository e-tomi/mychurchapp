"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Family = {
  name: string;
} | null;

type Member = {
  id: string;
  member_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  phone: string | null;
  email: string | null;
  is_worker: boolean;
  is_leader: boolean;
  is_active: boolean;
  church_families: Family | Family[];
};

type MembersPageProps = {
  initialMembers: Member[];
  families: string[];
};

export default function MembersClient({
  initialMembers,
  families,
}: MembersPageProps) {
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("");
  const [status, setStatus] = useState("active");
  const [worker, setWorker] = useState("");
  const [leader, setLeader] = useState("");

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialMembers.filter((member) => {
      const memberFamily = Array.isArray(member.church_families)
        ? member.church_families[0]?.name
        : member.church_families?.name;

      const matchesSearch =
        !query ||
        `${member.first_name} ${member.last_name}`
          .toLowerCase()
          .includes(query) ||
        member.phone?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        `CH-${String(member.member_id).padStart(6, "0")}`
          .toLowerCase()
          .includes(query);

      const matchesFamily =
        !family || memberFamily === family;

      const matchesStatus =
        status === "all" ||
        (status === "active" && member.is_active) ||
        (status === "inactive" && !member.is_active);

      const matchesWorker =
        !worker ||
        (worker === "yes" && member.is_worker) ||
        (worker === "no" && !member.is_worker);

      const matchesLeader =
        !leader ||
        (leader === "yes" && member.is_leader) ||
        (leader === "no" && !member.is_leader);

      return (
        matchesSearch &&
        matchesFamily &&
        matchesStatus &&
        matchesWorker &&
        matchesLeader
      );
    });
  }, [
    initialMembers,
    search,
    family,
    status,
    worker,
    leader,
  ]);

  function clearFilters() {
    setSearch("");
    setFamily("");
    setStatus("active");
    setWorker("");
    setLeader("");
  }

  return (
    <main className="p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="mt-2 text-gray-600">
            Manage church members and their information.
          </p>
        </div>

        <Link
          href="/members/new"
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add member
        </Link>
      </div>

      <section className="mt-8 rounded-lg border bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label
              htmlFor="search"
              className="block text-sm font-medium"
            >
              Search
            </label>

            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Name, phone, email, or member ID"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="family"
              className="block text-sm font-medium"
            >
              Family
            </label>

            <select
              id="family"
              value={family}
              onChange={(event) =>
                setFamily(event.target.value)
              }
              className="mt-1 w-full rounded-md border px-3 py-2"
            >
              <option value="">All families</option>

              {families.map((familyName) => (
                <option key={familyName} value={familyName}>
                  {familyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="mt-1 w-full rounded-md border px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="all">All</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="worker"
              className="block text-sm font-medium"
            >
              Worker
            </label>

            <select
              id="worker"
              value={worker}
              onChange={(event) =>
                setWorker(event.target.value)
              }
              className="mt-1 w-full rounded-md border px-3 py-2"
            >
              <option value="">All</option>
              <option value="yes">Workers</option>
              <option value="no">Non-workers</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="leader"
              className="block text-sm font-medium"
            >
              Leader
            </label>

            <select
              id="leader"
              value={leader}
              onChange={(event) =>
                setLeader(event.target.value)
              }
              className="mt-1 w-full rounded-md border px-3 py-2"
            >
              <option value="">All</option>
              <option value="yes">Leaders</option>
              <option value="no">Non-leaders</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredMembers.length} of{" "}
            {initialMembers.length} members
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      </section>

      {filteredMembers.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Member ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Family
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Worker
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Leader
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y bg-white">
              {filteredMembers.map((member) => {
                const memberFamily = Array.isArray(
                  member.church_families
                )
                  ? member.church_families[0]?.name
                  : member.church_families?.name;

                return (
                  <tr key={member.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                      CH-
                      {String(member.member_id).padStart(6, "0")}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <Link
                        href={`/members/${member.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {member.first_name} {member.last_name}
                      </Link>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {member.gender}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {memberFamily ?? "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {member.is_worker ? "Yes" : "No"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {member.is_leader ? "Yes" : "No"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {member.is_active ? "Active" : "Inactive"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold">
            No matching members
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Try changing your search or filters.
          </p>
        </div>
      )}
    </main>
  );
}
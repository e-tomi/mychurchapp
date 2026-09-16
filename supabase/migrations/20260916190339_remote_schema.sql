SET local check_function_bodies = off;

CREATE TABLE "public"."church_families" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"       text                     NOT NULL,
  "is_active"  boolean                  NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "church_families_name_key" UNIQUE (name),
  CONSTRAINT "church_families_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."church_families"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."departments" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"        text                     NOT NULL,
  "description" text,
  "is_active"   boolean                  NOT NULL DEFAULT true,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "departments_name_key" UNIQUE (name),
  CONSTRAINT "departments_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."departments"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."leadership_roles" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"        text                     NOT NULL,
  "description" text,
  "is_active"   boolean                  NOT NULL DEFAULT true,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "leadership_roles_name_key" UNIQUE (name),
  CONSTRAINT "leadership_roles_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."leadership_roles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."member_departments" (
  "member_id"     uuid                     NOT NULL,
  "department_id" uuid                     NOT NULL,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "member_departments_pkey" PRIMARY KEY (member_id, department_id)
);

ALTER TABLE "public"."member_departments"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."member_leadership_roles" (
  "member_id"          uuid                     NOT NULL,
  "leadership_role_id" uuid                     NOT NULL,
  "created_at"         timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "member_leadership_roles_pkey" PRIMARY KEY (member_id, leadership_role_id)
);

ALTER TABLE "public"."member_leadership_roles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."members" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "member_id"     bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "first_name"    text                     NOT NULL,
  "last_name"     text                     NOT NULL,
  "gender"        text                     NOT NULL,
  "phone"         text,
  "email"         text,
  "address"       text,
  "date_of_birth" date,
  "family_id"     uuid,
  "is_worker"     boolean                  NOT NULL DEFAULT false,
  "is_leader"     boolean                  NOT NULL DEFAULT false,
  "is_active"     boolean                  NOT NULL DEFAULT true,
  "notes"         text,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "members_gender_check" CHECK ((gender = ANY (ARRAY['Male'::text, 'Female'::text]))),
  CONSTRAINT "members_member_id_key" UNIQUE (member_id),
  CONSTRAINT "members_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."members"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

ALTER TABLE "public"."member_departments"
  ADD CONSTRAINT "member_departments_department_id_fkey" FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;

ALTER TABLE "public"."member_leadership_roles"
  ADD CONSTRAINT "member_leadership_roles_leadership_role_id_fkey" FOREIGN KEY (leadership_role_id) REFERENCES public.leadership_roles(id) ON DELETE CASCADE;

ALTER TABLE "public"."members"
  ADD CONSTRAINT "members_family_id_fkey" FOREIGN KEY (family_id) REFERENCES public.church_families(id);

ALTER TABLE "public"."member_departments"
  ADD CONSTRAINT "member_departments_member_id_fkey" FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;

ALTER TABLE "public"."member_leadership_roles"
  ADD CONSTRAINT "member_leadership_roles_member_id_fkey" FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;

CREATE INDEX member_departments_department_id_idx ON public.member_departments USING btree (department_id);

CREATE INDEX member_leadership_roles_role_id_idx ON public.member_leadership_roles USING btree (leadership_role_id);

CREATE INDEX members_family_id_idx ON public.members USING btree (family_id);

CREATE INDEX members_first_name_idx ON public.members USING btree (first_name);

CREATE INDEX members_is_active_idx ON public.members USING btree (is_active);

CREATE INDEX members_is_leader_idx ON public.members USING btree (is_leader);

CREATE INDEX members_is_worker_idx ON public.members USING btree (is_worker);

CREATE INDEX members_last_name_idx ON public.members USING btree (last_name);

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE POLICY "Authenticated users can manage families" ON "public"."church_families"
  FOR ALL
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view families" ON "public"."church_families"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "Authenticated users can manage departments" ON "public"."departments"
  FOR ALL
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view departments" ON "public"."departments"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "Authenticated users can manage leadership roles" ON "public"."leadership_roles"
  FOR ALL
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view leadership roles" ON "public"."leadership_roles"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "Authenticated users can manage member departments" ON "public"."member_departments"
  FOR ALL
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view member departments" ON "public"."member_departments"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "Authenticated users can manage member leadership roles" ON "public"."member_leadership_roles"
  FOR ALL
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view member leadership roles" ON "public"."member_leadership_roles"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "Authenticated users can manage members" ON "public"."members"
  FOR ALL
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view members" ON "public"."members"
  FOR SELECT
  TO "authenticated"
  USING (true);

GRANT EXECUTE ON FUNCTION "public"."update_updated_at"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."church_families" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."departments" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."leadership_roles" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."member_departments" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."member_leadership_roles" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."members" TO "anon", "authenticated", "postgres", "service_role";


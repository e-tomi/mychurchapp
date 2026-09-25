CREATE TABLE "public"."admin_profiles" (
  "id"         uuid                     NOT NULL,
  "full_name"  text                     NOT NULL,
  "email"      text                     NOT NULL,
  "role"       text                     NOT NULL DEFAULT 'admin'::text,
  "is_active"  boolean                  NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "admin_profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "admin_profiles_role_check" CHECK ((role = 'admin'::text))
);

ALTER TABLE "public"."admin_profiles"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."admin_profiles"
  ADD CONSTRAINT "admin_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE POLICY "Admins can update their own profile" ON "public"."admin_profiles"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = id))
  WITH CHECK ((auth.uid() = id));

CREATE POLICY "Admins can view their own profile" ON "public"."admin_profiles"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."admin_profiles" TO "anon", "authenticated", "postgres", "service_role";


-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (allows re-running this script)
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners can delete organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can view memberships in their organizations" ON public.memberships;
DROP POLICY IF EXISTS "Users can create their own membership" ON public.memberships;
DROP POLICY IF EXISTS "Owners and admins can update memberships" ON public.memberships;
DROP POLICY IF EXISTS "Owners and admins can delete memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can view projects in their organizations" ON public.projects;
DROP POLICY IF EXISTS "Owners and admins can create projects" ON public.projects;
DROP POLICY IF EXISTS "Owners and admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own identities" ON public.identities;
DROP POLICY IF EXISTS "Users can insert their own identities" ON public.identities;
DROP POLICY IF EXISTS "Users can update their own identities" ON public.identities;
DROP POLICY IF EXISTS "Users can delete their own identities" ON public.identities;
DROP POLICY IF EXISTS "Users can manage their own identities" ON public.identities;
DROP POLICY IF EXISTS "Users can view drafts in their organization's projects" ON public.drafts;
DROP POLICY IF EXISTS "Users can create drafts in their organization's projects" ON public.drafts;
DROP POLICY IF EXISTS "Users can update their own drafts" ON public.drafts;
DROP POLICY IF EXISTS "Users can delete their own drafts" ON public.drafts;
DROP POLICY IF EXISTS "Users can view posts in their organization's projects" ON public.posts;
DROP POLICY IF EXISTS "Members can create posts in their organization's projects" ON public.posts;
DROP POLICY IF EXISTS "Owners and admins can publish posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- Users table policies
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id);

-- Organizations table policies
CREATE POLICY "Users can view organizations they belong to"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.organization_id = organizations.id
      AND memberships.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update organizations"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.organization_id = organizations.id
      AND memberships.user_id = auth.uid()::text
      AND memberships.role = 'owner'
    )
  );

CREATE POLICY "Owners can delete organizations"
  ON public.organizations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.organization_id = organizations.id
      AND memberships.user_id = auth.uid()::text
      AND memberships.role = 'owner'
    )
  );

-- Memberships table policies
-- Note: These policies are simpler to avoid infinite recursion
-- Users can view their own memberships
CREATE POLICY "Users can view their own memberships"
  ON public.memberships FOR SELECT
  USING (user_id = auth.uid()::text);

-- Users can create their own memberships (needed when creating organizations)
CREATE POLICY "Users can insert their own memberships"
  ON public.memberships FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- For now, prevent updates and deletes via RLS
-- These should be handled by service role or admin functions
-- To enable, you'd need a separate admin table or use a security definer function

-- Projects table policies
CREATE POLICY "Users can view projects in their organizations"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.organization_id = projects.organization_id
      AND memberships.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Owners and admins can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.organization_id = projects.organization_id
      AND memberships.user_id = auth.uid()::text
      AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can update projects"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.organization_id = projects.organization_id
      AND memberships.user_id = auth.uid()::text
      AND memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners can delete projects"
  ON public.projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.organization_id = projects.organization_id
      AND memberships.user_id = auth.uid()::text
      AND memberships.role = 'owner'
    )
  );

-- Identities table policies (users can only see their own OAuth tokens)
CREATE POLICY "Users can view their own identities"
  ON public.identities FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own identities"
  ON public.identities FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own identities"
  ON public.identities FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own identities"
  ON public.identities FOR DELETE
  USING (user_id = auth.uid()::text);

-- Drafts table policies
CREATE POLICY "Users can view drafts in their organization's projects"
  ON public.drafts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.memberships m ON m.organization_id = p.organization_id
      WHERE p.id = drafts.project_id
      AND m.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create drafts in their organization's projects"
  ON public.drafts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.memberships m ON m.organization_id = p.organization_id
      WHERE p.id = drafts.project_id
      AND m.user_id = auth.uid()::text
    )
    AND created_by = auth.uid()::text
  );

CREATE POLICY "Users can update their own drafts"
  ON public.drafts FOR UPDATE
  USING (created_by = auth.uid()::text);

CREATE POLICY "Users can delete their own drafts"
  ON public.drafts FOR DELETE
  USING (created_by = auth.uid()::text);

-- Posts table policies
CREATE POLICY "Users can view posts in their organization's projects"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.memberships m ON m.organization_id = p.organization_id
      WHERE p.id = posts.project_id
      AND m.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Members can create posts in their organization's projects"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.memberships m ON m.organization_id = p.organization_id
      WHERE p.id = posts.project_id
      AND m.user_id = auth.uid()::text
    )
    AND created_by = auth.uid()::text
  );

CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (created_by = auth.uid()::text);

CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  USING (created_by = auth.uid()::text);

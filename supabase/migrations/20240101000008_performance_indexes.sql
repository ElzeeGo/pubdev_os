-- Performance optimization indexes
-- Add composite indexes for commonly queried columns together

-- Composite indexes for drafts ordering and filtering
CREATE INDEX IF NOT EXISTS idx_drafts_project_created ON public.drafts(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_status_created ON public.drafts(project_id, status, created_at DESC);

-- Composite indexes for posts ordering and filtering  
CREATE INDEX IF NOT EXISTS idx_posts_project_created ON public.posts(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status_created ON public.posts(project_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_draft_created ON public.posts(draft_id, created_at DESC);

-- Index for membership lookups with organization
CREATE INDEX IF NOT EXISTS idx_memberships_org_user ON public.memberships(organization_id, user_id);

-- Index for projects by organization with ordering
CREATE INDEX IF NOT EXISTS idx_projects_org_created ON public.projects(organization_id, created_at DESC);

-- Analyze tables to update statistics
ANALYZE public.drafts;
ANALYZE public.posts;
ANALYZE public.projects;
ANALYZE public.memberships;
ANALYZE public.organizations;


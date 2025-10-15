-- RLS Performance Optimization Notes
-- This file documents how the composite indexes improve RLS policy performance

-- The composite indexes created in 008_performance_indexes.sql help optimize:

-- 1. Draft queries with RLS filters
-- Index: idx_drafts_project_created (project_id, created_at DESC)
-- Benefits policies:
--   - "Users can view drafts in their organization's projects" 
--   - Speeds up queries that filter by project_id and order by created_at

-- 2. Post queries with RLS filters  
-- Index: idx_posts_project_created (project_id, created_at DESC)
-- Benefits policies:
--   - "Users can view posts in their organization's projects"
--   - Speeds up queries that filter by project_id and order by created_at

-- 3. Membership lookups in RLS policies
-- Index: idx_memberships_org_user (organization_id, user_id)
-- Benefits policies:
--   - All policies that check "EXISTS (SELECT 1 FROM memberships WHERE...)"
--   - Dramatically speeds up authorization checks

-- 4. Project queries
-- Index: idx_projects_org_created (organization_id, created_at DESC)
-- Benefits policies:
--   - "Users can view projects in their organizations"
--   - Speeds up queries that filter by organization_id

-- Note: The existing RLS policies are already well-structured.
-- No policy changes needed - the composite indexes will automatically
-- be used by the PostgreSQL query planner.

-- Additional optimization: Consider adding a materialized view for frequently
-- accessed organization membership checks if performance is still an issue.


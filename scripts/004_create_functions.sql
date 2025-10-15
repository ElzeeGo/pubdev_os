-- Function to create organization with membership atomically
-- Uses SECURITY DEFINER to bypass RLS in a controlled way
CREATE OR REPLACE FUNCTION public.create_organization_with_membership(
  org_name TEXT,
  org_slug TEXT,
  user_id TEXT
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  slug TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id TEXT;
  new_org public.organizations;
BEGIN
  -- Verify the user exists and is authenticated
  IF user_id IS NULL OR user_id = '' THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Verify the user making the request is the same user
  IF auth.uid()::text != user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Check if slug already exists
  IF EXISTS (SELECT 1 FROM public.organizations WHERE organizations.slug = org_slug) THEN
    RAISE EXCEPTION 'Organization slug already exists';
  END IF;

  -- Create the organization
  INSERT INTO public.organizations (name, slug)
  VALUES (org_name, org_slug)
  RETURNING * INTO new_org;

  -- Create the membership with owner role
  INSERT INTO public.memberships (user_id, organization_id, role)
  VALUES (user_id, new_org.id, 'owner');

  -- Return the organization
  RETURN QUERY SELECT 
    new_org.id,
    new_org.name,
    new_org.slug,
    new_org.created_at,
    new_org.updated_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_organization_with_membership(TEXT, TEXT, TEXT) TO authenticated;


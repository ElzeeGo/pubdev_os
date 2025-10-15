import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/organizations - List all organizations for the current user
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organizations where user is a member
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select('organization_id, role, organizations(*)')
      .eq('user_id', user.id);

    if (membershipsError) {
      console.error('Error fetching organizations:', membershipsError);
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      );
    }

    // Transform the data to include organizations with their roles
    const organizations = memberships.map((membership) => ({
      ...membership.organizations,
      role: membership.role,
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create a new organization
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, slug } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json(
        { error: 'Organization slug is required' },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase, alphanumeric, hyphens only)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          error:
            'Slug must contain only lowercase letters, numbers, and hyphens',
        },
        { status: 400 }
      );
    }

    // Use database function to create organization and membership atomically
    // This bypasses RLS in a controlled way using SECURITY DEFINER
    const result = (await (supabase as any).rpc(
      'create_organization_with_membership',
      {
        org_name: name.trim(),
        org_slug: slug.trim(),
        user_id: user.id,
      }
    )) as {
      data: Array<{
        id: string;
        name: string;
        slug: string;
        created_at: string;
        updated_at: string;
      }> | null;
      error: any;
    };

    const { data: organizations, error: createError } = result;

    if (createError) {
      console.error('Error creating organization:', createError);
      
      // Check for specific error messages
      if (createError.message?.includes('slug already exists')) {
        return NextResponse.json(
          { error: 'An organization with this slug already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      );
    }

    // The RPC returns an array, get the first item
    const organizationData =
      organizations && Array.isArray(organizations)
        ? organizations[0]
        : organizations;

    if (!organizationData) {
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      );
    }

    const organization = {
      id: organizationData.id,
      name: organizationData.name,
      slug: organizationData.slug,
      created_at: organizationData.created_at,
      updated_at: organizationData.updated_at,
    };

    return NextResponse.json(
      {
        organization: {
          ...organization,
          role: 'owner',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


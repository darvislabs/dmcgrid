import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { UserRole } from '@dmcgrid/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const roleCookie = request.cookies.get('dmc_role')?.value as UserRole | undefined;
    const targetUserId =
      user?.id ||
      (roleCookie === 'dmc'
        ? 'd1111111-1111-1111-1111-111111111111'
        : 'a1111111-1111-1111-1111-111111111111');

    const adminClient = createAdminClient();

    // 1. Fetch recent notifications for target user
    const { data: notifications, error } = await (adminClient as any)
      .from('notifications')
      .select('id, recipient_id, title, body, type, link, is_read, read_at, created_at')
      .eq('recipient_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const unreadCount = (notifications || []).filter((n: any) => !n.is_read).length;

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const roleCookie = request.cookies.get('dmc_role')?.value as UserRole | undefined;
    const targetUserId =
      user?.id ||
      (roleCookie === 'dmc'
        ? 'd1111111-1111-1111-1111-111111111111'
        : 'a1111111-1111-1111-1111-111111111111');

    const adminClient = createAdminClient();

    // If specific IDs provided, mark them read; otherwise mark all unread for this recipient
    if (ids.length > 0) {
      const { data, error } = await (adminClient as any).rpc('mark_notifications_read', {
        p_ids: ids,
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, result: data });
    } else {
      // Find all unread IDs for this user
      const { data: unreadRows } = await (adminClient as any)
        .from('notifications')
        .select('id')
        .eq('recipient_id', targetUserId)
        .eq('is_read', false);

      const unreadIds = (unreadRows || []).map((r: any) => r.id);

      if (unreadIds.length > 0) {
        const { data, error } = await (adminClient as any).rpc('mark_notifications_read', {
          p_ids: unreadIds,
        });

        if (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, result: data });
      }

      return NextResponse.json({ success: true, result: { marked_read: 0 } });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to mark notifications read' },
      { status: 500 }
    );
  }
}

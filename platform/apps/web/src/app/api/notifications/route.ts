import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch recent notifications for target user
    const { data: notifications, error } = await (supabase as any)
      .from('notifications')
      .select('id, recipient_id, title, body, type, link, is_read, read_at, created_at')
      .eq('recipient_id', user.id)
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

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // If specific IDs provided, mark them read; otherwise mark all unread for this recipient
    if (ids.length > 0) {
      const { data, error } = await (supabase as any).rpc('mark_notifications_read', {
        p_ids: ids,
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, result: data });
    } else {
      // Mark all unread for current user via RPC
      const { data, error } = await (supabase as any).rpc('mark_notifications_read', {
        p_ids: [],
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, result: data });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to mark notifications read' },
      { status: 500 }
    );
  }
}

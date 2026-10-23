'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Badge } from '@dmcgrid/ui';
import {
  Bell,
  CheckCheck,
  Trophy,
  Send,
  Eye,
  Compass,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  recipient_id: string;
  title: string;
  body: string;
  type: string;
  link: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

function formatRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'deal_won':
      return <Trophy className="w-3.5 h-3.5 text-[var(--accent-gold)]" />;
    case 'deal_lost':
      return <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />;
    case 'quote_received':
    case 'quote_submitted':
      return <Send className="w-3.5 h-3.5 text-[#10B981]" />;
    case 'proposal_viewed':
      return <Eye className="w-3.5 h-3.5 text-[#0EA5A3]" />;
    case 'rfq_matched':
      return <Compass className="w-3.5 h-3.5 text-[#3B82F6]" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />;
  }
}

export function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch {
      // Quiet background polling error handling
    }
  };

  // Initial fetch and 30-second client-side polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [] }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      // Optimistically update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Persist to server
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [notif.id] }),
      }).catch(() => {});
    }

    setIsOpen(false);
    if (notif.link) {
      startTransition(() => {
        router.push(notif.link!);
      });
    }
  };

  const handleMarkSingleRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    }).catch(() => {});
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className="relative p-2 rounded-[9px] border border-[var(--border-line)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer active:scale-[0.97]"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[var(--accent-gold)] text-[var(--bg-page)] text-[10px] font-mono font-bold leading-none shadow-sm animate-in zoom-in-50 duration-160">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[380px] max-w-[90vw] rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-card)] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-160">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-xs tracking-tight text-[var(--text-primary)]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <Badge variant="gold" className="text-[10px] py-0 px-1.5 h-4">
                  {unreadCount} unread
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={isLoading}
                className="h-7 px-2 text-[11px] gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[28px]"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </Button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[var(--border-subtle)] scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-30 text-[var(--text-muted)]" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left ${
                    notif.is_read
                      ? 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]'
                      : 'bg-[var(--bg-elevated)]/60 hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-line)] shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs font-medium leading-snug truncate ${
                          notif.is_read
                            ? 'text-[var(--text-secondary)]'
                            : 'text-[var(--text-primary)] font-semibold'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] shrink-0">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {notif.body}
                    </p>

                    {notif.link && (
                      <div className="pt-1 flex items-center gap-1 text-[10px] font-mono text-[var(--accent-gold)]">
                        <span>View Details →</span>
                      </div>
                    )}
                  </div>

                  {!notif.is_read && (
                    <button
                      onClick={(e) => handleMarkSingleRead(e, notif.id)}
                      title="Mark as read"
                      aria-label="Mark notification as read"
                      className="shrink-0 p-1 rounded hover:bg-[var(--bg-card)] text-[var(--accent-gold)] hover:text-[var(--text-primary)] transition-colors mt-0.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)] block" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

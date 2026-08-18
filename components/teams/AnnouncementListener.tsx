'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import AnnouncementPopup from './AnnouncementPopup';

export default function AnnouncementListener() {
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = createClient();
    
    // Process new announcements, using sessionStorage to avoid duplicates on refresh
    const processAnnouncement = (id: string, text: string) => {
      const lastSeen = sessionStorage.getItem('lastSeenAnnouncementId');
      if (lastSeen !== id) {
        setMessage(text);
        setActive(true);
        sessionStorage.setItem('lastSeenAnnouncementId', id);
      }
    };

    // 1. Fetch latest announcement on mount for late joiners
    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, message')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (!error && data) {
        processAnnouncement(data.id, data.message);
      }
    };
    
    fetchLatest();

    // 2. Subscribe to new insertions via Realtime
    const channel = supabase
      .channel('public:announcements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        (payload) => {
          const newRecord = payload.new as { id: string; message: string };
          if (newRecord && newRecord.id) {
            processAnnouncement(newRecord.id, newRecord.message);
          }
        }
      )
      .subscribe();

    // 3. Cleanup to prevent N+1 subscriptions (critical for memory/performance)
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AnnouncementPopup 
      active={active} 
      message={message} 
      onClose={() => setActive(false)} 
    />
  );
}

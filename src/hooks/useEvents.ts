import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  scheduled_date: string;
  duration_minutes: number | null;
  location: string | null;
  instructor: string | null;
  max_attendees: number | null;
  is_active: boolean;
  live_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'live_session_id'>;
export type EventUpdate = Partial<EventInsert & { is_active: boolean }>;

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await (supabase
      .from('events' as any)
      .select('*')
      .eq('is_active', true)
      .order('scheduled_date', { ascending: true }) as any);

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, refetch: fetchEvents };
}

export function useAllEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await (supabase
      .from('events' as any)
      .select('*')
      .order('scheduled_date', { ascending: true }) as any);

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const createEvent = async (event: EventInsert) => {
    const { data, error } = await (supabase
      .from('events' as any)
      .insert(event)
      .select()
      .single() as any);

    if (error) {
      return { success: false, error: error.message };
    }
    await fetchEvents();
    return { success: true, data };
  };

  const updateEvent = async (id: string, updates: EventUpdate) => {
    const { error } = await (supabase
      .from('events' as any)
      .update(updates)
      .eq('id', id) as any);

    if (error) {
      return { success: false, error: error.message };
    }
    await fetchEvents();
    return { success: true };
  };

  const deleteEvent = async (id: string) => {
    const { error } = await (supabase
      .from('events' as any)
      .delete()
      .eq('id', id) as any);

    if (error) {
      return { success: false, error: error.message };
    }
    await fetchEvents();
    return { success: true };
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}

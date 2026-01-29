import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AppSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useAppSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_settings')
      .select('*');

    if (error) {
      console.error('Error fetching app settings:', error);
    } else {
      const settingsMap: Record<string, string> = {};
      data?.forEach((setting: AppSetting) => {
        settingsMap[setting.key] = setting.value || '';
      });
      setSettings(settingsMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, refetch: fetchSettings };
}

export function useAdminAppSettings() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('key');

    if (error) {
      console.error('Error fetching app settings:', error);
    } else {
      setSettings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('app_settings')
      .update({ value })
      .eq('key', key);

    if (error) {
      return { success: false, error: error.message };
    }
    await fetchSettings();
    return { success: true };
  };

  const getSetting = (key: string): string => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || '';
  };

  return { settings, loading, updateSetting, getSetting, refetch: fetchSettings };
}

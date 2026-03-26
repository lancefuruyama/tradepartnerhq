import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MOCK_AWARDS } from '../data/mockAwards';
import type { ProjectAward } from '../types/award';

export function useAwards() {
  const [awards, setAwards] = useState<ProjectAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('project_awards')
          .select('*')
          .order('award_date', { ascending: false });

        if (error || !data || data.length === 0) {
          setAwards(MOCK_AWARDS);
          setIsLive(false);
        } else {
          setAwards(data as ProjectAward[]);
          setIsLive(true);
        }
      } catch {
        setAwards(MOCK_AWARDS);
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { awards, loading, isLive };
}

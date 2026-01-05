import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  name: string;
  slug: string;
}

export interface Project {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  companies?: Company;
}

export interface Template {
  id: string;
  name: string;
  icon: string;
  description: string | null;
}

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Company[];
    },
  });
}

export function useProjects(companyId?: string) {
  return useQuery({
    queryKey: ['projects', companyId],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*, companies(id, name, slug)')
        .order('name');
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Project[];
    },
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Template[];
    },
  });
}
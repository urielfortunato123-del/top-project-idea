import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PhotoTreeNode {
  id: string;
  name: string;
  type: 'company' | 'user' | 'month' | 'day' | 'template' | 'photo';
  count: number;
  children?: PhotoTreeNode[];
  data?: any;
}

export interface PhotoWithMeta {
  id: string;
  company_id: string;
  company_name: string;
  project_id: string;
  project_name: string;
  user_id: string;
  user_name: string;
  template_id: string | null;
  template_name: string | null;
  template_icon: string | null;
  device_timestamp: string;
  file_url: string;
  ocr_status: string | null;
  ocr_confidence: number | null;
  activity_text: string | null;
  latitude: number | null;
  longitude: number | null;
}

export function useAllPhotosWithMeta() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['all_photos_meta', isAdmin],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photo_records')
        .select(`
          id,
          company_id,
          project_id,
          user_id,
          template_id,
          device_timestamp,
          file_url,
          ocr_status,
          ocr_confidence,
          activity_text,
          latitude,
          longitude,
          companies(name),
          projects(name),
          templates(name, icon)
        `)
        .order('device_timestamp', { ascending: false });
      
      if (error) throw error;

      // Fetch all user names
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      
      return data.map(photo => ({
        id: photo.id,
        company_id: photo.company_id,
        company_name: (photo.companies as any)?.name || 'Sem empresa',
        project_id: photo.project_id,
        project_name: (photo.projects as any)?.name || 'Sem projeto',
        user_id: photo.user_id,
        user_name: profileMap.get(photo.user_id) || 'Usuário desconhecido',
        template_id: photo.template_id,
        template_name: (photo.templates as any)?.name || null,
        template_icon: (photo.templates as any)?.icon || null,
        device_timestamp: photo.device_timestamp,
        file_url: photo.file_url,
        ocr_status: photo.ocr_status,
        ocr_confidence: photo.ocr_confidence,
        activity_text: photo.activity_text,
        latitude: photo.latitude,
        longitude: photo.longitude,
      })) as PhotoWithMeta[];
    },
    enabled: isAdmin,
  });
}

export function buildPhotoTree(photos: PhotoWithMeta[]): PhotoTreeNode[] {
  const tree: PhotoTreeNode[] = [];
  
  // Group by company
  const byCompany = new Map<string, PhotoWithMeta[]>();
  photos.forEach(photo => {
    const key = photo.company_id;
    if (!byCompany.has(key)) byCompany.set(key, []);
    byCompany.get(key)!.push(photo);
  });
  
  byCompany.forEach((companyPhotos, companyId) => {
    const companyNode: PhotoTreeNode = {
      id: companyId,
      name: companyPhotos[0].company_name,
      type: 'company',
      count: companyPhotos.length,
      children: [],
    };
    
    // Group by user
    const byUser = new Map<string, PhotoWithMeta[]>();
    companyPhotos.forEach(photo => {
      const key = photo.user_id;
      if (!byUser.has(key)) byUser.set(key, []);
      byUser.get(key)!.push(photo);
    });
    
    byUser.forEach((userPhotos, userId) => {
      const userNode: PhotoTreeNode = {
        id: userId,
        name: userPhotos[0].user_name,
        type: 'user',
        count: userPhotos.length,
        children: [],
      };
      
      // Group by month
      const byMonth = new Map<string, PhotoWithMeta[]>();
      userPhotos.forEach(photo => {
        const date = new Date(photo.device_timestamp);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!byMonth.has(key)) byMonth.set(key, []);
        byMonth.get(key)!.push(photo);
      });
      
      Array.from(byMonth.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .forEach(([month, monthPhotos]) => {
          const monthNode: PhotoTreeNode = {
            id: `${userId}-${month}`,
            name: month,
            type: 'month',
            count: monthPhotos.length,
            children: [],
          };
          
          // Group by day
          const byDay = new Map<string, PhotoWithMeta[]>();
          monthPhotos.forEach(photo => {
            const date = new Date(photo.device_timestamp);
            const key = date.toISOString().split('T')[0];
            if (!byDay.has(key)) byDay.set(key, []);
            byDay.get(key)!.push(photo);
          });
          
          Array.from(byDay.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .forEach(([day, dayPhotos]) => {
              const dayNode: PhotoTreeNode = {
                id: `${userId}-${day}`,
                name: day.split('-').reverse().join('/'),
                type: 'day',
                count: dayPhotos.length,
                children: [],
              };
              
              // Group by template
              const byTemplate = new Map<string | null, PhotoWithMeta[]>();
              dayPhotos.forEach(photo => {
                const key = photo.template_id;
                if (!byTemplate.has(key)) byTemplate.set(key, []);
                byTemplate.get(key)!.push(photo);
              });
              
              byTemplate.forEach((templatePhotos, templateId) => {
                const templateNode: PhotoTreeNode = {
                  id: `${userId}-${day}-${templateId || 'geral'}`,
                  name: templatePhotos[0].template_name 
                    ? `${templatePhotos[0].template_icon} ${templatePhotos[0].template_name}`
                    : '📷 Geral',
                  type: 'template',
                  count: templatePhotos.length,
                  children: templatePhotos.map(photo => ({
                    id: photo.id,
                    name: new Date(photo.device_timestamp).toLocaleTimeString('pt-BR'),
                    type: 'photo' as const,
                    count: 0,
                    data: photo,
                  })),
                };
                
                dayNode.children!.push(templateNode);
              });
              
              monthNode.children!.push(dayNode);
            });
          
          userNode.children!.push(monthNode);
        });
      
      companyNode.children!.push(userNode);
    });
    
    tree.push(companyNode);
  });
  
  return tree;
}

// Admin stats
export function useAdminStats() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      // Get photo counts by status
      const { data: photos, error } = await supabase
        .from('photo_records')
        .select('id, ocr_status, ocr_confidence, user_id, created_at');
      
      if (error) throw error;
      
      // Get user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Get company count
      const { count: companyCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });
      
      // Get project count
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      
      // Calculate stats
      const totalPhotos = photos?.length || 0;
      const processedPhotos = photos?.filter(p => p.ocr_status === 'completed').length || 0;
      const pendingPhotos = photos?.filter(p => p.ocr_status === 'pending' || p.ocr_status === 'processing').length || 0;
      const errorPhotos = photos?.filter(p => p.ocr_status === 'error').length || 0;
      
      const avgConfidence = photos
        ?.filter(p => p.ocr_confidence !== null)
        .reduce((sum, p) => sum + (p.ocr_confidence || 0), 0) / 
        (photos?.filter(p => p.ocr_confidence !== null).length || 1);
      
      // Photos by user
      const byUser = new Map<string, number>();
      photos?.forEach(p => {
        byUser.set(p.user_id, (byUser.get(p.user_id) || 0) + 1);
      });
      
      // Photos today
      const today = new Date().toISOString().split('T')[0];
      const photosToday = photos?.filter(p => p.created_at?.startsWith(today)).length || 0;
      
      return {
        totalPhotos,
        processedPhotos,
        pendingPhotos,
        errorPhotos,
        avgConfidence: Math.round(avgConfidence),
        userCount: userCount || 0,
        companyCount: companyCount || 0,
        projectCount: projectCount || 0,
        photosToday,
        photosByUser: Array.from(byUser.entries()).map(([userId, count]) => ({
          userId,
          count,
        })),
      };
    },
    enabled: isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

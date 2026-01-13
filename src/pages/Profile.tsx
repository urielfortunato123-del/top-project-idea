import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePhotoRecords, usePendingPhotos } from '@/hooks/usePhotos';
import { useLanguage } from '@/i18n/LanguageContext';
import { BottomNav } from '@/components/BottomNav';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  User, 
  LogOut, 
  Camera, 
  HardHat,
  Shield,
  RefreshCw,
  Settings
} from 'lucide-react';

export default function Profile() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const { data: photos = [] } = usePhotoRecords();
  const { data: pending = [] } = usePendingPhotos();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with avatar */}
      <header className="bg-gradient-to-b from-primary/10 to-background pt-8 pb-6 px-4">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-glow">
              <User className="h-12 w-12 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-md border-2 border-background">
              <HardHat className="h-4 w-4 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-xl font-bold">{profile?.full_name}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize flex items-center gap-1">
            {role === 'admin' && <Shield className="h-3 w-3" />}
            {role === 'admin' ? t.administrator : 'Colaborador'}
          </span>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {t.dashboard.summary}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{photos.length}</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.sentLabel}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{pending.length}</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.pendingLabel}</p>
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t.profile.settings}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageSelector />
          </CardContent>
        </Card>

        {/* Update App Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            toast.info(t.loading);
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistration().then((registration) => {
                if (registration) {
                  registration.update().then(() => {
                    toast.success(t.success);
                    setTimeout(() => window.location.reload(), 500);
                  }).catch(() => {
                    window.location.reload();
                  });
                } else {
                  window.location.reload();
                }
              });
            } else {
              window.location.reload();
            }
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {t.dashboard.sync}
        </Button>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t.profile.logout}
        </Button>

        {/* App Info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>ObraPhoto Mobile v1.0.0</p>
          <p>PWA • Registro Técnico de Campo</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

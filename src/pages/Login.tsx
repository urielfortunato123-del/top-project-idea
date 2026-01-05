import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, HardHat } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);

    if (success) {
      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso.',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Erro no login',
        description: 'E-mail ou senha incorretos.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 animate-fade-in">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
            <Camera className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-md">
            <HardHat className="h-4 w-4 text-accent-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">ObraPhoto</h1>
        <p className="text-muted-foreground text-sm">Registro Técnico de Campo</p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-sm animate-slide-in-bottom">
        <CardHeader className="text-center">
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Acesse sua conta para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Demo:</p>
            <p>uriel@obraphoto.com / 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
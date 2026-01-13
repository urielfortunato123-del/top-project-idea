import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, HardHat, Fingerprint, ScanFace, Smartphone, Globe } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

export default function Auth() {
  const { user, isLoading, signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enableBiometric, setEnableBiometric] = useState(false);

  // Biometric auth hook
  const {
    isAvailable: biometricAvailable,
    isRegistered: biometricRegistered,
    isLoading: biometricLoading,
    registerBiometric,
    authenticateWithBiometric,
    removeBiometric,
    getRegisteredEmail,
  } = useBiometricAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');

  // Pre-fill email if biometric is registered
  useEffect(() => {
    if (biometricRegistered) {
      const email = getRegisteredEmail();
      if (email) {
        setLoginEmail(email);
      }
    }
  }, [biometricRegistered, getRegisteredEmail]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleBiometricLogin = async () => {
    setIsSubmitting(true);
    
    const credentials = await authenticateWithBiometric();
    
    if (credentials) {
      const { error } = await signIn(credentials.email, credentials.password);
      
      if (error) {
        toast({
          title: 'Erro no login biométrico',
          description: 'Não foi possível autenticar. Tente novamente com senha.',
          variant: 'destructive',
        });
        // Remove invalid biometric data
        removeBiometric();
      }
    } else {
      toast({
        title: 'Autenticação cancelada',
        description: 'Use sua senha para entrar.',
        variant: 'destructive',
      });
    }
    
    setIsSubmitting(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse({ email: loginEmail, password: loginPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Erro de validação',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      let message = 'Erro ao fazer login';
      if (error.message.includes('Invalid login credentials')) {
        message = 'E-mail ou senha incorretos';
      }
      toast({
        title: 'Erro no login',
        description: message,
        variant: 'destructive',
      });
    } else if (enableBiometric && biometricAvailable) {
      // Register biometric after successful login
      const registered = await registerBiometric(loginEmail, loginPassword);
      if (registered) {
        toast({
          title: 'Biometria ativada!',
          description: 'Próximo login pode usar digital ou Face ID.',
        });
      }
    }

    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      signupSchema.parse({
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        fullName: signupFullName,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Erro de validação',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, signupFullName);

    if (error) {
      let message = 'Erro ao criar conta';
      if (error.message.includes('already registered')) {
        message = 'Este e-mail já está cadastrado';
      }
      toast({
        title: 'Erro no cadastro',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Conta criada!',
        description: 'Você já pode fazer login.',
      });
    }

    setIsSubmitting(false);
  };

  const handleRemoveBiometric = () => {
    removeBiometric();
    toast({
      title: 'Biometria removida',
      description: 'O acesso biométrico foi desativado.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Language selector - top right */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Link 
          to="/landing" 
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">International</span>
        </Link>
        <LanguageSelector showLabel={false} />
      </div>

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

      {/* Auth Card */}
      <Card className="w-full max-w-sm animate-slide-up glass-card">
        <Tabs defaultValue="login">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t.auth.login}</TabsTrigger>
              <TabsTrigger value="signup">{t.auth.signup}</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              {/* Biometric Quick Login Button */}
              {biometricAvailable && biometricRegistered && !biometricLoading && (
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full h-16 relative overflow-hidden group",
                      "border-primary/30 hover:border-primary/60",
                      "bg-gradient-to-r from-primary/5 to-accent/5"
                    )}
                    onClick={handleBiometricLogin}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Fingerprint className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                        <ScanFace className="h-4 w-4 text-accent absolute -top-1 -right-1" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground">Entrar com Biometria</p>
                        <p className="text-xs text-muted-foreground">
                          Digital ou Face ID • {getRegisteredEmail()?.split('@')[0]}
                        </p>
                      </div>
                    </div>
                    {isSubmitting && (
                      <Loader2 className="absolute right-4 h-5 w-5 animate-spin text-primary" />
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">ou use senha</span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-secondary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="bg-secondary/30"
                  />
                </div>

                {/* Biometric toggle - only show if available and not registered */}
                {biometricAvailable && !biometricRegistered && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Salvar login</p>
                        <p className="text-xs text-muted-foreground">Usar biometria nas próximas vezes</p>
                      </div>
                    </div>
                    <Switch
                      checked={enableBiometric}
                      onCheckedChange={setEnableBiometric}
                    />
                  </div>
                )}

                {/* Remove biometric option */}
                {biometricRegistered && (
                  <button
                    type="button"
                    onClick={handleRemoveBiometric}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors w-full text-center"
                  >
                    Remover acesso biométrico
                  </button>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    required
                    autoComplete="name"
                    className="bg-secondary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-secondary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="bg-secondary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmar senha</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="bg-secondary/30"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Biometric info */}
      {biometricAvailable && (
        <p className="mt-4 text-xs text-muted-foreground text-center animate-fade-in">
          <Fingerprint className="h-3 w-3 inline mr-1" />
          Seu dispositivo suporta autenticação biométrica
        </p>
      )}
    </div>
  );
}

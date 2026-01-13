import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { landingTranslations } from '@/i18n/landingTranslations';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Cloud, 
  MapPin, 
  FileText, 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle2,
  ArrowRight,
  Building2,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';

const LandingPage = memo(function LandingPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = landingTranslations[language] || landingTranslations.en;

  const features = [
    {
      icon: Camera,
      title: t.features.capture.title,
      description: t.features.capture.description,
    },
    {
      icon: MapPin,
      title: t.features.gps.title,
      description: t.features.gps.description,
    },
    {
      icon: Cloud,
      title: t.features.sync.title,
      description: t.features.sync.description,
    },
    {
      icon: FileText,
      title: t.features.ocr.title,
      description: t.features.ocr.description,
    },
    {
      icon: Shield,
      title: t.features.security.title,
      description: t.features.security.description,
    },
    {
      icon: Zap,
      title: t.features.offline.title,
      description: t.features.offline.description,
    },
  ];

  const benefits = [
    t.benefits.item1,
    t.benefits.item2,
    t.benefits.item3,
    t.benefits.item4,
    t.benefits.item5,
    t.benefits.item6,
  ];

  const stats = [
    { value: '50K+', label: t.stats.photos },
    { value: '500+', label: t.stats.companies },
    { value: '99.9%', label: t.stats.uptime },
    { value: '24/7', label: t.stats.support },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              ObraPhoto
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSelector showLabel={false} className="hidden sm:block" />
            <Button 
              onClick={() => navigate('/')}
              variant="default"
              className="rounded-full px-6"
            >
              {t.cta.login}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            <Globe className="h-4 w-4 mr-2" />
            {t.hero.badge}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              {t.hero.title}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/')}
              className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {t.cta.startFree}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/')}
              className="rounded-full px-8 py-6 text-lg"
            >
              {t.cta.login}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.features.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t.benefits.title}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t.benefits.subtitle}
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <Building2 className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{t.useCases.construction}</h3>
                <p className="text-sm text-muted-foreground">{t.useCases.constructionDesc}</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-secondary/50 to-secondary/30">
                <Users className="h-8 w-8 text-foreground mb-3" />
                <h3 className="font-semibold mb-1">{t.useCases.teams}</h3>
                <p className="text-sm text-muted-foreground">{t.useCases.teamsDesc}</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-secondary/50 to-secondary/30">
                <Clock className="h-8 w-8 text-foreground mb-3" />
                <h3 className="font-semibold mb-1">{t.useCases.tracking}</h3>
                <p className="text-sm text-muted-foreground">{t.useCases.trackingDesc}</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <Sparkles className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{t.useCases.ai}</h3>
                <p className="text-sm text-muted-foreground">{t.useCases.aiDesc}</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.cta.ready}
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            {t.cta.readyDesc}
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => navigate('/')}
            className="rounded-full px-8 py-6 text-lg"
          >
            {t.cta.startNow}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <span className="font-semibold">ObraPhoto</span>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSelector showLabel={false} />
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 ObraPhoto. {t.footer.rights}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
});

export default LandingPage;

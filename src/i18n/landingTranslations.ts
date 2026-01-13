export type LandingTranslationKeys = {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
  };
  cta: {
    login: string;
    startFree: string;
    startNow: string;
    ready: string;
    readyDesc: string;
  };
  stats: {
    photos: string;
    companies: string;
    uptime: string;
    support: string;
  };
  features: {
    title: string;
    subtitle: string;
    capture: { title: string; description: string };
    gps: { title: string; description: string };
    sync: { title: string; description: string };
    ocr: { title: string; description: string };
    security: { title: string; description: string };
    offline: { title: string; description: string };
  };
  benefits: {
    title: string;
    subtitle: string;
    item1: string;
    item2: string;
    item3: string;
    item4: string;
    item5: string;
    item6: string;
  };
  useCases: {
    construction: string;
    constructionDesc: string;
    teams: string;
    teamsDesc: string;
    tracking: string;
    trackingDesc: string;
    ai: string;
    aiDesc: string;
  };
  footer: {
    rights: string;
  };
};

export const landingTranslations: Record<string, LandingTranslationKeys> = {
  pt: {
    hero: {
      badge: 'Disponível em 7 idiomas',
      title: 'Documente suas obras com precisão profissional',
      subtitle: 'Sistema completo de registro fotográfico para construção civil. GPS, carimbos automáticos, sincronização em nuvem e OCR inteligente.',
    },
    cta: {
      login: 'Entrar',
      startFree: 'Começar Grátis',
      startNow: 'Começar Agora',
      ready: 'Pronto para transformar sua gestão de obras?',
      readyDesc: 'Junte-se a centenas de empresas que já usam ObraPhoto para documentar seus projetos com eficiência.',
    },
    stats: {
      photos: 'Fotos registradas',
      companies: 'Empresas ativas',
      uptime: 'Disponibilidade',
      support: 'Suporte',
    },
    features: {
      title: 'Recursos Poderosos',
      subtitle: 'Tudo que você precisa para documentar obras de forma profissional',
      capture: {
        title: 'Captura Inteligente',
        description: 'Tire fotos com metadados automáticos: data, hora, coordenadas GPS e informações do projeto.',
      },
      gps: {
        title: 'Geolocalização Precisa',
        description: 'Registre a localização exata de cada foto com coordenadas GPS de alta precisão.',
      },
      sync: {
        title: 'Sincronização em Nuvem',
        description: 'Suas fotos são enviadas automaticamente para a nuvem, seguras e acessíveis de qualquer lugar.',
      },
      ocr: {
        title: 'OCR Inteligente',
        description: 'Extração automática de texto de placas, documentos e sinalizações nas fotos.',
      },
      security: {
        title: 'Segurança Total',
        description: 'Dados criptografados, backup automático e controle de acesso por empresa e projeto.',
      },
      offline: {
        title: 'Funciona Offline',
        description: 'Capture fotos mesmo sem internet. Tudo sincroniza automaticamente quando a conexão voltar.',
      },
    },
    benefits: {
      title: 'Por que escolher ObraPhoto?',
      subtitle: 'Desenvolvido especialmente para o setor de construção civil',
      item1: 'Elimine planilhas e organize fotos automaticamente',
      item2: 'Comprove avanços de obra com fotos geolocalizadas',
      item3: 'Gere relatórios profissionais em segundos',
      item4: 'Acesse de qualquer dispositivo, a qualquer hora',
      item5: 'Reduza retrabalho com documentação clara',
      item6: 'Integração fácil com sistemas existentes',
    },
    useCases: {
      construction: 'Construção Civil',
      constructionDesc: 'Documentação completa de obras',
      teams: 'Equipes em Campo',
      teamsDesc: 'Colaboração em tempo real',
      tracking: 'Acompanhamento',
      trackingDesc: 'Histórico detalhado de avanços',
      ai: 'Inteligência Artificial',
      aiDesc: 'OCR e análise automática',
    },
    footer: {
      rights: 'Todos os direitos reservados.',
    },
  },
  
  en: {
    hero: {
      badge: 'Available in 7 languages',
      title: 'Document your construction sites with professional precision',
      subtitle: 'Complete photo documentation system for construction. GPS, automatic stamps, cloud sync and intelligent OCR.',
    },
    cta: {
      login: 'Login',
      startFree: 'Start Free',
      startNow: 'Start Now',
      ready: 'Ready to transform your construction management?',
      readyDesc: 'Join hundreds of companies already using ObraPhoto to document their projects efficiently.',
    },
    stats: {
      photos: 'Photos captured',
      companies: 'Active companies',
      uptime: 'Uptime',
      support: 'Support',
    },
    features: {
      title: 'Powerful Features',
      subtitle: 'Everything you need to document construction projects professionally',
      capture: {
        title: 'Smart Capture',
        description: 'Take photos with automatic metadata: date, time, GPS coordinates and project information.',
      },
      gps: {
        title: 'Precise Geolocation',
        description: 'Record the exact location of each photo with high-precision GPS coordinates.',
      },
      sync: {
        title: 'Cloud Sync',
        description: 'Your photos are automatically uploaded to the cloud, secure and accessible from anywhere.',
      },
      ocr: {
        title: 'Intelligent OCR',
        description: 'Automatic text extraction from signs, documents and signage in photos.',
      },
      security: {
        title: 'Total Security',
        description: 'Encrypted data, automatic backup and access control by company and project.',
      },
      offline: {
        title: 'Works Offline',
        description: 'Capture photos even without internet. Everything syncs automatically when connection returns.',
      },
    },
    benefits: {
      title: 'Why choose ObraPhoto?',
      subtitle: 'Built specifically for the construction industry',
      item1: 'Eliminate spreadsheets and organize photos automatically',
      item2: 'Prove construction progress with geolocated photos',
      item3: 'Generate professional reports in seconds',
      item4: 'Access from any device, anytime',
      item5: 'Reduce rework with clear documentation',
      item6: 'Easy integration with existing systems',
    },
    useCases: {
      construction: 'Construction',
      constructionDesc: 'Complete site documentation',
      teams: 'Field Teams',
      teamsDesc: 'Real-time collaboration',
      tracking: 'Progress Tracking',
      trackingDesc: 'Detailed progress history',
      ai: 'Artificial Intelligence',
      aiDesc: 'OCR and automatic analysis',
    },
    footer: {
      rights: 'All rights reserved.',
    },
  },
  
  es: {
    hero: {
      badge: 'Disponible en 7 idiomas',
      title: 'Documente sus obras con precisión profesional',
      subtitle: 'Sistema completo de documentación fotográfica para construcción. GPS, sellos automáticos, sincronización en la nube y OCR inteligente.',
    },
    cta: {
      login: 'Iniciar Sesión',
      startFree: 'Empezar Gratis',
      startNow: 'Empezar Ahora',
      ready: '¿Listo para transformar su gestión de obras?',
      readyDesc: 'Únase a cientos de empresas que ya usan ObraPhoto para documentar sus proyectos con eficiencia.',
    },
    stats: {
      photos: 'Fotos capturadas',
      companies: 'Empresas activas',
      uptime: 'Disponibilidad',
      support: 'Soporte',
    },
    features: {
      title: 'Funciones Potentes',
      subtitle: 'Todo lo que necesita para documentar obras de forma profesional',
      capture: {
        title: 'Captura Inteligente',
        description: 'Tome fotos con metadatos automáticos: fecha, hora, coordenadas GPS e información del proyecto.',
      },
      gps: {
        title: 'Geolocalización Precisa',
        description: 'Registre la ubicación exacta de cada foto con coordenadas GPS de alta precisión.',
      },
      sync: {
        title: 'Sincronización en la Nube',
        description: 'Sus fotos se suben automáticamente a la nube, seguras y accesibles desde cualquier lugar.',
      },
      ocr: {
        title: 'OCR Inteligente',
        description: 'Extracción automática de texto de placas, documentos y señalizaciones en las fotos.',
      },
      security: {
        title: 'Seguridad Total',
        description: 'Datos cifrados, respaldo automático y control de acceso por empresa y proyecto.',
      },
      offline: {
        title: 'Funciona Sin Conexión',
        description: 'Capture fotos incluso sin internet. Todo se sincroniza automáticamente cuando vuelva la conexión.',
      },
    },
    benefits: {
      title: '¿Por qué elegir ObraPhoto?',
      subtitle: 'Desarrollado especialmente para el sector de la construcción',
      item1: 'Elimine hojas de cálculo y organice fotos automáticamente',
      item2: 'Compruebe avances de obra con fotos geolocalizadas',
      item3: 'Genere informes profesionales en segundos',
      item4: 'Acceda desde cualquier dispositivo, en cualquier momento',
      item5: 'Reduzca el retrabajo con documentación clara',
      item6: 'Fácil integración con sistemas existentes',
    },
    useCases: {
      construction: 'Construcción',
      constructionDesc: 'Documentación completa de obras',
      teams: 'Equipos en Campo',
      teamsDesc: 'Colaboración en tiempo real',
      tracking: 'Seguimiento',
      trackingDesc: 'Historial detallado de avances',
      ai: 'Inteligencia Artificial',
      aiDesc: 'OCR y análisis automático',
    },
    footer: {
      rights: 'Todos los derechos reservados.',
    },
  },
  
  ru: {
    hero: {
      badge: 'Доступно на 7 языках',
      title: 'Документируйте стройки с профессиональной точностью',
      subtitle: 'Полная система фотодокументации для строительства. GPS, автоматические штампы, облачная синхронизация и интеллектуальный OCR.',
    },
    cta: {
      login: 'Войти',
      startFree: 'Начать Бесплатно',
      startNow: 'Начать Сейчас',
      ready: 'Готовы преобразить управление строительством?',
      readyDesc: 'Присоединяйтесь к сотням компаний, которые уже используют ObraPhoto для эффективной документации проектов.',
    },
    stats: {
      photos: 'Фото сделано',
      companies: 'Активных компаний',
      uptime: 'Доступность',
      support: 'Поддержка',
    },
    features: {
      title: 'Мощные Функции',
      subtitle: 'Всё необходимое для профессиональной документации строительства',
      capture: {
        title: 'Умная Съёмка',
        description: 'Делайте фото с автоматическими метаданными: дата, время, GPS-координаты и информация о проекте.',
      },
      gps: {
        title: 'Точная Геолокация',
        description: 'Записывайте точное местоположение каждого фото с высокоточными GPS-координатами.',
      },
      sync: {
        title: 'Облачная Синхронизация',
        description: 'Ваши фото автоматически загружаются в облако, безопасны и доступны отовсюду.',
      },
      ocr: {
        title: 'Интеллектуальный OCR',
        description: 'Автоматическое извлечение текста с табличек, документов и вывесок на фото.',
      },
      security: {
        title: 'Полная Безопасность',
        description: 'Зашифрованные данные, автоматическое резервное копирование и контроль доступа по компании и проекту.',
      },
      offline: {
        title: 'Работает Офлайн',
        description: 'Делайте фото даже без интернета. Всё синхронизируется автоматически при восстановлении связи.',
      },
    },
    benefits: {
      title: 'Почему выбирают ObraPhoto?',
      subtitle: 'Разработано специально для строительной отрасли',
      item1: 'Избавьтесь от таблиц и организуйте фото автоматически',
      item2: 'Подтверждайте прогресс строительства геолокационными фото',
      item3: 'Создавайте профессиональные отчёты за секунды',
      item4: 'Доступ с любого устройства, в любое время',
      item5: 'Сократите переделки благодаря чёткой документации',
      item6: 'Простая интеграция с существующими системами',
    },
    useCases: {
      construction: 'Строительство',
      constructionDesc: 'Полная документация объектов',
      teams: 'Полевые Команды',
      teamsDesc: 'Совместная работа в реальном времени',
      tracking: 'Отслеживание',
      trackingDesc: 'Детальная история прогресса',
      ai: 'Искусственный Интеллект',
      aiDesc: 'OCR и автоматический анализ',
    },
    footer: {
      rights: 'Все права защищены.',
    },
  },
  
  de: {
    hero: {
      badge: 'Verfügbar in 7 Sprachen',
      title: 'Dokumentieren Sie Ihre Baustellen mit professioneller Präzision',
      subtitle: 'Komplettes Fotodokumentationssystem für den Bau. GPS, automatische Stempel, Cloud-Sync und intelligente OCR.',
    },
    cta: {
      login: 'Anmelden',
      startFree: 'Kostenlos Starten',
      startNow: 'Jetzt Starten',
      ready: 'Bereit, Ihr Baumanagement zu transformieren?',
      readyDesc: 'Schließen Sie sich Hunderten von Unternehmen an, die ObraPhoto bereits zur effizienten Dokumentation ihrer Projekte nutzen.',
    },
    stats: {
      photos: 'Erfasste Fotos',
      companies: 'Aktive Unternehmen',
      uptime: 'Verfügbarkeit',
      support: 'Support',
    },
    features: {
      title: 'Leistungsstarke Funktionen',
      subtitle: 'Alles, was Sie für die professionelle Baudokumentation benötigen',
      capture: {
        title: 'Intelligente Erfassung',
        description: 'Machen Sie Fotos mit automatischen Metadaten: Datum, Uhrzeit, GPS-Koordinaten und Projektinformationen.',
      },
      gps: {
        title: 'Präzise Geolokalisierung',
        description: 'Erfassen Sie den genauen Standort jedes Fotos mit hochpräzisen GPS-Koordinaten.',
      },
      sync: {
        title: 'Cloud-Synchronisation',
        description: 'Ihre Fotos werden automatisch in die Cloud hochgeladen, sicher und von überall zugänglich.',
      },
      ocr: {
        title: 'Intelligente OCR',
        description: 'Automatische Textextraktion von Schildern, Dokumenten und Beschilderungen in Fotos.',
      },
      security: {
        title: 'Totale Sicherheit',
        description: 'Verschlüsselte Daten, automatisches Backup und Zugriffskontrolle nach Unternehmen und Projekt.',
      },
      offline: {
        title: 'Funktioniert Offline',
        description: 'Erfassen Sie Fotos auch ohne Internet. Alles synchronisiert automatisch, wenn die Verbindung zurückkehrt.',
      },
    },
    benefits: {
      title: 'Warum ObraPhoto wählen?',
      subtitle: 'Speziell für die Baubranche entwickelt',
      item1: 'Eliminieren Sie Tabellenkalkulationen und organisieren Sie Fotos automatisch',
      item2: 'Belegen Sie Baufortschritte mit geolokalisierten Fotos',
      item3: 'Erstellen Sie professionelle Berichte in Sekunden',
      item4: 'Zugriff von jedem Gerät, jederzeit',
      item5: 'Reduzieren Sie Nacharbeit mit klarer Dokumentation',
      item6: 'Einfache Integration mit bestehenden Systemen',
    },
    useCases: {
      construction: 'Bauwesen',
      constructionDesc: 'Vollständige Baudokumentation',
      teams: 'Feldteams',
      teamsDesc: 'Echtzeit-Zusammenarbeit',
      tracking: 'Verfolgung',
      trackingDesc: 'Detaillierte Fortschrittshistorie',
      ai: 'Künstliche Intelligenz',
      aiDesc: 'OCR und automatische Analyse',
    },
    footer: {
      rights: 'Alle Rechte vorbehalten.',
    },
  },
  
  it: {
    hero: {
      badge: 'Disponibile in 7 lingue',
      title: 'Documenta i tuoi cantieri con precisione professionale',
      subtitle: 'Sistema completo di documentazione fotografica per l\'edilizia. GPS, timbri automatici, sincronizzazione cloud e OCR intelligente.',
    },
    cta: {
      login: 'Accedi',
      startFree: 'Inizia Gratis',
      startNow: 'Inizia Ora',
      ready: 'Pronto a trasformare la gestione dei tuoi cantieri?',
      readyDesc: 'Unisciti a centinaia di aziende che già usano ObraPhoto per documentare i loro progetti in modo efficiente.',
    },
    stats: {
      photos: 'Foto acquisite',
      companies: 'Aziende attive',
      uptime: 'Disponibilità',
      support: 'Supporto',
    },
    features: {
      title: 'Funzionalità Potenti',
      subtitle: 'Tutto ciò che serve per documentare cantieri in modo professionale',
      capture: {
        title: 'Acquisizione Intelligente',
        description: 'Scatta foto con metadati automatici: data, ora, coordinate GPS e informazioni sul progetto.',
      },
      gps: {
        title: 'Geolocalizzazione Precisa',
        description: 'Registra la posizione esatta di ogni foto con coordinate GPS ad alta precisione.',
      },
      sync: {
        title: 'Sincronizzazione Cloud',
        description: 'Le tue foto vengono caricate automaticamente nel cloud, sicure e accessibili ovunque.',
      },
      ocr: {
        title: 'OCR Intelligente',
        description: 'Estrazione automatica del testo da targhe, documenti e segnaletica nelle foto.',
      },
      security: {
        title: 'Sicurezza Totale',
        description: 'Dati crittografati, backup automatico e controllo accessi per azienda e progetto.',
      },
      offline: {
        title: 'Funziona Offline',
        description: 'Scatta foto anche senza internet. Tutto si sincronizza automaticamente quando torna la connessione.',
      },
    },
    benefits: {
      title: 'Perché scegliere ObraPhoto?',
      subtitle: 'Sviluppato appositamente per il settore edile',
      item1: 'Elimina i fogli di calcolo e organizza le foto automaticamente',
      item2: 'Dimostra i progressi del cantiere con foto geolocalizzate',
      item3: 'Genera report professionali in pochi secondi',
      item4: 'Accedi da qualsiasi dispositivo, in qualsiasi momento',
      item5: 'Riduci le rilavorazioni con una documentazione chiara',
      item6: 'Facile integrazione con i sistemi esistenti',
    },
    useCases: {
      construction: 'Edilizia',
      constructionDesc: 'Documentazione completa del cantiere',
      teams: 'Team sul Campo',
      teamsDesc: 'Collaborazione in tempo reale',
      tracking: 'Monitoraggio',
      trackingDesc: 'Storico dettagliato dei progressi',
      ai: 'Intelligenza Artificiale',
      aiDesc: 'OCR e analisi automatica',
    },
    footer: {
      rights: 'Tutti i diritti riservati.',
    },
  },
  
  fr: {
    hero: {
      badge: 'Disponible en 7 langues',
      title: 'Documentez vos chantiers avec une précision professionnelle',
      subtitle: 'Système complet de documentation photo pour la construction. GPS, tampons automatiques, synchronisation cloud et OCR intelligent.',
    },
    cta: {
      login: 'Connexion',
      startFree: 'Commencer Gratuitement',
      startNow: 'Commencer Maintenant',
      ready: 'Prêt à transformer votre gestion de chantier?',
      readyDesc: 'Rejoignez des centaines d\'entreprises qui utilisent déjà ObraPhoto pour documenter leurs projets efficacement.',
    },
    stats: {
      photos: 'Photos capturées',
      companies: 'Entreprises actives',
      uptime: 'Disponibilité',
      support: 'Support',
    },
    features: {
      title: 'Fonctionnalités Puissantes',
      subtitle: 'Tout ce dont vous avez besoin pour documenter les chantiers de manière professionnelle',
      capture: {
        title: 'Capture Intelligente',
        description: 'Prenez des photos avec des métadonnées automatiques: date, heure, coordonnées GPS et informations sur le projet.',
      },
      gps: {
        title: 'Géolocalisation Précise',
        description: 'Enregistrez l\'emplacement exact de chaque photo avec des coordonnées GPS de haute précision.',
      },
      sync: {
        title: 'Synchronisation Cloud',
        description: 'Vos photos sont automatiquement téléchargées vers le cloud, sécurisées et accessibles de partout.',
      },
      ocr: {
        title: 'OCR Intelligent',
        description: 'Extraction automatique de texte à partir de panneaux, documents et signalisation dans les photos.',
      },
      security: {
        title: 'Sécurité Totale',
        description: 'Données chiffrées, sauvegarde automatique et contrôle d\'accès par entreprise et projet.',
      },
      offline: {
        title: 'Fonctionne Hors Ligne',
        description: 'Capturez des photos même sans internet. Tout se synchronise automatiquement au retour de la connexion.',
      },
    },
    benefits: {
      title: 'Pourquoi choisir ObraPhoto?',
      subtitle: 'Développé spécialement pour le secteur de la construction',
      item1: 'Éliminez les feuilles de calcul et organisez les photos automatiquement',
      item2: 'Prouvez l\'avancement du chantier avec des photos géolocalisées',
      item3: 'Générez des rapports professionnels en quelques secondes',
      item4: 'Accédez depuis n\'importe quel appareil, à tout moment',
      item5: 'Réduisez les reprises grâce à une documentation claire',
      item6: 'Intégration facile avec les systèmes existants',
    },
    useCases: {
      construction: 'Construction',
      constructionDesc: 'Documentation complète du chantier',
      teams: 'Équipes sur le Terrain',
      teamsDesc: 'Collaboration en temps réel',
      tracking: 'Suivi',
      trackingDesc: 'Historique détaillé des progrès',
      ai: 'Intelligence Artificielle',
      aiDesc: 'OCR et analyse automatique',
    },
    footer: {
      rights: 'Tous droits réservés.',
    },
  },
};

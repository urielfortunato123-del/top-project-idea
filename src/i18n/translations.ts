export type Language = 'pt' | 'en' | 'es' | 'ru' | 'de' | 'it' | 'fr';

export const languageNames: Record<Language, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  ru: 'Русский',
  de: 'Deutsch',
  it: 'Italiano',
  fr: 'Français',
};

export const languageFlags: Record<Language, string> = {
  pt: '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸',
  ru: '🇷🇺',
  de: '🇩🇪',
  it: '🇮🇹',
  fr: '🇫🇷',
};

export type TranslationKeys = {
  // Common
  hello: string;
  administrator: string;
  offline: string;
  online: string;
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  save: string;
  delete: string;
  edit: string;
  back: string;
  next: string;
  loading: string;
  search: string;
  filter: string;
  all: string;
  none: string;
  
  // Navigation
  nav: {
    home: string;
    capture: string;
    photos: string;
    pending: string;
    map: string;
    admin: string;
    profile: string;
  };
  
  // Dashboard
  dashboard: {
    quickActions: string;
    newPhoto: string;
    pending: string;
    sync: string;
    myPhotos: string;
    adminPanel: string;
    summary: string;
    pendingLabel: string;
    sentLabel: string;
    errorsLabel: string;
    offlineMode: string;
    offlineModeDesc: string;
    syncComplete: string;
    syncCompleteDesc: string;
    syncError: string;
    syncErrorDesc: string;
    somePhotosFailed: string;
    somePhotosFailedDesc: string;
  };
  
  // Capture
  capture: {
    title: string;
    onlineDirect: string;
    offlineSaveLocal: string;
    captureLocation: string;
    company: string;
    companyPlaceholder: string;
    project: string;
    projectPlaceholder: string;
    serviceFront: string;
    serviceFrontPlaceholder: string;
    photoDetails: string;
    template: string;
    selectTemplate: string;
    customTemplate: string;
    customTemplatePlaceholder: string;
    activity: string;
    activityPlaceholder: string;
    showStamp: string;
    showStampDesc: string;
    captureButton: string;
    processing: string;
    confirmSend: string;
    discard: string;
    sending: string;
    photoSent: string;
    photoSentDesc: string;
    savedOffline: string;
    savedOfflineDesc: string;
    savedOfflineFallback: string;
    savedOfflineFallbackDesc: string;
    requiredFields: string;
    requiredFieldsDesc: string;
    processingError: string;
    saveError: string;
    heicNotSupported: string;
    size: string;
    log: string;
  };
  
  // Photos
  photos: {
    title: string;
    myPhotos: string;
    noPhotos: string;
    noPhotosDesc: string;
    captureFirst: string;
    viewAll: string;
  };
  
  // Pending
  pending: {
    title: string;
    pendingPhotos: string;
    noPending: string;
    noPendingDesc: string;
    syncAll: string;
    syncing: string;
  };
  
  // Profile
  profile: {
    title: string;
    myProfile: string;
    personalInfo: string;
    name: string;
    email: string;
    settings: string;
    language: string;
    theme: string;
    notifications: string;
    logout: string;
    logoutConfirm: string;
  };
  
  // Admin
  admin: {
    title: string;
    users: string;
    companies: string;
    projects: string;
    reports: string;
    createUser: string;
    manageUsers: string;
  };
  
  // Auth
  auth: {
    login: string;
    signup: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    noAccount: string;
    hasAccount: string;
    loginButton: string;
    signupButton: string;
    loggingIn: string;
    signingUp: string;
    welcome: string;
    welcomeBack: string;
    accessAccount: string;
    createAccount: string;
  };
};

export const translations: Record<Language, TranslationKeys> = {
  pt: {
    hello: 'Olá',
    administrator: 'Administrador',
    offline: 'Offline',
    online: 'Online',
    error: 'Erro',
    success: 'Sucesso',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    back: 'Voltar',
    next: 'Próximo',
    loading: 'Carregando...',
    search: 'Buscar',
    filter: 'Filtrar',
    all: 'Todos',
    none: 'Nenhum',
    
    nav: {
      home: 'Início',
      capture: 'Capturar',
      photos: 'Fotos',
      pending: 'Pendentes',
      map: 'Mapa',
      admin: 'Admin',
      profile: 'Perfil',
    },
    
    dashboard: {
      quickActions: 'Ações Rápidas',
      newPhoto: 'Nova Foto',
      pending: 'Pendentes',
      sync: 'Sincronizar',
      myPhotos: 'Minhas Fotos',
      adminPanel: 'Painel Administrativo',
      summary: 'Resumo',
      pendingLabel: 'Pendentes',
      sentLabel: 'Enviadas',
      errorsLabel: 'Erros',
      offlineMode: 'Modo Offline',
      offlineModeDesc: 'Suas fotos serão sincronizadas quando houver conexão.',
      syncComplete: 'Sincronização concluída',
      syncCompleteDesc: '{count} foto(s) enviada(s) com sucesso.',
      syncError: 'Erro na sincronização',
      syncErrorDesc: 'Não foi possível sincronizar as fotos.',
      somePhotosFailed: 'Algumas fotos falharam',
      somePhotosFailedDesc: '{count} foto(s) não puderam ser enviadas.',
    },
    
    capture: {
      title: 'Nova Captura',
      onlineDirect: 'Online - envio direto',
      offlineSaveLocal: 'Offline - salvar local',
      captureLocation: 'Local da Captura',
      company: 'Empresa',
      companyPlaceholder: 'Digite o nome da empresa...',
      project: 'Projeto/Obra',
      projectPlaceholder: 'Digite o nome do projeto...',
      serviceFront: 'Frente de Serviço',
      serviceFrontPlaceholder: 'Ex: Terraplanagem, Fundação...',
      photoDetails: 'Detalhes da Foto',
      template: 'Template',
      selectTemplate: 'Selecione um template',
      customTemplate: 'Personalizado',
      customTemplatePlaceholder: 'Nome do template...',
      activity: 'Atividade / Descrição',
      activityPlaceholder: 'Descreva a atividade...',
      showStamp: 'Exibir Carimbo',
      showStampDesc: 'Adiciona data, local e informações na foto',
      captureButton: 'Capturar Foto',
      processing: 'Processando...',
      confirmSend: 'Confirmar Envio',
      discard: 'Descartar',
      sending: 'Enviando...',
      photoSent: 'Foto enviada!',
      photoSentDesc: 'A foto foi salva no servidor.',
      savedOffline: 'Foto salva offline!',
      savedOfflineDesc: 'Será sincronizada quando houver conexão.',
      savedOfflineFallback: 'Salva offline (fallback)',
      savedOfflineFallbackDesc: 'O upload falhou, mas a foto foi salva localmente para sincronizar depois.',
      requiredFields: 'Campos obrigatórios',
      requiredFieldsDesc: 'Preencha empresa e projeto antes de capturar.',
      processingError: 'Erro no processamento',
      saveError: 'Erro ao salvar',
      heicNotSupported: 'Formato HEIC não suportado. Configure a câmera para salvar fotos em JPG.',
      size: 'Tamanho',
      log: 'Log',
    },
    
    photos: {
      title: 'Fotos',
      myPhotos: 'Minhas Fotos',
      noPhotos: 'Nenhuma foto ainda',
      noPhotosDesc: 'Capture sua primeira foto para começar.',
      captureFirst: 'Capturar Primeira Foto',
      viewAll: 'Ver Todas',
    },
    
    pending: {
      title: 'Pendentes',
      pendingPhotos: 'Fotos Pendentes',
      noPending: 'Nenhuma foto pendente',
      noPendingDesc: 'Todas as fotos foram sincronizadas.',
      syncAll: 'Sincronizar Todas',
      syncing: 'Sincronizando...',
    },
    
    profile: {
      title: 'Perfil',
      myProfile: 'Meu Perfil',
      personalInfo: 'Informações Pessoais',
      name: 'Nome',
      email: 'E-mail',
      settings: 'Configurações',
      language: 'Idioma',
      theme: 'Tema',
      notifications: 'Notificações',
      logout: 'Sair',
      logoutConfirm: 'Tem certeza que deseja sair?',
    },
    
    admin: {
      title: 'Administração',
      users: 'Usuários',
      companies: 'Empresas',
      projects: 'Projetos',
      reports: 'Relatórios',
      createUser: 'Criar Usuário',
      manageUsers: 'Gerenciar Usuários',
    },
    
    auth: {
      login: 'Entrar',
      signup: 'Cadastrar',
      email: 'E-mail',
      password: 'Senha',
      confirmPassword: 'Confirmar Senha',
      forgotPassword: 'Esqueceu a senha?',
      noAccount: 'Não tem conta?',
      hasAccount: 'Já tem conta?',
      loginButton: 'Entrar',
      signupButton: 'Cadastrar',
      loggingIn: 'Entrando...',
      signingUp: 'Cadastrando...',
      welcome: 'Bem-vindo',
      welcomeBack: 'Bem-vindo de volta',
      accessAccount: 'Acesse sua conta',
      createAccount: 'Crie sua conta',
    },
  },
  
  en: {
    hello: 'Hello',
    administrator: 'Administrator',
    offline: 'Offline',
    online: 'Online',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    loading: 'Loading...',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    none: 'None',
    
    nav: {
      home: 'Home',
      capture: 'Capture',
      photos: 'Photos',
      pending: 'Pending',
      map: 'Map',
      admin: 'Admin',
      profile: 'Profile',
    },
    
    dashboard: {
      quickActions: 'Quick Actions',
      newPhoto: 'New Photo',
      pending: 'Pending',
      sync: 'Sync',
      myPhotos: 'My Photos',
      adminPanel: 'Admin Panel',
      summary: 'Summary',
      pendingLabel: 'Pending',
      sentLabel: 'Sent',
      errorsLabel: 'Errors',
      offlineMode: 'Offline Mode',
      offlineModeDesc: 'Your photos will be synced when connected.',
      syncComplete: 'Sync complete',
      syncCompleteDesc: '{count} photo(s) sent successfully.',
      syncError: 'Sync error',
      syncErrorDesc: 'Could not sync photos.',
      somePhotosFailed: 'Some photos failed',
      somePhotosFailedDesc: '{count} photo(s) could not be sent.',
    },
    
    capture: {
      title: 'New Capture',
      onlineDirect: 'Online - direct upload',
      offlineSaveLocal: 'Offline - save locally',
      captureLocation: 'Capture Location',
      company: 'Company',
      companyPlaceholder: 'Enter company name...',
      project: 'Project/Site',
      projectPlaceholder: 'Enter project name...',
      serviceFront: 'Service Front',
      serviceFrontPlaceholder: 'E.g.: Earthworks, Foundation...',
      photoDetails: 'Photo Details',
      template: 'Template',
      selectTemplate: 'Select a template',
      customTemplate: 'Custom',
      customTemplatePlaceholder: 'Template name...',
      activity: 'Activity / Description',
      activityPlaceholder: 'Describe the activity...',
      showStamp: 'Show Stamp',
      showStampDesc: 'Adds date, location and info on photo',
      captureButton: 'Capture Photo',
      processing: 'Processing...',
      confirmSend: 'Confirm Send',
      discard: 'Discard',
      sending: 'Sending...',
      photoSent: 'Photo sent!',
      photoSentDesc: 'The photo was saved to the server.',
      savedOffline: 'Photo saved offline!',
      savedOfflineDesc: 'Will be synced when connected.',
      savedOfflineFallback: 'Saved offline (fallback)',
      savedOfflineFallbackDesc: 'Upload failed, but photo was saved locally for later sync.',
      requiredFields: 'Required fields',
      requiredFieldsDesc: 'Fill in company and project before capturing.',
      processingError: 'Processing error',
      saveError: 'Error saving',
      heicNotSupported: 'HEIC format not supported. Set camera to save photos as JPG.',
      size: 'Size',
      log: 'Log',
    },
    
    photos: {
      title: 'Photos',
      myPhotos: 'My Photos',
      noPhotos: 'No photos yet',
      noPhotosDesc: 'Capture your first photo to get started.',
      captureFirst: 'Capture First Photo',
      viewAll: 'View All',
    },
    
    pending: {
      title: 'Pending',
      pendingPhotos: 'Pending Photos',
      noPending: 'No pending photos',
      noPendingDesc: 'All photos have been synced.',
      syncAll: 'Sync All',
      syncing: 'Syncing...',
    },
    
    profile: {
      title: 'Profile',
      myProfile: 'My Profile',
      personalInfo: 'Personal Information',
      name: 'Name',
      email: 'Email',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      notifications: 'Notifications',
      logout: 'Logout',
      logoutConfirm: 'Are you sure you want to logout?',
    },
    
    admin: {
      title: 'Administration',
      users: 'Users',
      companies: 'Companies',
      projects: 'Projects',
      reports: 'Reports',
      createUser: 'Create User',
      manageUsers: 'Manage Users',
    },
    
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      loginButton: 'Login',
      signupButton: 'Sign Up',
      loggingIn: 'Logging in...',
      signingUp: 'Signing up...',
      welcome: 'Welcome',
      welcomeBack: 'Welcome back',
      accessAccount: 'Access your account',
      createAccount: 'Create your account',
    },
  },
  
  es: {
    hello: 'Hola',
    administrator: 'Administrador',
    offline: 'Sin conexión',
    online: 'En línea',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    back: 'Volver',
    next: 'Siguiente',
    loading: 'Cargando...',
    search: 'Buscar',
    filter: 'Filtrar',
    all: 'Todos',
    none: 'Ninguno',
    
    nav: {
      home: 'Inicio',
      capture: 'Capturar',
      photos: 'Fotos',
      pending: 'Pendientes',
      map: 'Mapa',
      admin: 'Admin',
      profile: 'Perfil',
    },
    
    dashboard: {
      quickActions: 'Acciones Rápidas',
      newPhoto: 'Nueva Foto',
      pending: 'Pendientes',
      sync: 'Sincronizar',
      myPhotos: 'Mis Fotos',
      adminPanel: 'Panel Administrativo',
      summary: 'Resumen',
      pendingLabel: 'Pendientes',
      sentLabel: 'Enviadas',
      errorsLabel: 'Errores',
      offlineMode: 'Modo Sin Conexión',
      offlineModeDesc: 'Tus fotos se sincronizarán cuando haya conexión.',
      syncComplete: 'Sincronización completa',
      syncCompleteDesc: '{count} foto(s) enviada(s) con éxito.',
      syncError: 'Error de sincronización',
      syncErrorDesc: 'No se pudieron sincronizar las fotos.',
      somePhotosFailed: 'Algunas fotos fallaron',
      somePhotosFailedDesc: '{count} foto(s) no se pudieron enviar.',
    },
    
    capture: {
      title: 'Nueva Captura',
      onlineDirect: 'En línea - envío directo',
      offlineSaveLocal: 'Sin conexión - guardar local',
      captureLocation: 'Ubicación de Captura',
      company: 'Empresa',
      companyPlaceholder: 'Ingrese el nombre de la empresa...',
      project: 'Proyecto/Obra',
      projectPlaceholder: 'Ingrese el nombre del proyecto...',
      serviceFront: 'Frente de Servicio',
      serviceFrontPlaceholder: 'Ej: Movimiento de tierra, Cimentación...',
      photoDetails: 'Detalles de la Foto',
      template: 'Plantilla',
      selectTemplate: 'Seleccione una plantilla',
      customTemplate: 'Personalizada',
      customTemplatePlaceholder: 'Nombre de la plantilla...',
      activity: 'Actividad / Descripción',
      activityPlaceholder: 'Describa la actividad...',
      showStamp: 'Mostrar Sello',
      showStampDesc: 'Agrega fecha, ubicación e info en la foto',
      captureButton: 'Capturar Foto',
      processing: 'Procesando...',
      confirmSend: 'Confirmar Envío',
      discard: 'Descartar',
      sending: 'Enviando...',
      photoSent: '¡Foto enviada!',
      photoSentDesc: 'La foto fue guardada en el servidor.',
      savedOffline: '¡Foto guardada sin conexión!',
      savedOfflineDesc: 'Se sincronizará cuando haya conexión.',
      savedOfflineFallback: 'Guardada sin conexión (respaldo)',
      savedOfflineFallbackDesc: 'La subida falló, pero la foto fue guardada localmente.',
      requiredFields: 'Campos obligatorios',
      requiredFieldsDesc: 'Complete empresa y proyecto antes de capturar.',
      processingError: 'Error de procesamiento',
      saveError: 'Error al guardar',
      heicNotSupported: 'Formato HEIC no soportado. Configure la cámara para guardar fotos en JPG.',
      size: 'Tamaño',
      log: 'Registro',
    },
    
    photos: {
      title: 'Fotos',
      myPhotos: 'Mis Fotos',
      noPhotos: 'Sin fotos aún',
      noPhotosDesc: 'Capture su primera foto para comenzar.',
      captureFirst: 'Capturar Primera Foto',
      viewAll: 'Ver Todas',
    },
    
    pending: {
      title: 'Pendientes',
      pendingPhotos: 'Fotos Pendientes',
      noPending: 'Sin fotos pendientes',
      noPendingDesc: 'Todas las fotos fueron sincronizadas.',
      syncAll: 'Sincronizar Todas',
      syncing: 'Sincronizando...',
    },
    
    profile: {
      title: 'Perfil',
      myProfile: 'Mi Perfil',
      personalInfo: 'Información Personal',
      name: 'Nombre',
      email: 'Correo',
      settings: 'Configuración',
      language: 'Idioma',
      theme: 'Tema',
      notifications: 'Notificaciones',
      logout: 'Salir',
      logoutConfirm: '¿Está seguro que desea salir?',
    },
    
    admin: {
      title: 'Administración',
      users: 'Usuarios',
      companies: 'Empresas',
      projects: 'Proyectos',
      reports: 'Informes',
      createUser: 'Crear Usuario',
      manageUsers: 'Gestionar Usuarios',
    },
    
    auth: {
      login: 'Iniciar Sesión',
      signup: 'Registrarse',
      email: 'Correo',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      forgotPassword: '¿Olvidó su contraseña?',
      noAccount: '¿No tiene cuenta?',
      hasAccount: '¿Ya tiene cuenta?',
      loginButton: 'Iniciar Sesión',
      signupButton: 'Registrarse',
      loggingIn: 'Iniciando...',
      signingUp: 'Registrando...',
      welcome: 'Bienvenido',
      welcomeBack: 'Bienvenido de nuevo',
      accessAccount: 'Acceda a su cuenta',
      createAccount: 'Cree su cuenta',
    },
  },
  
  ru: {
    hello: 'Привет',
    administrator: 'Администратор',
    offline: 'Офлайн',
    online: 'Онлайн',
    error: 'Ошибка',
    success: 'Успех',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    back: 'Назад',
    next: 'Далее',
    loading: 'Загрузка...',
    search: 'Поиск',
    filter: 'Фильтр',
    all: 'Все',
    none: 'Нет',
    
    nav: {
      home: 'Главная',
      capture: 'Съёмка',
      photos: 'Фото',
      pending: 'Ожидание',
      map: 'Карта',
      admin: 'Админ',
      profile: 'Профиль',
    },
    
    dashboard: {
      quickActions: 'Быстрые Действия',
      newPhoto: 'Новое Фото',
      pending: 'Ожидающие',
      sync: 'Синхронизация',
      myPhotos: 'Мои Фото',
      adminPanel: 'Панель Администратора',
      summary: 'Сводка',
      pendingLabel: 'Ожидающие',
      sentLabel: 'Отправленные',
      errorsLabel: 'Ошибки',
      offlineMode: 'Офлайн Режим',
      offlineModeDesc: 'Ваши фото будут синхронизированы при подключении.',
      syncComplete: 'Синхронизация завершена',
      syncCompleteDesc: '{count} фото успешно отправлено.',
      syncError: 'Ошибка синхронизации',
      syncErrorDesc: 'Не удалось синхронизировать фото.',
      somePhotosFailed: 'Некоторые фото не отправлены',
      somePhotosFailedDesc: '{count} фото не удалось отправить.',
    },
    
    capture: {
      title: 'Новая Съёмка',
      onlineDirect: 'Онлайн - прямая загрузка',
      offlineSaveLocal: 'Офлайн - сохранить локально',
      captureLocation: 'Место Съёмки',
      company: 'Компания',
      companyPlaceholder: 'Введите название компании...',
      project: 'Проект/Объект',
      projectPlaceholder: 'Введите название проекта...',
      serviceFront: 'Фронт Работ',
      serviceFrontPlaceholder: 'Напр.: Земляные работы, Фундамент...',
      photoDetails: 'Детали Фото',
      template: 'Шаблон',
      selectTemplate: 'Выберите шаблон',
      customTemplate: 'Пользовательский',
      customTemplatePlaceholder: 'Название шаблона...',
      activity: 'Деятельность / Описание',
      activityPlaceholder: 'Опишите деятельность...',
      showStamp: 'Показать Штамп',
      showStampDesc: 'Добавляет дату, место и информацию на фото',
      captureButton: 'Сделать Фото',
      processing: 'Обработка...',
      confirmSend: 'Подтвердить Отправку',
      discard: 'Отменить',
      sending: 'Отправка...',
      photoSent: 'Фото отправлено!',
      photoSentDesc: 'Фото сохранено на сервере.',
      savedOffline: 'Фото сохранено офлайн!',
      savedOfflineDesc: 'Будет синхронизировано при подключении.',
      savedOfflineFallback: 'Сохранено офлайн (резерв)',
      savedOfflineFallbackDesc: 'Загрузка не удалась, но фото сохранено локально.',
      requiredFields: 'Обязательные поля',
      requiredFieldsDesc: 'Заполните компанию и проект перед съёмкой.',
      processingError: 'Ошибка обработки',
      saveError: 'Ошибка сохранения',
      heicNotSupported: 'Формат HEIC не поддерживается. Настройте камеру на сохранение в JPG.',
      size: 'Размер',
      log: 'Журнал',
    },
    
    photos: {
      title: 'Фото',
      myPhotos: 'Мои Фото',
      noPhotos: 'Пока нет фото',
      noPhotosDesc: 'Сделайте первое фото, чтобы начать.',
      captureFirst: 'Сделать Первое Фото',
      viewAll: 'Показать Все',
    },
    
    pending: {
      title: 'Ожидающие',
      pendingPhotos: 'Ожидающие Фото',
      noPending: 'Нет ожидающих фото',
      noPendingDesc: 'Все фото синхронизированы.',
      syncAll: 'Синхронизировать Все',
      syncing: 'Синхронизация...',
    },
    
    profile: {
      title: 'Профиль',
      myProfile: 'Мой Профиль',
      personalInfo: 'Личная Информация',
      name: 'Имя',
      email: 'Эл. почта',
      settings: 'Настройки',
      language: 'Язык',
      theme: 'Тема',
      notifications: 'Уведомления',
      logout: 'Выход',
      logoutConfirm: 'Вы уверены, что хотите выйти?',
    },
    
    admin: {
      title: 'Администрирование',
      users: 'Пользователи',
      companies: 'Компании',
      projects: 'Проекты',
      reports: 'Отчёты',
      createUser: 'Создать Пользователя',
      manageUsers: 'Управление Пользователями',
    },
    
    auth: {
      login: 'Вход',
      signup: 'Регистрация',
      email: 'Эл. почта',
      password: 'Пароль',
      confirmPassword: 'Подтвердить Пароль',
      forgotPassword: 'Забыли пароль?',
      noAccount: 'Нет аккаунта?',
      hasAccount: 'Уже есть аккаунт?',
      loginButton: 'Войти',
      signupButton: 'Зарегистрироваться',
      loggingIn: 'Вход...',
      signingUp: 'Регистрация...',
      welcome: 'Добро пожаловать',
      welcomeBack: 'С возвращением',
      accessAccount: 'Войдите в свой аккаунт',
      createAccount: 'Создайте аккаунт',
    },
  },
  
  de: {
    hello: 'Hallo',
    administrator: 'Administrator',
    offline: 'Offline',
    online: 'Online',
    error: 'Fehler',
    success: 'Erfolg',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    back: 'Zurück',
    next: 'Weiter',
    loading: 'Laden...',
    search: 'Suchen',
    filter: 'Filtern',
    all: 'Alle',
    none: 'Keine',
    
    nav: {
      home: 'Start',
      capture: 'Aufnehmen',
      photos: 'Fotos',
      pending: 'Ausstehend',
      map: 'Karte',
      admin: 'Admin',
      profile: 'Profil',
    },
    
    dashboard: {
      quickActions: 'Schnellaktionen',
      newPhoto: 'Neues Foto',
      pending: 'Ausstehend',
      sync: 'Synchronisieren',
      myPhotos: 'Meine Fotos',
      adminPanel: 'Admin-Panel',
      summary: 'Zusammenfassung',
      pendingLabel: 'Ausstehend',
      sentLabel: 'Gesendet',
      errorsLabel: 'Fehler',
      offlineMode: 'Offline-Modus',
      offlineModeDesc: 'Ihre Fotos werden bei Verbindung synchronisiert.',
      syncComplete: 'Synchronisierung abgeschlossen',
      syncCompleteDesc: '{count} Foto(s) erfolgreich gesendet.',
      syncError: 'Synchronisierungsfehler',
      syncErrorDesc: 'Fotos konnten nicht synchronisiert werden.',
      somePhotosFailed: 'Einige Fotos fehlgeschlagen',
      somePhotosFailedDesc: '{count} Foto(s) konnten nicht gesendet werden.',
    },
    
    capture: {
      title: 'Neue Aufnahme',
      onlineDirect: 'Online - direkter Upload',
      offlineSaveLocal: 'Offline - lokal speichern',
      captureLocation: 'Aufnahmeort',
      company: 'Unternehmen',
      companyPlaceholder: 'Unternehmensname eingeben...',
      project: 'Projekt/Baustelle',
      projectPlaceholder: 'Projektname eingeben...',
      serviceFront: 'Arbeitsbereich',
      serviceFrontPlaceholder: 'Z.B.: Erdarbeiten, Fundament...',
      photoDetails: 'Fotodetails',
      template: 'Vorlage',
      selectTemplate: 'Vorlage auswählen',
      customTemplate: 'Benutzerdefiniert',
      customTemplatePlaceholder: 'Vorlagenname...',
      activity: 'Aktivität / Beschreibung',
      activityPlaceholder: 'Aktivität beschreiben...',
      showStamp: 'Stempel Anzeigen',
      showStampDesc: 'Fügt Datum, Ort und Info zum Foto hinzu',
      captureButton: 'Foto Aufnehmen',
      processing: 'Verarbeitung...',
      confirmSend: 'Senden Bestätigen',
      discard: 'Verwerfen',
      sending: 'Senden...',
      photoSent: 'Foto gesendet!',
      photoSentDesc: 'Das Foto wurde auf dem Server gespeichert.',
      savedOffline: 'Foto offline gespeichert!',
      savedOfflineDesc: 'Wird bei Verbindung synchronisiert.',
      savedOfflineFallback: 'Offline gespeichert (Fallback)',
      savedOfflineFallbackDesc: 'Upload fehlgeschlagen, aber Foto lokal gespeichert.',
      requiredFields: 'Pflichtfelder',
      requiredFieldsDesc: 'Füllen Sie Unternehmen und Projekt vor der Aufnahme aus.',
      processingError: 'Verarbeitungsfehler',
      saveError: 'Speicherfehler',
      heicNotSupported: 'HEIC-Format nicht unterstützt. Stellen Sie Kamera auf JPG ein.',
      size: 'Größe',
      log: 'Protokoll',
    },
    
    photos: {
      title: 'Fotos',
      myPhotos: 'Meine Fotos',
      noPhotos: 'Noch keine Fotos',
      noPhotosDesc: 'Nehmen Sie Ihr erstes Foto auf.',
      captureFirst: 'Erstes Foto Aufnehmen',
      viewAll: 'Alle Anzeigen',
    },
    
    pending: {
      title: 'Ausstehend',
      pendingPhotos: 'Ausstehende Fotos',
      noPending: 'Keine ausstehenden Fotos',
      noPendingDesc: 'Alle Fotos wurden synchronisiert.',
      syncAll: 'Alle Synchronisieren',
      syncing: 'Synchronisieren...',
    },
    
    profile: {
      title: 'Profil',
      myProfile: 'Mein Profil',
      personalInfo: 'Persönliche Informationen',
      name: 'Name',
      email: 'E-Mail',
      settings: 'Einstellungen',
      language: 'Sprache',
      theme: 'Theme',
      notifications: 'Benachrichtigungen',
      logout: 'Abmelden',
      logoutConfirm: 'Sind Sie sicher, dass Sie sich abmelden möchten?',
    },
    
    admin: {
      title: 'Verwaltung',
      users: 'Benutzer',
      companies: 'Unternehmen',
      projects: 'Projekte',
      reports: 'Berichte',
      createUser: 'Benutzer Erstellen',
      manageUsers: 'Benutzer Verwalten',
    },
    
    auth: {
      login: 'Anmelden',
      signup: 'Registrieren',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort Bestätigen',
      forgotPassword: 'Passwort vergessen?',
      noAccount: 'Kein Konto?',
      hasAccount: 'Bereits ein Konto?',
      loginButton: 'Anmelden',
      signupButton: 'Registrieren',
      loggingIn: 'Anmelden...',
      signingUp: 'Registrieren...',
      welcome: 'Willkommen',
      welcomeBack: 'Willkommen zurück',
      accessAccount: 'Zugang zu Ihrem Konto',
      createAccount: 'Konto erstellen',
    },
  },
  
  it: {
    hello: 'Ciao',
    administrator: 'Amministratore',
    offline: 'Offline',
    online: 'Online',
    error: 'Errore',
    success: 'Successo',
    cancel: 'Annulla',
    confirm: 'Conferma',
    save: 'Salva',
    delete: 'Elimina',
    edit: 'Modifica',
    back: 'Indietro',
    next: 'Avanti',
    loading: 'Caricamento...',
    search: 'Cerca',
    filter: 'Filtra',
    all: 'Tutti',
    none: 'Nessuno',
    
    nav: {
      home: 'Home',
      capture: 'Cattura',
      photos: 'Foto',
      pending: 'In Attesa',
      map: 'Mappa',
      admin: 'Admin',
      profile: 'Profilo',
    },
    
    dashboard: {
      quickActions: 'Azioni Rapide',
      newPhoto: 'Nuova Foto',
      pending: 'In Attesa',
      sync: 'Sincronizza',
      myPhotos: 'Le Mie Foto',
      adminPanel: 'Pannello Admin',
      summary: 'Riepilogo',
      pendingLabel: 'In Attesa',
      sentLabel: 'Inviate',
      errorsLabel: 'Errori',
      offlineMode: 'Modalità Offline',
      offlineModeDesc: 'Le tue foto saranno sincronizzate quando connesso.',
      syncComplete: 'Sincronizzazione completata',
      syncCompleteDesc: '{count} foto inviate con successo.',
      syncError: 'Errore di sincronizzazione',
      syncErrorDesc: 'Impossibile sincronizzare le foto.',
      somePhotosFailed: 'Alcune foto non inviate',
      somePhotosFailedDesc: '{count} foto non sono state inviate.',
    },
    
    capture: {
      title: 'Nuova Cattura',
      onlineDirect: 'Online - invio diretto',
      offlineSaveLocal: 'Offline - salva localmente',
      captureLocation: 'Posizione di Cattura',
      company: 'Azienda',
      companyPlaceholder: "Inserisci il nome dell'azienda...",
      project: 'Progetto/Cantiere',
      projectPlaceholder: 'Inserisci il nome del progetto...',
      serviceFront: 'Fronte di Lavoro',
      serviceFrontPlaceholder: 'Es: Movimento terra, Fondazione...',
      photoDetails: 'Dettagli Foto',
      template: 'Modello',
      selectTemplate: 'Seleziona un modello',
      customTemplate: 'Personalizzato',
      customTemplatePlaceholder: 'Nome del modello...',
      activity: 'Attività / Descrizione',
      activityPlaceholder: "Descrivi l'attività...",
      showStamp: 'Mostra Timbro',
      showStampDesc: 'Aggiunge data, posizione e info alla foto',
      captureButton: 'Cattura Foto',
      processing: 'Elaborazione...',
      confirmSend: 'Conferma Invio',
      discard: 'Scarta',
      sending: 'Invio...',
      photoSent: 'Foto inviata!',
      photoSentDesc: 'La foto è stata salvata sul server.',
      savedOffline: 'Foto salvata offline!',
      savedOfflineDesc: 'Sarà sincronizzata quando connesso.',
      savedOfflineFallback: 'Salvata offline (fallback)',
      savedOfflineFallbackDesc: 'Upload fallito, ma foto salvata localmente.',
      requiredFields: 'Campi obbligatori',
      requiredFieldsDesc: 'Compila azienda e progetto prima di catturare.',
      processingError: 'Errore di elaborazione',
      saveError: 'Errore nel salvataggio',
      heicNotSupported: 'Formato HEIC non supportato. Imposta la fotocamera per salvare in JPG.',
      size: 'Dimensione',
      log: 'Log',
    },
    
    photos: {
      title: 'Foto',
      myPhotos: 'Le Mie Foto',
      noPhotos: 'Nessuna foto ancora',
      noPhotosDesc: 'Cattura la tua prima foto per iniziare.',
      captureFirst: 'Cattura Prima Foto',
      viewAll: 'Vedi Tutte',
    },
    
    pending: {
      title: 'In Attesa',
      pendingPhotos: 'Foto in Attesa',
      noPending: 'Nessuna foto in attesa',
      noPendingDesc: 'Tutte le foto sono state sincronizzate.',
      syncAll: 'Sincronizza Tutte',
      syncing: 'Sincronizzazione...',
    },
    
    profile: {
      title: 'Profilo',
      myProfile: 'Il Mio Profilo',
      personalInfo: 'Informazioni Personali',
      name: 'Nome',
      email: 'Email',
      settings: 'Impostazioni',
      language: 'Lingua',
      theme: 'Tema',
      notifications: 'Notifiche',
      logout: 'Esci',
      logoutConfirm: 'Sei sicuro di voler uscire?',
    },
    
    admin: {
      title: 'Amministrazione',
      users: 'Utenti',
      companies: 'Aziende',
      projects: 'Progetti',
      reports: 'Report',
      createUser: 'Crea Utente',
      manageUsers: 'Gestisci Utenti',
    },
    
    auth: {
      login: 'Accedi',
      signup: 'Registrati',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Conferma Password',
      forgotPassword: 'Password dimenticata?',
      noAccount: 'Non hai un account?',
      hasAccount: 'Hai già un account?',
      loginButton: 'Accedi',
      signupButton: 'Registrati',
      loggingIn: 'Accesso...',
      signingUp: 'Registrazione...',
      welcome: 'Benvenuto',
      welcomeBack: 'Bentornato',
      accessAccount: 'Accedi al tuo account',
      createAccount: 'Crea il tuo account',
    },
  },
  
  fr: {
    hello: 'Bonjour',
    administrator: 'Administrateur',
    offline: 'Hors ligne',
    online: 'En ligne',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    back: 'Retour',
    next: 'Suivant',
    loading: 'Chargement...',
    search: 'Rechercher',
    filter: 'Filtrer',
    all: 'Tous',
    none: 'Aucun',
    
    nav: {
      home: 'Accueil',
      capture: 'Capturer',
      photos: 'Photos',
      pending: 'En attente',
      map: 'Carte',
      admin: 'Admin',
      profile: 'Profil',
    },
    
    dashboard: {
      quickActions: 'Actions Rapides',
      newPhoto: 'Nouvelle Photo',
      pending: 'En attente',
      sync: 'Synchroniser',
      myPhotos: 'Mes Photos',
      adminPanel: 'Panneau Admin',
      summary: 'Résumé',
      pendingLabel: 'En attente',
      sentLabel: 'Envoyées',
      errorsLabel: 'Erreurs',
      offlineMode: 'Mode Hors Ligne',
      offlineModeDesc: 'Vos photos seront synchronisées une fois connecté.',
      syncComplete: 'Synchronisation terminée',
      syncCompleteDesc: '{count} photo(s) envoyée(s) avec succès.',
      syncError: 'Erreur de synchronisation',
      syncErrorDesc: 'Impossible de synchroniser les photos.',
      somePhotosFailed: 'Certaines photos ont échoué',
      somePhotosFailedDesc: '{count} photo(s) n\'ont pas pu être envoyées.',
    },
    
    capture: {
      title: 'Nouvelle Capture',
      onlineDirect: 'En ligne - envoi direct',
      offlineSaveLocal: 'Hors ligne - sauvegarder localement',
      captureLocation: 'Lieu de Capture',
      company: 'Entreprise',
      companyPlaceholder: "Entrez le nom de l'entreprise...",
      project: 'Projet/Chantier',
      projectPlaceholder: 'Entrez le nom du projet...',
      serviceFront: 'Front de Service',
      serviceFrontPlaceholder: 'Ex: Terrassement, Fondation...',
      photoDetails: 'Détails de la Photo',
      template: 'Modèle',
      selectTemplate: 'Sélectionner un modèle',
      customTemplate: 'Personnalisé',
      customTemplatePlaceholder: 'Nom du modèle...',
      activity: 'Activité / Description',
      activityPlaceholder: "Décrivez l'activité...",
      showStamp: 'Afficher le Tampon',
      showStampDesc: 'Ajoute date, lieu et infos sur la photo',
      captureButton: 'Capturer Photo',
      processing: 'Traitement...',
      confirmSend: "Confirmer l'Envoi",
      discard: 'Annuler',
      sending: 'Envoi...',
      photoSent: 'Photo envoyée!',
      photoSentDesc: 'La photo a été sauvegardée sur le serveur.',
      savedOffline: 'Photo sauvegardée hors ligne!',
      savedOfflineDesc: 'Sera synchronisée une fois connecté.',
      savedOfflineFallback: 'Sauvegardée hors ligne (secours)',
      savedOfflineFallbackDesc: "L'envoi a échoué, mais la photo a été sauvegardée localement.",
      requiredFields: 'Champs obligatoires',
      requiredFieldsDesc: 'Remplissez entreprise et projet avant de capturer.',
      processingError: 'Erreur de traitement',
      saveError: 'Erreur de sauvegarde',
      heicNotSupported: 'Format HEIC non supporté. Configurez la caméra pour sauvegarder en JPG.',
      size: 'Taille',
      log: 'Journal',
    },
    
    photos: {
      title: 'Photos',
      myPhotos: 'Mes Photos',
      noPhotos: 'Pas encore de photos',
      noPhotosDesc: 'Capturez votre première photo pour commencer.',
      captureFirst: 'Capturer Première Photo',
      viewAll: 'Voir Toutes',
    },
    
    pending: {
      title: 'En Attente',
      pendingPhotos: 'Photos en Attente',
      noPending: 'Pas de photos en attente',
      noPendingDesc: 'Toutes les photos ont été synchronisées.',
      syncAll: 'Synchroniser Toutes',
      syncing: 'Synchronisation...',
    },
    
    profile: {
      title: 'Profil',
      myProfile: 'Mon Profil',
      personalInfo: 'Informations Personnelles',
      name: 'Nom',
      email: 'Email',
      settings: 'Paramètres',
      language: 'Langue',
      theme: 'Thème',
      notifications: 'Notifications',
      logout: 'Déconnexion',
      logoutConfirm: 'Êtes-vous sûr de vouloir vous déconnecter?',
    },
    
    admin: {
      title: 'Administration',
      users: 'Utilisateurs',
      companies: 'Entreprises',
      projects: 'Projets',
      reports: 'Rapports',
      createUser: 'Créer Utilisateur',
      manageUsers: 'Gérer Utilisateurs',
    },
    
    auth: {
      login: 'Connexion',
      signup: 'Inscription',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer Mot de passe',
      forgotPassword: 'Mot de passe oublié?',
      noAccount: "Pas de compte?",
      hasAccount: 'Déjà un compte?',
      loginButton: 'Se Connecter',
      signupButton: "S'inscrire",
      loggingIn: 'Connexion...',
      signingUp: 'Inscription...',
      welcome: 'Bienvenue',
      welcomeBack: 'Bon retour',
      accessAccount: 'Accédez à votre compte',
      createAccount: 'Créez votre compte',
    },
  },
};

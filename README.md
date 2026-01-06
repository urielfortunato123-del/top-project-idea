# 📸 FotoObra - Sistema de Registro Fotográfico para Obras

Sistema mobile-first para captura, organização e gerenciamento de fotos de obras com suporte offline, geolocalização, OCR e geração de relatórios.

## 🎯 Visão Geral

O FotoObra é uma aplicação PWA (Progressive Web App) desenvolvida para equipes de campo em obras de construção civil. Permite capturar fotos com carimbo automático de data/hora e localização GPS, sincronizar quando houver conexão, e gerar relatórios profissionais.

## ✨ Funcionalidades Principais

### 📷 Captura de Fotos
- **Carimbo automático**: Data, hora e coordenadas GPS sobrepostos na imagem
- **Metadados completos**: Empresa, projeto, frente de serviço e descrição de atividade
- **Templates personalizáveis**: Diferentes tipos de registro (RDO, documentos, etc.)
- **Modo offline**: Fotos são salvas localmente e sincronizadas quando online

### 🗂️ Organização
- **Hierarquia por empresa/projeto**: Fotos organizadas automaticamente
- **Galeria visual**: Visualização em grade com miniaturas
- **Busca e filtros**: Encontre fotos por data, projeto ou status
- **Mapa de fotos**: Visualize fotos no mapa por localização GPS

### 🔄 Sincronização
- **Fila offline**: Fotos pendentes ficam armazenadas no dispositivo
- **Sincronização automática**: Upload quando a conexão retorna
- **Indicador de status**: Visualize fotos pendentes, sincronizadas ou com erro
- **Retry automático**: Tentativas de reenvio em caso de falha

### 📊 OCR e Relatórios
- **Processamento OCR**: Extração automática de texto de documentos fotografados
- **Entidades extraídas**: Identificação de dados relevantes (datas, valores, etc.)
- **Geração de relatórios**: Exportação de dados em formato profissional
- **Histórico de processamento**: Acompanhe o status do OCR

### 👥 Gestão de Usuários
- **Autenticação segura**: Login com email/senha via Supabase Auth
- **Perfis de usuário**: Nome, avatar e informações pessoais
- **Níveis de acesso**: Admin e Colaborador
- **Painel administrativo**: Gerenciamento de usuários (apenas admins)

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **TailwindCSS** - Estilização utilitária
- **shadcn/ui** - Componentes de interface
- **React Router** - Navegação SPA
- **TanStack Query** - Gerenciamento de estado servidor
- **Framer Motion** - Animações (via Lucide icons)

### Backend (Lovable Cloud / Supabase)
- **PostgreSQL** - Banco de dados relacional
- **Supabase Auth** - Autenticação e autorização
- **Supabase Storage** - Armazenamento de arquivos
- **Edge Functions** - Lógica serverless (OCR, relatórios)
- **Row Level Security** - Segurança a nível de linha

### PWA & Offline
- **Vite PWA Plugin** - Service Worker e manifest
- **IndexedDB** - Armazenamento local (via idb)
- **Workbox** - Estratégias de cache

### Mapas
- **Leaflet** - Biblioteca de mapas
- **React Leaflet** - Integração com React

## 📁 Estrutura do Projeto

```
├── public/
│   ├── manifest.json          # Configuração PWA
│   ├── pwa-192x192.png        # Ícone PWA pequeno
│   ├── pwa-512x512.png        # Ícone PWA grande
│   └── robots.txt             # SEO
│
├── src/
│   ├── components/
│   │   ├── ui/                # Componentes shadcn/ui
│   │   ├── BatchOCRPanel.tsx  # Painel de processamento OCR em lote
│   │   ├── BottomNav.tsx      # Navegação inferior mobile
│   │   ├── ConfidenceBadge.tsx # Badge de confiança OCR
│   │   ├── EntityList.tsx     # Lista de entidades extraídas
│   │   ├── NavLink.tsx        # Link de navegação
│   │   ├── NotificationToggle.tsx # Toggle de notificações
│   │   ├── PhotoCard.tsx      # Card de foto na galeria
│   │   ├── PhotoStamp.tsx     # Componente de carimbo
│   │   ├── PhotoTreeView.tsx  # Visualização em árvore
│   │   ├── StatusBadge.tsx    # Badge de status
│   │   └── SyncIndicator.tsx  # Indicador de sincronização
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx    # Contexto de autenticação (legacy)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts         # Hook principal de autenticação
│   │   ├── useBatchOCR.ts     # Hook de OCR em lote
│   │   ├── useGeolocation.ts  # Hook de geolocalização
│   │   ├── useMobile.tsx      # Detecção de dispositivo mobile
│   │   ├── useNotifications.ts # Hook de notificações push
│   │   ├── useOCR.ts          # Hook de OCR individual
│   │   ├── useOfflineQueue.ts # Hook de fila offline
│   │   ├── useOnlineStatus.ts # Hook de status de conexão
│   │   ├── usePhotos.ts       # Hook principal de fotos
│   │   ├── usePhotoTree.ts    # Hook de árvore de fotos
│   │   ├── useProjects.ts     # Hook de projetos
│   │   └── useToast.ts        # Hook de notificações toast
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts      # Cliente Supabase (auto-gerado)
│   │       └── types.ts       # Tipos do banco (auto-gerado)
│   │
│   ├── lib/
│   │   ├── indexedDB.ts       # Utilitários IndexedDB
│   │   └── utils.ts           # Funções utilitárias
│   │
│   ├── pages/
│   │   ├── Admin.tsx          # Página de administração
│   │   ├── AdminDashboard.tsx # Dashboard administrativo
│   │   ├── Auth.tsx           # Página de autenticação
│   │   ├── Capture.tsx        # Página de captura de fotos
│   │   ├── Dashboard.tsx      # Dashboard principal
│   │   ├── Index.tsx          # Página inicial
│   │   ├── Login.tsx          # Página de login
│   │   ├── NotFound.tsx       # Página 404
│   │   ├── Pending.tsx        # Fotos pendentes
│   │   ├── PhotoBrowser.tsx   # Navegador de fotos
│   │   ├── PhotoDetail.tsx    # Detalhes da foto
│   │   ├── PhotoMap.tsx       # Mapa de fotos
│   │   ├── Photos.tsx         # Galeria de fotos
│   │   ├── Profile.tsx        # Perfil do usuário
│   │   └── Reports.tsx        # Relatórios
│   │
│   ├── types/
│   │   └── photo.ts           # Tipos de foto
│   │
│   ├── App.tsx                # Componente raiz
│   ├── App.css                # Estilos globais
│   ├── index.css              # Tokens de design
│   └── main.tsx               # Entry point
│
├── supabase/
│   ├── config.toml            # Configuração Supabase
│   ├── migrations/            # Migrações do banco
│   └── functions/
│       ├── admin-create-user/ # Criação de usuários (admin)
│       ├── generate-report/   # Geração de relatórios
│       └── process-photo/     # Processamento OCR
│
├── index.html                 # HTML principal
├── vite.config.ts             # Configuração Vite
├── tailwind.config.ts         # Configuração Tailwind
└── package.json               # Dependências
```

## 🗄️ Modelo de Dados

### Tabelas Principais

#### `profiles`
Perfis de usuários
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID do usuário (ref auth.users) |
| full_name | TEXT | Nome completo |
| avatar_url | TEXT | URL do avatar |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

#### `user_roles`
Papéis dos usuários (admin, colaborador)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID do registro |
| user_id | UUID | ID do usuário |
| role | app_role | Papel (admin/colaborador) |

#### `companies`
Empresas/clientes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID da empresa |
| name | TEXT | Nome da empresa |
| slug | TEXT | Slug único |

#### `projects`
Projetos de obra
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID do projeto |
| company_id | UUID | Empresa associada |
| name | TEXT | Nome do projeto |
| description | TEXT | Descrição |

#### `photo_records`
Registros fotográficos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID da foto |
| user_id | UUID | Usuário que capturou |
| company_id | UUID | Empresa |
| project_id | UUID | Projeto |
| file_url | TEXT | URL da imagem |
| file_path | TEXT | Caminho no storage |
| latitude | FLOAT | Latitude GPS |
| longitude | FLOAT | Longitude GPS |
| accuracy | FLOAT | Precisão GPS (metros) |
| device_timestamp | TIMESTAMP | Data/hora do dispositivo |
| server_timestamp | TIMESTAMP | Data/hora do servidor |
| activity_text | TEXT | Descrição da atividade |
| frente_servico | TEXT | Frente de serviço |
| show_stamp | BOOLEAN | Exibir carimbo |
| status | TEXT | Status (pending, synced, error) |
| ocr_status | TEXT | Status do OCR |
| ocr_raw_text | TEXT | Texto bruto extraído |
| ocr_processed_text | TEXT | Texto processado |
| ocr_confidence | FLOAT | Confiança do OCR (0-1) |

#### `extracted_entities`
Entidades extraídas via OCR
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID da entidade |
| photo_record_id | UUID | Foto associada |
| entity_type | TEXT | Tipo (data, valor, etc) |
| entity_value | TEXT | Valor extraído |
| confidence_score | FLOAT | Score de confiança |
| is_validated | BOOLEAN | Validado manualmente |

#### `templates`
Templates de captura
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID do template |
| name | TEXT | Nome |
| description | TEXT | Descrição |
| icon | TEXT | Ícone (Lucide) |

## 🔐 Segurança

### Row Level Security (RLS)
- Todas as tabelas possuem RLS habilitado
- Usuários só acessam seus próprios dados
- Admins têm acesso ampliado via função `has_role()`

### Autenticação
- Supabase Auth com email/senha
- Confirmação de email automática
- Sessões gerenciadas automaticamente

### Armazenamento
- Buckets privados no Supabase Storage
- URLs assinadas com expiração
- Políticas de acesso por usuário

## 📱 PWA Features

- **Instalável**: Adicione à tela inicial
- **Offline-first**: Funciona sem conexão
- **Sincronização em background**: Upload automático
- **Notificações push**: Alertas de sincronização
- **Atualização automática**: Service Worker

## 🚀 Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou bun

### Instalação

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>

# Entre no diretório
cd <NOME_DO_PROJETO>

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente
O projeto usa Lovable Cloud, então as variáveis são configuradas automaticamente:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## 📲 Instalação no Celular

### Android
1. Acesse o app pelo navegador Chrome
2. Toque nos 3 pontos (menu)
3. Selecione "Adicionar à tela inicial"

### iOS
1. Acesse o app pelo Safari
2. Toque no botão de compartilhar
3. Selecione "Adicionar à Tela de Início"

## 🔧 Manutenção

### Atualizar o App
O usuário pode forçar atualização em **Perfil > Atualizar Aplicativo**

### Limpar Cache
Em caso de problemas, limpe os dados do site nas configurações do navegador

## 📄 Licença

Projeto proprietário - Todos os direitos reservados.

## 👥 Equipe

Desenvolvido com ❤️ usando [Lovable](https://lovable.dev)

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2026

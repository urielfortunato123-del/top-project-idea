# 📸 ObraPhoto v2.0

<div align="center">

![ObraPhoto](https://img.shields.io/badge/ObraPhoto-v2.0-3B82F6?style=for-the-badge&logo=camera&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Supabase](https://img.shields.io/badge/Lovable_Cloud-Ready-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**Sistema de Registro Técnico de Campo para Construção Civil**

[Demonstração](#-demonstração) • [Funcionalidades](#-funcionalidades) • [Instalação](#-instalação) • [Tecnologias](#-tecnologias)

</div>

---

## 🎯 Sobre o Projeto

O **ObraPhoto** é uma aplicação web progressiva (PWA) desenvolvida para profissionais da construção civil que precisam documentar o progresso de obras de forma organizada, segura e eficiente.

### ✨ Destaques da v2.0

| Novidade | Descrição |
|----------|-----------|
| 🎨 **Design Glassmorphism** | Interface moderna com efeitos de vidro fosco e blur |
| ⚡ **Performance Otimizada** | Animações suaves e transições fluidas |
| 🌙 **Tema Dark Premium** | Visual profissional com gradientes vibrantes |
| 📱 **100% Mobile-First** | Experiência nativa no celular |
| 🔄 **Offline-First** | Funciona completamente sem internet |
| 🎭 **Nova Tipografia** | Inter + Space Grotesk para visual contemporâneo |

---

## 📱 Funcionalidades

### 📷 Captura de Fotos

| Recurso | Descrição |
|---------|-----------|
| **Captura Direta** | Tire fotos diretamente pelo aplicativo usando a câmera do dispositivo |
| **Carimbo Automático** | Adiciona automaticamente timestamp, GPS e nome do colaborador na imagem |
| **Metadados Completos** | Registra empresa, projeto, frente de serviço e atividade |
| **Geolocalização** | Captura coordenadas GPS com precisão do dispositivo |
| **Templates** | Modelos predefinidos para diferentes tipos de registro |

### 🔄 Sincronização Inteligente

| Recurso | Descrição |
|---------|-----------|
| **Modo Offline** | Salva fotos localmente quando sem internet |
| **Sincronização Manual/Auto** | Envia fotos com um clique ou automaticamente |
| **Fila de Upload** | Gerencia uploads pendentes com retry automático |
| **Indicador Visual** | Badge animado mostra status de conexão e sync |

### 🤖 OCR Inteligente (IA)

| Recurso | Descrição |
|---------|-----------|
| **Extração de Texto** | Reconhece texto em placas, documentos e etiquetas |
| **Nível de Confiança** | Indica a precisão do reconhecimento (%) com cores |
| **Processamento em Lote** | Processa múltiplas fotos simultaneamente |
| **Entidades Extraídas** | Identifica datas, valores e outros dados relevantes |
| **Cache de Resultados** | Evita reprocessamento de imagens idênticas |

### 👥 Gestão de Usuários

| Recurso | Descrição |
|---------|-----------|
| **Autenticação Segura** | Login com email e senha |
| **Perfis de Usuário** | Nome completo e avatar personalizável |
| **Sistema de Roles** | Permissões separadas: Admin e Colaborador |
| **Criação de Usuários** | Admins podem criar novos colaboradores |
| **Auto-confirm** | Cadastro sem necessidade de confirmar email |

### 🏢 Gestão Organizacional

| Recurso | Descrição |
|---------|-----------|
| **Empresas** | Cadastro e gerenciamento de empresas clientes |
| **Projetos/Obras** | Organização hierárquica por projeto |
| **Frentes de Serviço** | Categorização por tipo de atividade |
| **Navegador Hierárquico** | Visualização em árvore por empresa/projeto/usuário |

### 🗺️ Visualização em Mapa

| Recurso | Descrição |
|---------|-----------|
| **Mapa Interativo** | Leaflet com visualização geográfica de fotos |
| **Markers Coloridos** | Indicação visual do status de cada foto |
| **Popup Detalhado** | Preview da foto ao clicar no marker |
| **Filtros** | Filtragem por projeto, data ou status |

### 📊 Painel Administrativo

| Recurso | Descrição |
|---------|-----------|
| **Dashboard de Métricas** | Estatísticas gerais do sistema |
| **Navegador de Fotos** | Visualização hierárquica completa |
| **Gestão de Usuários** | CRUD de colaboradores |
| **Relatórios** | Geração e exportação de dados |

---

## 🖥️ Versões da Aplicação

### 🌐 Versão Web

Acesse via navegador em qualquer dispositivo:

```
https://seu-projeto.lovable.app
```

**Navegadores Suportados:**
- ✅ Google Chrome 90+ (recomendado)
- ✅ Mozilla Firefox 90+
- ✅ Microsoft Edge 90+
- ✅ Safari 15+ (macOS/iOS)

**Recursos da versão web:**
- Acesso via URL direta
- Todas as funcionalidades disponíveis
- Responsivo para desktop, tablet e mobile
- Sincronização em tempo real

### 📲 Versão Mobile (PWA)

O ObraPhoto funciona como um **aplicativo nativo** no celular:

#### 📱 Instalação no Android

1. Acesse o site pelo **Chrome**
2. Toque nos **3 pontos** (⋮) no canto superior direito
3. Selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**
4. Confirme tocando em **"Instalar"**
5. O ícone **ObraPhoto** aparecerá na sua tela inicial

#### 🍎 Instalação no iPhone/iPad

1. Acesse o site pelo **Safari** (obrigatório)
2. Toque no ícone de **Compartilhar** (□↑)
3. Role para baixo e toque em **"Adicionar à Tela de Início"**
4. Edite o nome se desejar e toque em **"Adicionar"**
5. O ícone aparecerá na sua tela inicial

### ⚡ Recursos PWA

| Recurso | Android | iOS |
|---------|:-------:|:---:|
| Instalável como app | ✅ | ✅ |
| Funciona offline | ✅ | ✅ |
| Notificações push | ✅ | ⚠️ Limitado |
| Tela cheia | ✅ | ✅ |
| Ícone na home | ✅ | ✅ |
| Atualizações automáticas | ✅ | ✅ |
| Acesso à câmera | ✅ | ✅ |
| Acesso ao GPS | ✅ | ✅ |

---

## 🎨 Design System v2.0

### Filosofia: Glassmorphism

O novo design utiliza o estilo **Glassmorphism** com:
- Efeitos de vidro fosco (backdrop-blur)
- Transparências suaves
- Gradientes sutis
- Sombras com glow colorido
- Bordas semitransparentes

### Paleta de Cores

| Cor | HSL | Uso |
|-----|-----|-----|
| **Primary** | `217 91% 60%` | Ações principais, botões, links |
| **Accent** | `189 94% 43%` | Destaques, badges, ícones |
| **Success** | `160 84% 39%` | Confirmações, status OK |
| **Warning** | `38 92% 50%` | Alertas, pendências |
| **Destructive** | `0 84% 60%` | Erros, exclusões |
| **Background** | `240 10% 4%` | Fundo principal escuro |
| **Card** | `240 10% 8%` | Fundo de cards |
| **Muted** | `240 10% 12%` | Elementos secundários |

### Tipografia

| Fonte | Uso | Peso |
|-------|-----|------|
| **Space Grotesk** | Títulos, headings, destaques | 500-700 |
| **Inter** | Texto corrido, labels, interface | 300-600 |
| **JetBrains Mono** | Códigos, dados técnicos | 400-500 |

### Componentes Glass

```css
/* Exemplo de uso */
.glass-card     /* Cards com blur e transparência */
.glass-header   /* Headers fixos com efeito fosco */
.glass-nav      /* Navegação inferior transparente */
.stat-card      /* Cards de estatísticas com glow */
.capture-btn    /* Botão principal com gradiente */
```

### Animações

| Animação | Duração | Uso |
|----------|---------|-----|
| `animate-fade-in` | 0.3s | Elementos aparecendo |
| `animate-slide-up` | 0.4s | Cards subindo |
| `animate-scale-in` | 0.2s | Elementos escalando |
| `animate-pulse-glow` | 2s | Botão de captura |

---

## 🛠️ Stack Tecnológica

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React | 18.3 | Biblioteca de UI |
| TypeScript | 5.0+ | Tipagem estática |
| Vite | 5.0+ | Build tool ultra-rápido |
| TailwindCSS | 3.4+ | Framework CSS utilitário |
| shadcn/ui | Latest | Componentes Radix acessíveis |
| React Router | 6.30+ | Roteamento SPA |
| TanStack Query | 5.83+ | Cache e estado servidor |
| date-fns | 3.6+ | Manipulação de datas |
| Lucide React | 0.462+ | Ícones modernos |

### Backend (Lovable Cloud)

| Tecnologia | Descrição |
|------------|-----------|
| PostgreSQL | Banco de dados relacional |
| Auth | Autenticação de usuários |
| Storage | Armazenamento de imagens |
| Edge Functions | Funções serverless (Deno) |
| RLS | Segurança a nível de linha |
| Realtime | Atualizações em tempo real |

### PWA & Offline

| Tecnologia | Descrição |
|------------|-----------|
| vite-plugin-pwa | Service Worker e manifest |
| IndexedDB (idb) | Armazenamento local estruturado |
| Workbox | Estratégias de cache |
| Web Push API | Notificações push |

### Mapas & Geo

| Tecnologia | Descrição |
|------------|-----------|
| Leaflet | Biblioteca de mapas open-source |
| React Leaflet | Integração com React |
| Geolocation API | Captura de coordenadas GPS |

---

## 🗄️ Modelo de Dados

### Diagrama de Entidades

```
┌─────────────────┐         ┌─────────────────┐
│    companies    │         │    projects     │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │────┐    │ id (PK)         │
│ name            │    └───▶│ company_id (FK) │
│ slug            │         │ name            │
│ created_at      │         │ description     │
└─────────────────┘         └────────┬────────┘
                                     │
┌─────────────────┐                  │
│    profiles     │                  │
├─────────────────┤                  │
│ id (PK/FK)      │──┐               │
│ full_name       │  │               │
│ avatar_url      │  │               │
│ created_at      │  │               │
└─────────────────┘  │               │
                     │               │
┌─────────────────┐  │    ┌──────────▼────────┐
│   user_roles    │  │    │   photo_records   │
├─────────────────┤  │    ├───────────────────┤
│ id (PK)         │  └───▶│ user_id (FK)      │
│ user_id (FK)    │       │ project_id (FK)   │
│ role (enum)     │       │ company_id (FK)   │
└─────────────────┘       │ file_url          │
                          │ file_path         │
┌─────────────────┐       │ latitude          │
│    templates    │       │ longitude         │
├─────────────────┤       │ device_timestamp  │
│ id (PK)         │──────▶│ template_id (FK)  │
│ name            │       │ ocr_status        │
│ icon            │       │ ocr_confidence    │
│ description     │       │ status            │
└─────────────────┘       └────────┬──────────┘
                                   │
                          ┌────────▼──────────┐
                          │extracted_entities │
                          ├───────────────────┤
                          │ id (PK)           │
                          │ photo_record_id   │
                          │ entity_type       │
                          │ entity_value      │
                          │ confidence_score  │
                          │ is_validated      │
                          └───────────────────┘
```

### Enums

```sql
-- Roles de usuário
CREATE TYPE app_role AS ENUM ('admin', 'colaborador');

-- Status de foto
-- 'pending', 'synced', 'error'

-- Status OCR
-- 'pending', 'processing', 'completed', 'failed'
```

### Tabelas Detalhadas

#### `profiles`
| Campo | Tipo | Null | Descrição |
|-------|------|:----:|-----------|
| id | UUID | ❌ | PK, referencia auth.users |
| full_name | TEXT | ❌ | Nome completo |
| avatar_url | TEXT | ✅ | URL do avatar |
| created_at | TIMESTAMPTZ | ❌ | Data de criação |
| updated_at | TIMESTAMPTZ | ❌ | Última atualização |

#### `user_roles`
| Campo | Tipo | Null | Descrição |
|-------|------|:----:|-----------|
| id | UUID | ❌ | PK |
| user_id | UUID | ❌ | FK para auth.users |
| role | app_role | ❌ | admin ou colaborador |

#### `companies`
| Campo | Tipo | Null | Descrição |
|-------|------|:----:|-----------|
| id | UUID | ❌ | PK |
| name | TEXT | ❌ | Nome da empresa |
| slug | TEXT | ❌ | Identificador único |
| created_at | TIMESTAMPTZ | ❌ | Data de criação |
| updated_at | TIMESTAMPTZ | ❌ | Última atualização |

#### `projects`
| Campo | Tipo | Null | Descrição |
|-------|------|:----:|-----------|
| id | UUID | ❌ | PK |
| company_id | UUID | ❌ | FK para companies |
| name | TEXT | ❌ | Nome do projeto |
| description | TEXT | ✅ | Descrição |
| created_at | TIMESTAMPTZ | ❌ | Data de criação |
| updated_at | TIMESTAMPTZ | ❌ | Última atualização |

#### `photo_records`
| Campo | Tipo | Null | Descrição |
|-------|------|:----:|-----------|
| id | UUID | ❌ | PK |
| user_id | UUID | ❌ | FK para auth.users |
| company_id | UUID | ✅ | FK para companies |
| company_name | TEXT | ✅ | Nome da empresa (cache) |
| project_id | UUID | ✅ | FK para projects |
| project_name | TEXT | ✅ | Nome do projeto (cache) |
| template_id | UUID | ✅ | FK para templates |
| file_url | TEXT | ❌ | URL pública da imagem |
| file_path | TEXT | ❌ | Caminho no storage |
| latitude | FLOAT | ✅ | Latitude GPS |
| longitude | FLOAT | ✅ | Longitude GPS |
| accuracy | FLOAT | ✅ | Precisão GPS (metros) |
| device_timestamp | TIMESTAMPTZ | ❌ | Data/hora do dispositivo |
| server_timestamp | TIMESTAMPTZ | ❌ | Data/hora do servidor |
| activity_text | TEXT | ✅ | Descrição da atividade |
| frente_servico | TEXT | ✅ | Frente de serviço |
| show_stamp | BOOLEAN | ❌ | Exibir carimbo |
| status | TEXT | ❌ | Status da foto |
| ocr_status | TEXT | ✅ | Status do OCR |
| ocr_raw_text | TEXT | ✅ | Texto bruto extraído |
| ocr_processed_text | TEXT | ✅ | Texto processado |
| ocr_confidence | FLOAT | ✅ | Confiança (0-100) |

---

## 🔐 Segurança

### Autenticação

- ✅ Autenticação via email/senha
- ✅ Auto-confirmação de email habilitada
- ✅ Tokens JWT com refresh automático
- ✅ Sessões seguras com expiração

### Autorização (RLS)

- ✅ Row Level Security em todas as tabelas
- ✅ Função `has_role()` para verificação de permissões
- ✅ Isolamento de dados por usuário
- ✅ Admins com acesso expandido

### Armazenamento

- ✅ Imagens em bucket privado
- ✅ URLs assinadas com expiração
- ✅ Validação de tipo de arquivo
- ✅ Limite de tamanho por upload

### Edge Functions

- ✅ Autenticação obrigatória
- ✅ Validação de payload
- ✅ Rate limiting
- ✅ Logs de auditoria

---

## 📂 Estrutura do Projeto

```
obraphoto/
├── public/
│   ├── manifest.webmanifest    # Configuração PWA
│   ├── pwa-192x192.png         # Ícone PWA 192x192
│   ├── pwa-512x512.png         # Ícone PWA 512x512
│   ├── favicon.ico             # Favicon
│   └── robots.txt              # SEO
│
├── src/
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   ├── BatchOCRPanel.tsx   # Processamento OCR em lote
│   │   ├── BottomNav.tsx       # Navegação inferior glass
│   │   ├── ConfidenceBadge.tsx # Badge de confiança OCR
│   │   ├── EntityList.tsx      # Lista de entidades
│   │   ├── NavLink.tsx         # Link de navegação
│   │   ├── NotificationToggle.tsx # Toggle notificações
│   │   ├── PhotoCard.tsx       # Card de foto glass
│   │   ├── PhotoStamp.tsx      # Carimbo na imagem
│   │   ├── PhotoTreeView.tsx   # Árvore hierárquica
│   │   ├── StatusBadge.tsx     # Badge de status
│   │   └── SyncIndicator.tsx   # Indicador de sync
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx     # Contexto de autenticação
│   │
│   ├── hooks/
│   │   ├── useAuth.ts          # Hook de autenticação
│   │   ├── useBatchOCR.ts      # Hook OCR em lote
│   │   ├── useGeolocation.ts   # Hook de GPS
│   │   ├── use-mobile.tsx      # Detecção mobile
│   │   ├── useNotifications.ts # Hook de push
│   │   ├── useOCR.ts           # Hook OCR individual
│   │   ├── useOfflineQueue.ts  # Fila offline
│   │   ├── useOnlineStatus.ts  # Status de conexão
│   │   ├── usePhotos.ts        # CRUD de fotos
│   │   ├── usePhotoTree.ts     # Árvore de fotos
│   │   ├── useProjects.ts      # CRUD de projetos
│   │   └── use-toast.ts        # Notificações toast
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts       # Cliente (auto-gerado)
│   │       └── types.ts        # Tipos (auto-gerado)
│   │
│   ├── lib/
│   │   ├── indexedDB.ts        # Storage local
│   │   └── utils.ts            # Utilitários
│   │
│   ├── pages/
│   │   ├── Admin.tsx           # Gestão de usuários
│   │   ├── AdminDashboard.tsx  # Dashboard admin
│   │   ├── Auth.tsx            # Login/Cadastro
│   │   ├── Capture.tsx         # Captura de foto
│   │   ├── Dashboard.tsx       # Tela inicial
│   │   ├── Index.tsx           # Redirecionamento
│   │   ├── Login.tsx           # Login (legacy)
│   │   ├── NotFound.tsx        # Página 404
│   │   ├── Pending.tsx         # Fotos pendentes
│   │   ├── PhotoBrowser.tsx    # Navegador admin
│   │   ├── PhotoDetail.tsx     # Detalhes da foto
│   │   ├── PhotoMap.tsx        # Mapa de fotos
│   │   ├── Photos.tsx          # Galeria
│   │   ├── Profile.tsx         # Perfil
│   │   └── Reports.tsx         # Relatórios
│   │
│   ├── types/
│   │   └── photo.ts            # Tipos de foto
│   │
│   ├── App.tsx                 # Componente raiz
│   ├── App.css                 # Estilos legados
│   ├── index.css               # Design tokens
│   ├── main.tsx                # Entry point
│   └── vite-env.d.ts           # Tipos Vite
│
├── supabase/
│   ├── config.toml             # Configuração
│   └── functions/
│       ├── admin-create-user/  # Criar usuários
│       ├── generate-report/    # Gerar relatórios
│       └── process-photo/      # OCR
│
├── index.html                  # HTML principal
├── tailwind.config.ts          # Config Tailwind
├── vite.config.ts              # Config Vite
├── tsconfig.json               # Config TypeScript
└── README.md                   # Este arquivo
```

---

## 🚀 Instalação e Desenvolvimento

### Pré-requisitos

- Node.js 18+ ou Bun 1.0+
- Git
- Conta no Lovable (para deploy)

### Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/obraphoto.git
cd obraphoto

# Instale as dependências
npm install
# ou
bun install

# Inicie o servidor de desenvolvimento
npm run dev
# ou
bun dev

# Acesse em http://localhost:5173
```

### Variáveis de Ambiente

O projeto usa Lovable Cloud, então as variáveis são configuradas automaticamente no arquivo `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
VITE_SUPABASE_PROJECT_ID=xxxxxx
```

⚠️ **Não edite o arquivo `.env` manualmente** - ele é gerenciado automaticamente.

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Verificação de código |

---

## 📱 Telas do Aplicativo

### Usuário Colaborador

| Tela | Rota | Descrição |
|------|------|-----------|
| 🔐 Login | `/` | Autenticação |
| 🏠 Dashboard | `/dashboard` | Estatísticas e ações rápidas |
| 📷 Captura | `/capture` | Formulário de nova foto |
| 🖼️ Fotos | `/photos` | Galeria de fotos enviadas |
| 🔍 Detalhes | `/photos/:id` | Detalhes e OCR da foto |
| ⏳ Pendentes | `/pending` | Fotos aguardando sync |
| 👤 Perfil | `/profile` | Configurações do usuário |

### Administrador (telas adicionais)

| Tela | Rota | Descrição |
|------|------|-----------|
| 🗺️ Mapa | `/photo-map` | Mapa com todas as fotos |
| ⚙️ Admin | `/admin` | Gestão de usuários |
| 📊 Dashboard Admin | `/admin-dashboard` | Métricas gerais |
| 📁 Browser | `/photo-browser` | Navegador hierárquico |
| 📋 Relatórios | `/reports` | Geração de relatórios |

---

## 🔄 Fluxo de Uso

```
                    ┌─────────────┐
                    │    LOGIN    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  DASHBOARD  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌───▼───┐ ┌──────▼──────┐
       │   CAPTURA   │ │ FOTOS │ │  PENDENTES  │
       └──────┬──────┘ └───────┘ └──────┬──────┘
              │                          │
       ┌──────▼──────┐              ┌────▼────┐
       │  ONLINE?    │              │  SYNC   │
       └──────┬──────┘              └────┬────┘
        Sim   │   Não                    │
        ┌─────┴─────┐                    │
        │           │                    │
   ┌────▼────┐ ┌────▼─────┐              │
   │ UPLOAD  │ │  SALVAR  │              │
   │ DIRETO  │ │ OFFLINE  │──────────────┘
   └────┬────┘ └──────────┘
        │
   ┌────▼────┐
   │ GALERIA │
   └─────────┘
```

---

## 🔧 Manutenção

### Atualizar o Aplicativo

O usuário pode forçar uma atualização:

1. Acesse **Perfil** (ícone de pessoa)
2. Toque em **"Atualizar Aplicativo"**
3. Aguarde o reload automático

### Limpar Cache

Em caso de problemas:

**Android/Chrome:**
1. Configurações > Apps > Chrome
2. Armazenamento > Limpar cache

**iOS/Safari:**
1. Configurações > Safari
2. Limpar Histórico e Dados

### Reinstalar o App

1. Remova o ícone da tela inicial
2. Acesse novamente pelo navegador
3. Reinstale seguindo as instruções

---

## 📞 Troubleshooting

| Problema | Solução |
|----------|---------|
| App não instala | Verifique se está usando Chrome (Android) ou Safari (iOS) |
| Fotos não sincronizam | Verifique conexão e toque em "Sincronizar" |
| GPS impreciso | Ative localização de alta precisão no dispositivo |
| Câmera não abre | Permita acesso à câmera nas configurações |
| Tela branca | Limpe o cache do navegador e recarregue |
| Login falha | Verifique email/senha e conexão com internet |

---

## 📄 Licença

Este projeto é propriedade de **ObraPhoto** e seu uso é restrito aos termos acordados.

---

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

<div align="center">

**Desenvolvido com ❤️ usando [Lovable](https://lovable.dev)**

**Versão**: 2.0.0  
**Última atualização**: Janeiro 2026

[⬆ Voltar ao topo](#-obraphoto-v20)

</div>

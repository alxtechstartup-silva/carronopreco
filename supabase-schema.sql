-- ====================================================================
-- SUPABASE SCHEMA SETUP FOR CARRO NO PREÇO
-- ====================================================================
-- Abra seu painel do Supabase, clique em "SQL Editor", crie uma nova query,
-- cole este script e execute-o para configurar todas as tabelas, RLS e índices.

-- ====================================================================
-- ATENÇÃO (OPÇÃO DE RESET SE PREFERIR LIMPAR O BANCO):
-- Se você não tem dados reais ainda no seu Supabase e deseja recriar as 
-- tabelas do zero para evitar erros de colunas faltantes, descomente as 
-- linhas abaixo antes de executar o script:
--
-- DROP TABLE IF EXISTS public.analytics CASCADE;
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.notes CASCADE;
-- DROP TABLE IF EXISTS public.events CASCADE;
-- DROP TABLE IF EXISTS public.leads CASCADE;
-- DROP TABLE IF EXISTS public.vehicles CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;
-- ====================================================================


-- 1. TABELA DE USUÁRIOS (Perfis integrados ao Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  "displayName" TEXT,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'cliente',
  "whatsappWebhook" TEXT,
  favorites TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Forçar criação de colunas caso a tabela já existisse vazia/antiga:
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "displayName" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'cliente';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "whatsappWebhook" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS favorites TEXT[] DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Ativar RLS para Usuários
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de perfis" ON public.users;
CREATE POLICY "Permitir leitura pública de perfis" ON public.users 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir que o usuário atualize o próprio perfil" ON public.users;
CREATE POLICY "Permitir que o usuário atualize o próprio perfil" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Permitir inserção pelo próprio usuário" ON public.users;
CREATE POLICY "Permitir inserção pelo próprio usuário" ON public.users 
  FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. TABELA DE VEÍCULOS (Anúncios de Carros)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "dealerId" TEXT,
  "ownerId" TEXT,
  brand TEXT,
  model TEXT,
  version TEXT,
  year INTEGER,
  "yearModel" INTEGER,
  km INTEGER,
  price NUMERIC,
  "fipePrice" NUMERIC,
  transmission TEXT,
  fuel TEXT,
  color TEXT,
  "bodyType" TEXT,
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  description TEXT,
  status TEXT DEFAULT 'active',
  "premiumListing" BOOLEAN DEFAULT false,
  "isPremium" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Forçar criação de colunas para garantir total compatibilidade com tabelas existentes:
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS "dealerId" TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS "ownerId" TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS version TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS "yearModel" INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS km INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS "fipePrice" NUMERIC;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS transmission TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS fuel TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS "bodyType" TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS "premiumListing" BOOLEAN DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS "isPremium" BOOLEAN DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Ativar RLS para Veículos
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de veículos" ON public.vehicles;
CREATE POLICY "Permitir leitura pública de veículos" ON public.vehicles 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção de veículos para autenticados" ON public.vehicles;
CREATE POLICY "Permitir inserção de veículos para autenticados" ON public.vehicles 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir que o dono edite seu próprio veículo" ON public.vehicles;
CREATE POLICY "Permitir que o dono edite seu próprio veículo" ON public.vehicles 
  FOR UPDATE USING (auth.uid()::text = "ownerId" OR auth.uid()::text = "dealerId" OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Permitir que o dono delete seu próprio veículo" ON public.vehicles;
CREATE POLICY "Permitir que o dono delete seu próprio veículo" ON public.vehicles 
  FOR DELETE USING (auth.uid()::text = "ownerId" OR auth.uid()::text = "dealerId");


-- 3. TABELA DE LEADS (Interesses em Veículos)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "vehicleId" TEXT,
  "dealerId" TEXT,
  "customerName" TEXT,
  "customerPhone" TEXT,
  "customerEmail" TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  score INTEGER,
  "aiPriority" TEXT,
  "aiAdvice" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Forçar criação de colunas faltantes em Leads:
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "vehicleId" TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "dealerId" TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "customerPhone" TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "customerEmail" TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS score INTEGER;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "aiPriority" TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "aiAdvice" TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Ativar RLS para Leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir inserção pública de leads" ON public.leads;
CREATE POLICY "Permitir inserção pública de leads" ON public.leads 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura de leads para lojistas ou equipe" ON public.leads;
CREATE POLICY "Permitir leitura de leads para lojistas ou equipe" ON public.leads 
  FOR SELECT USING (auth.role() = 'authenticated');


-- 4. TABELA DE EVENTOS (Agendamentos e Atividades da Agenda)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'agendamento',
  "eventDate" DATE NOT NULL,
  "eventTime" TIME,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Forçar criação de colunas em Eventos:
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "userId" UUID;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'agendamento';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "eventDate" DATE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "eventTime" TIME;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Ativar RLS para Eventos
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso completo de eventos apenas para o proprietário" ON public.events;
CREATE POLICY "Acesso completo de eventos apenas para o proprietário" ON public.events
  FOR ALL USING (auth.uid() = "userId");


-- 5. TABELA DE NOTAS & CHECKLISTS
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID,
  title TEXT NOT NULL,
  content TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Forçar criação de colunas em Notas:
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS "userId" UUID;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Ativar RLS para Notas
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso completo de notas apenas para o proprietário" ON public.notes;
CREATE POLICY "Acesso completo de notas apenas para o proprietário" ON public.notes
  FOR ALL USING (auth.uid() = "userId");


-- 6. TABELA DE NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  message TEXT,
  read BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Forçar criação de colunas em Notações:
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Ativar RLS para Notificações
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Proprietário pode ler e atualizar suas próprias notificações" ON public.notifications;
CREATE POLICY "Proprietário pode ler e atualizar suas próprias notificações" ON public.notifications
  FOR ALL USING (auth.uid()::text = "userId");


-- 7. TABELA DE ANALYTICS
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT DEFAULT 'PAGE_VIEW',
  path TEXT,
  referrer TEXT,
  "userAgent" TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Forçar criação de colunas em Analytics:
ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS event TEXT DEFAULT 'PAGE_VIEW';
ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS path TEXT;
ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Ativar RLS para Analytics
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir inserções públicas em analytics" ON public.analytics;
CREATE POLICY "Permitir inserções públicas em analytics" ON public.analytics
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Visualização de analytics apenas para equipe autorizada" ON public.analytics;
CREATE POLICY "Visualização de analytics apenas para equipe autorizada" ON public.analytics
  FOR SELECT USING (auth.role() = 'authenticated');

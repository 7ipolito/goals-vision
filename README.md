# GoalVision - Football Performance Analytics

A plataforma definitiva para análise de desempenho no futebol. Transforme dados em vitórias.

## 🚀 Características

- **Análises Avançadas**: Estatísticas detalhadas e insights profundos
- **Performance em Campo**: Monitoramento em tempo real 
- **Estratégias Vencedoras**: Decisões baseadas em dados

## 🌍 Idiomas Suportados

- 🇧🇷 Português
- 🇺🇸 English

## 🏗️ Arquitetura

O projeto segue uma arquitetura bem estruturada com separação de responsabilidades:

```
src/
├── app/                    # Next.js App Router
├── contexts/              # React Contexts (Language)
├── entities/              # Componentes de domínio
│   └── Home/
│       └── components/    # Componentes específicos da Home
├── hooks/                 # Custom hooks
├── locales/              # Arquivos de tradução
├── types/                # Definições de tipos TypeScript
└── views/                # Views/Páginas da aplicação
```

## 🎯 Perfis de Usuário

### Jogador ⚽
- Estatísticas pessoais detalhadas
- Análise de performance por jogo
- Metas e objetivos personalizados
- Comparação com outros jogadores

### Técnico 📋
- Gestão completa da equipe
- Análise tática avançada
- Relatórios de desempenho
- Planejamento estratégico

## 🛠️ Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Context** - Gerenciamento de estado
- **Internacionalização** - Sistema i18n customizado

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar versão de produção
npm start
```

## 📝 Sistema de Tradução

O sistema de tradução é baseado em arquivos JSON localizados em `src/locales/`:

- `pt.json` - Traduções em português
- `en.json` - Traduções em inglês

### Como usar traduções:

```tsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('header.title')}</h1>;
}
```

## 🎨 Design System

- **Cores**: Paleta azul e verde com gradientes
- **Tipografia**: Geist Sans e Geist Mono
- **Efeitos**: Glassmorphism e backdrop blur
- **Animações**: Smooth transitions e hover effects

## 📱 Responsividade

O design é totalmente responsivo, adaptando-se a:
- Desktop (1024px+)
- Tablet (768px - 1023px) 
- Mobile (320px - 767px)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

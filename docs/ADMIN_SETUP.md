# Feed Loves · configuração do painel

## Variáveis locais

Copie `.env.example` para `.env.local` e preencha a chave publishable do projeto Supabase `feedloves` (`eszxogjhiwezdaftrsdz`). A chave publishable/anon pode ser usada no navegador; nenhuma `service_role` ou secret deve ser colocada no frontend.

## Primeiro administrador

1. No Supabase, abra Authentication → Users e crie o usuário com e-mail e senha.
2. Abra o SQL Editor e execute, substituindo o UUID pelo ID daquele usuário:

```sql
insert into public.user_roles (user_id, role)
values ('UUID_DO_USUARIO', 'admin')
on conflict (user_id) do update set role = 'admin';
```

3. Entre em `/admin/login` com esse e-mail e senha.

Todo usuário Auth novo recebe automaticamente o papel `customer`. A promoção para `admin` é deliberadamente manual e server-side.

## Migrations aplicadas

- `20261005190000_create_feedloves_admin.sql`: schema do catálogo, episódios, planos, checkout, assinaturas, mídia, configurações, auditoria, Auth trigger, RLS e Storage.
- `20261005191500_harden_feedloves_rbac.sql`: revoga execução pública de funções privilegiadas e adiciona índices de chaves estrangeiras.

O bucket `feedloves-media` é público para leitura dos arquivos publicados e aceita upload, substituição e remoção somente por administradores via RLS.

## Operação do painel

- `/admin/assinaturas` permite conceder acesso manual, trocar plano, ativar, pausar, cancelar, remover acesso e conceder acesso vitalício. Cada mutação gera uma linha em `subscription_history` e passa pelo RLS de administrador.
- `/admin/novelas` permite criar, editar, publicar, ocultar e excluir novelas, incluindo capa, banner, thumbnail, classificação e ordem.
- `/admin/episodios` permite criar, editar, publicar, ocultar, agendar e excluir episódios, com provider, URL, thumbnail, duração, acesso por plano e ordem.
- Clientes e assinaturas possuem busca e filtros por status e plano.

## Limites atuais

O checkout público da Parte 2 já consulta `plans` e `checkout_settings` quando houver planos ativos e URLs principais configuradas. Enquanto o banco estiver vazio ou sem checkout configurado, os planos públicos atuais continuam como fallback para preservar o fluxo existente, preços, UTMs, Meta Pixel e links atuais.

Ainda não há webhook de pagamento no projeto para sincronizar automaticamente eventos do provedor. A integração precisa ser adicionada quando o provedor de checkout e suas credenciais forem definidos.

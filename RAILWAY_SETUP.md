# Configuration Railway

## Variables d'environnement requises

### Backend

Assurez-vous que les variables suivantes sont configurées dans Railway pour le service backend :

- `DATABASE_URL` - URL de connexion PostgreSQL
- `REDIS_URL` - URL de connexion Redis
- `CLERK_SECRET_KEY` - Clé secrète Clerk (pour l'authentification backend)
- `FRONTEND_URL` - URL du frontend pour CORS (ex: `https://votre-frontend.up.railway.app`). Sans cela, l'onglet **Agent IA** et les appels API depuis le frontend échouent avec "Load failed".

### Frontend

Assurez-vous que les variables suivantes sont configurées dans Railway pour le service frontend :

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clé publique Clerk (commence par `pk_`)
- `CLERK_SECRET_KEY` - Clé secrète Clerk (commence par `sk_`) - **OBLIGATOIRE pour le middleware**
- `NEXT_PUBLIC_API_URL` - URL de l'API backend (ex: `https://backend-production-xxx.up.railway.app`). **Requis pour l'onglet Agent IA** (RAG) ; sinon "Load failed" en production.

## Configuration Clerk

1. Allez sur https://dashboard.clerk.com
2. Sélectionnez votre application
3. Allez dans **API Keys**
4. Copiez :
   - **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY` (pour backend ET frontend)

⚠️ **Important** : `CLERK_SECRET_KEY` doit être configurée dans **les deux services** (backend et frontend) car :
- Le backend l'utilise pour vérifier les tokens JWT
- Le frontend l'utilise dans le middleware Next.js pour protéger les routes

## Vérification

Après avoir configuré les variables, redéployez les services. Les logs doivent montrer :
- Backend : `cors_origins` avec les origines configurées
- Frontend : Pas d'erreur `Missing secretKey`

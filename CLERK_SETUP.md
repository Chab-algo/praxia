# Guide de configuration Clerk

Ce guide vous explique comment configurer Clerk pour l'authentification dans votre application Praxia.

## 📋 Prérequis

1. Un compte Clerk (gratuit) : [https://clerk.com](https://clerk.com)
2. Node.js et npm installés
3. Python et les dépendances du backend installées

## 🚀 Étapes de configuration

### 1. Créer un compte et une application Clerk

1. Allez sur [https://clerk.com](https://clerk.com) et créez un compte
2. Cliquez sur "Create Application"
3. Choisissez un nom pour votre application (ex: "Praxia")
4. Sélectionnez les méthodes d'authentification que vous souhaitez :
   - Email/Password
   - OAuth (Google, GitHub, etc.)
   - Social providers

### 2. Récupérer les clés API

Une fois votre application créée, allez dans **API Keys** dans le dashboard Clerk :

#### Pour le Frontend (Next.js)
- **Publishable Key** : Commence par `pk_test_` ou `pk_live_`
  - Copiez cette clé dans `.env` comme `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

#### Pour le Backend (FastAPI)
- **Secret Key** : Commence par `sk_test_` ou `sk_live_`
  - Copiez cette clé dans `.env` comme `CLERK_SECRET_KEY`

### 3. Configurer le domaine Clerk

Dans le dashboard Clerk, allez dans **Domains** :
- Vous verrez un domaine par défaut comme `your-app.clerk.accounts.dev`
- Copiez ce domaine dans `.env` comme `CLERK_DOMAIN`

### 4. Configurer les webhooks (optionnel mais recommandé)

Les webhooks permettent à Clerk de synchroniser automatiquement les utilisateurs avec votre base de données.

1. Dans le dashboard Clerk, allez dans **Webhooks**
2. Cliquez sur **Add Endpoint**
3. Configurez :
   - **Endpoint URL** : `http://localhost:8000/api/auth/webhook` (pour le développement)
   - **Events** : Sélectionnez au minimum :
     - `user.created`
     - `user.updated`
     - `user.deleted`
     - `session.created`
     - `session.ended`
4. Copiez le **Signing Secret** dans `.env` comme `CLERK_WEBHOOK_SECRET`

> **Note pour la production** : Vous devrez utiliser un service comme ngrok pour exposer votre webhook local, ou configurer l'URL de production.

### 5. Mettre à jour le fichier .env

Ouvrez le fichier `.env` à la racine du projet et remplissez les valeurs :

```env
# Frontend
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Backend
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_DOMAIN=your-app.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 6. Vérifier la configuration

#### Frontend
Les routes d'authentification sont déjà configurées :
- `/sign-in` - Page de connexion
- `/sign-up` - Page d'inscription

Le middleware protège automatiquement toutes les autres routes.

#### Backend
L'authentification est gérée via :
- `app/auth/middleware.py` - Vérification des tokens JWT
- `app/auth/dependencies.py` - Dépendances FastAPI pour obtenir l'utilisateur actuel

## 🔒 Utilisation dans le code

### Frontend (Next.js)

```tsx
import { useUser } from '@clerk/nextjs';

export default function MyComponent() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Hello {user.emailAddresses[0].emailAddress}!</div>;
}
```

### Backend (FastAPI)

```python
from app.auth.dependencies import get_current_user
from app.auth.models import User

@router.get("/protected")
async def protected_route(user: User = Depends(get_current_user)):
    return {"message": f"Hello {user.email}!"}
```

## 🧪 Tester la configuration

1. Démarrez le backend :
   ```bash
   cd backend
   uv run uvicorn app.main:app --reload
   ```

2. Démarrez le frontend :
   ```bash
   cd frontend
   npm run dev
   ```

3. Visitez `http://localhost:3000` et essayez de vous connecter

## 🐛 Dépannage

### Erreur "Invalid token"
- Vérifiez que `CLERK_SECRET_KEY` est correct dans `.env`
- Vérifiez que le token JWT est bien envoyé dans les headers : `Authorization: Bearer <token>`

### Erreur "ClerkProvider not found"
- Vérifiez que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` est défini
- Redémarrez le serveur Next.js après modification de `.env`

### Webhooks ne fonctionnent pas
- Vérifiez que l'URL du webhook est accessible
- Utilisez ngrok pour le développement local : `ngrok http 8000`
- Vérifiez que `CLERK_WEBHOOK_SECRET` correspond au secret dans le dashboard

## 📚 Ressources

- [Documentation Clerk](https://clerk.com/docs)
- [Clerk Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Backend API](https://clerk.com/docs/backend-requests/overview)

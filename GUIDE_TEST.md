# Guide de Test - PraxIA Platform

Ce guide vous explique comment tester les fonctionnalités principales de la plateforme après déploiement sur Railway.

## Prérequis

1. **Accès à l'application** : URL de votre frontend déployé (ex: `https://frontend-production-a229.up.railway.app`)
2. **Compte Clerk** : Créez un compte ou connectez-vous
3. **Données de test** : Aucune donnée requise au départ, nous créerons tout pendant les tests

---

## 1. 🧪 Recipe Builder (Générateur de Recipes IA)

### Objectif
Tester la génération automatique de recipes à partir d'un besoin métier décrit en langage naturel.

### Étapes de test

#### Via l'interface web :

1. **Accéder au Recipe Builder**
   - Connectez-vous à l'application
   - Dans le menu de navigation, cliquez sur **"Recipes"**
   - Cliquez sur l'onglet **"Mes Recipes"** ou le bouton **"Créer une Recipe"**
   - Vous devriez voir une option **"Assistant IA"** ou **"Recipe Builder"**

2. **Générer une recipe**
   - Dans le champ de texte, décrivez un besoin métier, par exemple :
     ```
     Je veux un agent qui analyse les avis clients sur mes produits 
     et génère un résumé avec les points positifs et négatifs. 
     Il doit aussi suggérer des améliorations.
     ```
   - Sélectionnez un domaine (ex: "e-commerce", "customer-service")
   - Cliquez sur **"Générer"** ou **"Créer avec l'IA"**

3. **Vérifier le résultat**
   - Une recipe YAML structurée devrait être générée
   - Vérifiez qu'elle contient :
     - Un `slug` unique
     - Un `name` descriptif
     - Des `steps` avec des appels LLM
     - Un `input_schema` et `output_schema`

4. **Valider la recipe**
   - Cliquez sur **"Valider"** pour vérifier la syntaxe
   - Corrigez les erreurs éventuelles
   - Cliquez sur **"Sauvegarder"** pour créer votre recipe personnalisée

#### Via l'API (avec curl ou Postman) :

```bash
# 1. Obtenir un token d'authentification (remplacez avec votre token Clerk)
TOKEN="votre_token_clerk"

# 2. Générer une recipe
curl -X POST "https://votre-backend.up.railway.app/api/recipes/builder/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requirement": "Je veux un agent qui analyse les avis clients et génère un résumé avec points positifs et négatifs",
    "domain": "e-commerce",
    "examples": null
  }'

# 3. Valider une recipe
curl -X POST "https://votre-backend.up.railway.app/api/recipes/builder/validate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipe": {
      "slug": "customer-review-analyzer",
      "name": "Analyseur d'avis clients",
      "steps": [...]
    }
  }'

# 4. Créer une recipe personnalisée
curl -X POST "https://votre-backend.up.railway.app/api/recipes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipe": {
      "slug": "my-custom-recipe",
      "name": "Ma Recipe Personnalisée",
      "description": "Description de ma recipe",
      "category": "custom",
      "steps": [...]
    }
  }'
```

### Résultats attendus
- ✅ Génération réussie d'une recipe structurée
- ✅ Validation détecte les erreurs de syntaxe
- ✅ Sauvegarde dans "Mes Recipes"
- ✅ Recipe visible dans la liste des recipes personnalisées

---

## 2. 📊 CRM (Gestion de Leads)

### Objectif
Tester la création, visualisation et gestion des leads dans le système CRM.

### Étapes de test

#### Via l'interface web :

1. **Accéder au CRM**
   - Dans le menu de navigation, cliquez sur **"CRM"**
   - Vous devriez voir un tableau Kanban avec les colonnes :
     - Nouveau (New)
     - Contacté (Contacted)
     - Qualifié (Qualified)
     - Proposition (Proposal)
     - Négociation (Negotiation)
     - Gagné (Closed Won)
     - Perdu (Closed Lost)

2. **Créer un nouveau lead**
   - Cliquez sur **"Nouveau Lead"** ou **"+"**
   - Remplissez le formulaire :
     - **Email** : `test@example.com` (obligatoire)
     - **Nom complet** : `Jean Dupont`
     - **Entreprise** : `Acme Corp`
     - **Téléphone** : `+33 6 12 34 56 78`
     - **Poste** : `Directeur Marketing`
     - **Source** : `Website`
     - **Notes** : `Intéressé par nos agents IA pour automatiser le support client`
   - Cliquez sur **"Créer"**

3. **Vérifier le lead créé**
   - Le lead devrait apparaître dans la colonne **"Nouveau"**
   - Un **score** devrait être calculé automatiquement (0-100)
   - Le score dépend de :
     - Domaine email (entreprise vs personnel)
     - Présence d'une entreprise
     - Poste (executive/manager = score plus élevé)
     - Présence d'un téléphone

4. **Déplacer un lead (drag & drop)**
   - Cliquez et glissez le lead vers une autre colonne (ex: "Contacté")
   - Le statut devrait se mettre à jour automatiquement

5. **Voir les détails d'un lead**
   - Cliquez sur un lead pour voir sa page détaillée
   - Vous devriez voir :
     - Informations de contact complètes
     - Score du lead
     - Timeline des interactions
     - Notes

6. **Ajouter une interaction**
   - Sur la page de détail du lead, cliquez sur **"Ajouter une interaction"**
   - Sélectionnez un type : Email, Appel, Réunion, Démo, Note
   - Ajoutez un sujet et des notes
   - Cliquez sur **"Enregistrer"**
   - L'interaction devrait apparaître dans la timeline

#### Via l'API :

```bash
# 1. Créer un lead
curl -X POST "https://votre-backend.up.railway.app/api/crm/leads" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Jean Dupont",
    "company": "Acme Corp",
    "phone": "+33 6 12 34 56 78",
    "job_title": "Directeur Marketing",
    "source": "Website",
    "notes": "Intéressé par nos agents IA"
  }'

# 2. Lister les leads
curl -X GET "https://votre-backend.up.railway.app/api/crm/leads?status=new" \
  -H "Authorization: Bearer $TOKEN"

# 3. Obtenir un lead spécifique
curl -X GET "https://votre-backend.up.railway.app/api/crm/leads/{lead_id}" \
  -H "Authorization: Bearer $TOKEN"

# 4. Mettre à jour un lead
curl -X PATCH "https://votre-backend.up.railway.app/api/crm/leads/{lead_id}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "contacted",
    "score": 75
  }'

# 5. Ajouter une interaction
curl -X POST "https://votre-backend.up.railway.app/api/crm/leads/{lead_id}/interactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email",
    "subject": "Premier contact",
    "notes": "Envoyé une présentation de nos services",
    "outcome": "positive"
  }'
```

### Résultats attendus
- ✅ Création de lead avec score automatique
- ✅ Affichage en tableau Kanban
- ✅ Drag & drop fonctionne pour changer le statut
- ✅ Page de détail affiche toutes les informations
- ✅ Ajout d'interactions dans la timeline
- ✅ Workflow automatique déclenché à la création (qualification automatique si score élevé)

---

## 3. 📈 Analytics et Insights

### Objectif
Tester l'affichage des statistiques, tendances et recommandations automatiques.

### Étapes de test

#### Via l'interface web :

1. **Accéder aux Analytics**
   - Dans le menu de navigation, cliquez sur **"Analytics"**
   - Vous devriez voir plusieurs sections :
     - **Vue d'ensemble** (Overview)
     - **Tendances** (Trends)
     - **Insights automatiques** (Automated Insights)
     - **Statistiques par agent** (Agent Stats)
     - **Timeline** (Timeline)

2. **Vue d'ensemble**
   - Vérifiez l'affichage de :
     - Nombre total d'exécutions
     - Coût total
     - Nombre d'agents créés
     - Taux de succès moyen
   - Si vous n'avez pas encore d'exécutions, les valeurs devraient être à 0

3. **Tendances**
   - Cliquez sur l'onglet **"Tendances"**
   - Vous devriez voir un graphique avec :
     - Utilisation quotidienne (exécutions par jour)
     - Coût par jour
     - Taux de succès par jour
   - Testez avec différentes périodes (7 jours, 30 jours, 90 jours)

4. **Insights automatiques**
   - Cliquez sur l'onglet **"Insights"**
   - Le système devrait afficher des recommandations automatiques, par exemple :
     - "Votre agent X a un taux d'erreur élevé, considérez d'optimiser..."
     - "Vous avez créé 5 agents cette semaine, excellent travail !"
     - "Le coût moyen par exécution a augmenté de 20%"
   - Si vous n'avez pas encore de données, les insights peuvent être vides ou génériques

5. **Statistiques par agent**
   - Cliquez sur l'onglet **"Agents"**
   - Vous devriez voir une liste de vos agents avec :
     - Nombre d'exécutions
     - Taux de succès
     - Coût total
     - Temps moyen d'exécution

6. **Timeline**
   - Cliquez sur l'onglet **"Timeline"**
   - Vous devriez voir un historique chronologique de :
     - Créations d'agents
     - Exécutions réussies/échouées
     - Événements importants

#### Via l'API :

```bash
# 1. Vue d'ensemble
curl -X GET "https://votre-backend.up.railway.app/api/analytics/overview" \
  -H "Authorization: Bearer $TOKEN"

# 2. Tendances (30 derniers jours)
curl -X GET "https://votre-backend.up.railway.app/api/analytics/trends?days=30" \
  -H "Authorization: Bearer $TOKEN"

# 3. Insights automatiques
curl -X GET "https://votre-backend.up.railway.app/api/analytics/insights" \
  -H "Authorization: Bearer $TOKEN"

# 4. Statistiques par agent
curl -X GET "https://votre-backend.up.railway.app/api/analytics/agents" \
  -H "Authorization: Bearer $TOKEN"

# 5. Timeline (30 derniers jours)
curl -X GET "https://votre-backend.up.railway.app/api/analytics/timeline?days=30" \
  -H "Authorization: Bearer $TOKEN"
```

### Résultats attendus
- ✅ Vue d'ensemble affiche les métriques principales
- ✅ Graphiques de tendances se mettent à jour selon la période
- ✅ Insights automatiques proposent des recommandations pertinentes
- ✅ Statistiques par agent sont précises
- ✅ Timeline montre l'historique chronologique

---

## 4. 🔗 Tests d'intégration entre fonctionnalités

### Scénario complet : De la création d'un lead à l'analyse

1. **Créer un lead via le CRM**
   - Créez un lead avec un score élevé (>70)
   - Le workflow automatique devrait le qualifier automatiquement

2. **Créer un agent avec le Recipe Builder**
   - Utilisez le Recipe Builder pour créer un agent personnalisé
   - Sauvegardez la recipe

3. **Exécuter l'agent**
   - Créez un agent à partir de la recipe
   - Exécutez-le plusieurs fois avec différents inputs

4. **Vérifier les Analytics**
   - Allez dans Analytics
   - Vérifiez que les exécutions apparaissent dans les statistiques
   - Vérifiez que les insights mentionnent votre nouvel agent

---

## 5. 🐛 Dépannage

### Problèmes courants

#### "Missing secretKey" dans les logs frontend
- **Solution** : Vérifiez que `CLERK_SECRET_KEY` est configurée dans Railway pour le service frontend

#### Erreur 401 (Unauthorized)
- **Solution** : Vérifiez que vous êtes bien connecté et que votre token Clerk est valide

#### Aucune donnée dans Analytics
- **Solution** : C'est normal si vous n'avez pas encore créé d'agents ou d'exécutions. Créez quelques agents et exécutez-les pour générer des données.

#### Erreur lors de la génération de recipe
- **Solution** : Vérifiez que `OPENAI_API_KEY` est configurée dans Railway pour le backend

#### Migration Alembic échoue
- **Solution** : Vérifiez les logs du backend. Si la migration `005_rename_metadata` échoue, vous pouvez la lancer manuellement ou vérifier que la colonne `metadata` existe encore dans la base de données.

---

## 6. 📝 Checklist de test complète

- [ ] Recipe Builder : Génération réussie d'une recipe
- [ ] Recipe Builder : Validation détecte les erreurs
- [ ] Recipe Builder : Sauvegarde d'une recipe personnalisée
- [ ] CRM : Création d'un lead avec score automatique
- [ ] CRM : Affichage en tableau Kanban
- [ ] CRM : Drag & drop pour changer le statut
- [ ] CRM : Page de détail d'un lead
- [ ] CRM : Ajout d'interactions
- [ ] Analytics : Vue d'ensemble affiche les métriques
- [ ] Analytics : Tendances avec graphiques
- [ ] Analytics : Insights automatiques
- [ ] Analytics : Statistiques par agent
- [ ] Analytics : Timeline chronologique

---

## 7. 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Railway (backend et frontend)
2. Vérifiez que toutes les variables d'environnement sont configurées
3. Vérifiez la documentation API dans `/docs` (Swagger UI) sur votre backend

---

**Bon test ! 🚀**

# Back-office — Mariage Lénaelle & Mathieu

Tableau de bord d'administration du mariage : statistiques des réponses (RSVP),
liste des invités et informations clés. Construit avec **React + Vite +
TypeScript**, **TailwindCSS v4**, composants **shadcn/ui** (style new-york) et
graphiques **Recharts**. Palette éditoriale chaleureuse (ivoire / terracotta /
sauge), cohérente avec le site invité `wedding`.

## Pages

- **Vue d'ensemble** — cartes statistiques (invités confirmés, réponses,
  adultes/enfants, allergies), courbe cumulée des RSVP, répartition des convives
  (donut) et liste des allergies.
- **Invités** — table de tous les foyers et convives, recherche, export CSV.
- **Informations** — lieu de réception, mairie, date, code d'accès, site invité
  et contacts des mariés.

L'accès est protégé par un **écran de connexion admin** (table `users` de
l'API, JWT).

## Démarrage

Le back-office consomme l'API `api_mariage`. En développement, les requêtes
`/api/*` sont relayées vers `http://localhost:3000` (proxy Vite).

```bash
# 1. Lancer l'API (dans ../api_mariage)
cd ../api_mariage && yarn dev      # écoute sur le port 3000

# 2. Lancer le back-office
yarn dev                            # http://localhost:5174
```

Identifiants par défaut (seedés par l'API) : `admin` / valeur de
`ADMIN_PASSWORD` côté API.

## Variables d'environnement

- `.env` — `VITE_API_URL=` (vide en dev, le proxy gère le relais)
- `.env.production` — `VITE_API_URL=https://api-mariage.onrender.com`

## Endpoints API consommés

| Méthode | Route               | Description                          |
| ------- | ------------------- | ------------------------------------ |
| POST    | `/api/admin/login`  | Connexion admin → JWT (rôle admin)   |
| GET     | `/api/admin/stats`  | Agrégats pour les statistiques       |
| GET     | `/api/admin/rsvps`  | Liste des RSVP avec leurs convives   |

## Build

```bash
yarn build      # tsc -b && vite build → dist/
yarn preview    # prévisualisation du build
```

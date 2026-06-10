# Back-office — Mariage Lénaelle & Mathieu

Tableau de bord d'administration du mariage : statistiques des réponses (RSVP),
liste des invités et informations clés. Construit avec **React + Vite +
TypeScript**, **TailwindCSS v4**, composants **shadcn/ui** (style new-york) et
graphiques **Recharts**. Palette éditoriale chaleureuse (ivoire / terracotta /
sauge), cohérente avec le site invité `wedding`.

## Pages

- **Vue d'ensemble** — cartes statistiques (invités confirmés, réponses,
  adultes/enfants, allergies), courbe cumulée des RSVP, répartition des convives
  (donut), liste des allergies et **répartition par appareil** (téléphone /
  tablette / ordinateur, détecté discrètement à la réponse).
- **Invités** — table de tous les foyers et convives (avec l'appareil utilisé),
  recherche, export CSV.
- **Témoins** — carnet d'adresses des prestataires (traiteur, DJ, photographe…)
  partagé avec les témoins : ajout / modification / suppression, regroupé par
  catégorie, avec téléphone, email, adresse, site et notes.
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
| GET     | `/api/admin/stats`  | Agrégats (dont répartition appareil) |
| GET     | `/api/admin/rsvps`  | Liste des RSVP (avec `device`)       |
| GET     | `/api/vendors`      | Liste des prestataires               |
| POST    | `/api/vendors`      | Crée un prestataire                  |
| PUT     | `/api/vendors/:id`  | Met à jour un prestataire            |
| DELETE  | `/api/vendors/:id`  | Supprime un prestataire              |

## Build

```bash
yarn build      # tsc -b && vite build → dist/
yarn preview    # prévisualisation du build
```

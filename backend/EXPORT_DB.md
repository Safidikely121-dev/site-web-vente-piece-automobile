# Export de la base de données (SQLite)

## DB active de l’API
L’API Nest/TypeORM utilise :
- `backend/ventepieces.db` (créé automatiquement, non versionné)

## Export recommandé
### 1) Copier le fichier `.db`
Depuis la racine du projet :
```bat
copy backend\ventepieces.db backend\exports\ventepieces.db.backup_YYYYMMDD.db
```

### 2) (Optionnel) Dump SQL
Si tu as `sqlite3` installé :
```bat
mkdir backend\exports
sqlite3 backend\ventepieces.db ".backup backend\exports\ventepieces.db.backup"
sqlite3 backend\ventepieces.db ".dump" > backend\exports\ventepieces.sql
```

## Seed
Le script `backend/src/seed.ts` peuple directement `backend/ventepieces.db`
(lancer depuis le dossier `backend` avec `npx ts-node src/seed.ts`).
Il crée les comptes admin technique / commercial et un acheteur de test (mot de passe `password123`).

## Notes
- Les fichiers `.db` sont ignorés par `.gitignore` : ils ne sont pas versionnés.
- En production, privilégier des migrations TypeORM plutôt que `synchronize: true`.
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Script de seed de la base active `ventepieces.db`.
 * Crée les comptes administrateurs initiaux (technique + commercial)
 * ainsi qu'un utilisateur de test, puis les comptes vendeur/acheteur.
 *
 * Lancer depuis le dossier backend : `npx ts-node src/seed.ts`
 */
async function seed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'ventepieces.db',
    synchronize: true,
  });

  await dataSource.initialize();

  const hashedPassword = await bcrypt.hash('password123', 10);

  await dataSource.query(
    `
    INSERT OR IGNORE INTO user (email, password, pseudo, role, createdAt) VALUES
    ('admin@autoparts.com', ?, 'Admin technique', 'admin_technique', CURRENT_TIMESTAMP),
    ('commercial@autoparts.com', ?, 'Admin commercial', 'admin_commercial', CURRENT_TIMESTAMP),
    ('user@test.com', ?, 'User', 'acheteur', CURRENT_TIMESTAMP)
  `,
    [hashedPassword, hashedPassword, hashedPassword],
  );

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { getDb, save } from '../../db/client.js';

export async function getRelationships({ source_type, source_id }) {
  const db = await getDb();
  const result = db.exec(
    `SELECT * FROM relationships
     WHERE source_type = '${source_type}' AND source_id = ${source_id}
     ORDER BY created_at DESC`
  );
  if (!result.length) return [];
  const [{ columns, values }] = result;
  return values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

export async function createRelationship({ source_type, source_id, target_type, target_id }) {
  const db = await getDb();
  try {
    db.run(
      `INSERT INTO relationships (source_type, source_id, target_type, target_id)
       VALUES (?, ?, ?, ?)`,
      [source_type, source_id, target_type, target_id]
    );
    save();
    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];
    return { id, source_type, source_id, target_type, target_id };
  } catch (e) {
    if (e.message && e.message.includes('UNIQUE')) {
      throw new Error('relationship already exists');
    }
    throw e;
  }
}

export async function deleteRelationship(id) {
  const db = await getDb();
  db.run(`DELETE FROM relationships WHERE id = ${id}`);
  save();
}

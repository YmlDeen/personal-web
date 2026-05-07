import { Router } from 'express';
import { getRelationships, createRelationship, deleteRelationship } from './relationships.service.js';

const router = Router();

router.get('/', async (req, res) => {
  const { source_type, source_id } = req.query;
  if (!source_type || !source_id) {
    return res.status(400).json({ error: 'source_type and source_id required' });
  }
  try {
    const data = await getRelationships({ source_type, source_id: Number(source_id) });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  const { source_type, source_id, target_type, target_id } = req.body;
  if (!source_type || !source_id || !target_type || !target_id) {
    return res.status(400).json({ error: 'all fields required' });
  }
  try {
    const rel = await createRelationship({ source_type, source_id, target_type, target_id });
    res.status(201).json(rel);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteRelationship(Number(req.params.id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

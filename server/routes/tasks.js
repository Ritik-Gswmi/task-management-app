import express from 'express';
import Task from '../models/Task.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  const { search = '', status = '', page = 1, limit = 10 } = req.query;
  const filters = { userId: req.user.id };

  if (status && ['pending', 'completed'].includes(status)) {
    filters.status = status;
  }

  if (search.trim()) {
    filters.title = { $regex: search.trim(), $options: 'i' };
  }

  try {
    const numericPage = Math.max(Number(page), 1);
    const numericLimit = Math.max(Number(limit), 1);
    const skip = (numericPage - 1) * numericLimit;

    const total = await Task.countDocuments(filters);
    const tasks = await Task.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit);

    return res.json({ tasks, total, page: numericPage, limit: numericLimit, pages: Math.ceil(total / numericLimit) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Could not load tasks.' });
  }
});

router.post('/', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Task title is required.' });
  }

  try {
    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      userId: req.user.id,
    });
    return res.status(201).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Could not create task.' });
  }
});

router.put('/:id', async (req, res) => {
  const update = {};
  const { title, description, status } = req.body;

  if (title !== undefined) update.title = title.trim();
  if (description !== undefined) update.description = description.trim();
  if (status && ['pending', 'completed'].includes(status)) update.status = status;

  if (!update.title) {
    return res.status(400).json({ message: 'Task title is required.' });
  }

  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { returnDocument: 'after' }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Could not update task.' });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    await task.save();
    return res.json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Could not toggle task status.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    return res.json({ message: 'Task deleted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Could not delete task.' });
  }
});

export default router;

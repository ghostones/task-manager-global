const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { title, description, dueDate, priority, language = req.user.language } = req.body;
  try {
    if (!req.user.isPremium) {
      const user = await User.findById(req.user.id);
      if (user.taskCount >= 10) return res.status(403).json({ message: 'Limit reached - Upgrade to Pro' });
      user.taskCount += 1;
      await user.save();
    }

    const task = new Task({ title, description, dueDate: new Date(dueDate), priority, language, userId: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!req.user.isPremium) {
      const user = await User.findById(req.user.id);
      user.taskCount = Math.max(0, user.taskCount - 1);
      await user.save();
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
const express = require("express");
const Task = require("../models/Task");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

// POST /api/tasks → create task (protected)
router.post("/", protect, async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      user: req.user._id,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/tasks → list tasks (protected)
// - Regular users see only their tasks
// - Admins see all tasks with populated user and assignedTo info
router.get("/", protect, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === "admin") {
      // Admins can see all tasks with user and assignedTo details
      tasks = await Task.find()
        .populate("user", "name email profilePicture")
        .populate("assignedTo", "name email profilePicture")
        .sort({ createdAt: -1 });
    } else {
      // Regular users see only their tasks
      tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    }
    res.status(200).json(tasks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/tasks/:id → update task (protected)
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    // Only admin can assign/unassign tasks
    if (req.body.assignedTo !== undefined) {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can assign tasks" });
      }
      task.assignedTo = req.body.assignedTo || null;
      // Set assignedDate when assigning, clear when unassigning
      task.assignedDate = req.body.assignedTo ? new Date() : null;
    }
    
    // Only owner or admin can update other fields
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    await task.save();
    
    // Populate user and assignedTo info before returning
    await task.populate("user", "name email profilePicture");
    await task.populate("assignedTo", "name email profilePicture");
    
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/tasks/:id → delete task (protected)
router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

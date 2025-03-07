const express = require("express");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Add an Expense
router.post("/add", authMiddleware, async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;
        const expense = new Expense({
            title,
            amount,
            category,
            date: date || new Date(), // Default to today if no date is provided
            userId: req.user.id
        });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ error: "Error adding expense" });
    }
});

// ✅ Get All Expenses for a User
router.get("/", authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (err) {
        res.status(500).json({ error: "Error fetching expenses" });
    }
});

// ✅ Update an Expense
router.put("/update/:id", authMiddleware, async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;
        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { title, amount, category, date },
            { new: true }
        );
        if (!updatedExpense) {
            return res.status(404).json({ error: "Expense not found" });
        }
        res.status(200).json(updatedExpense);
    } catch (err) {
        res.status(500).json({ error: "Error updating expense" });
    }
});

// ✅ Delete an Expense
router.delete("/delete/:id", authMiddleware, async (req, res) => {
    try {
        const deletedExpense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deletedExpense) {
            return res.status(404).json({ error: "Expense not found" });
        }
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting expense" });
    }
});

module.exports = router;

const Expense = require("../models/Expense");

// Get all expenses for a user
exports.getExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Add a new expense
exports.addExpense = async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;
        const userId = req.user.id;

        if (!title || !amount || !category || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newExpense = new Expense({ title, amount, category, date, userId });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Update an expense
exports.updateExpense = async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;
        const userId = req.user.id;

        const expense = await Expense.findOne({ _id: req.params.id, userId });
        if (!expense) return res.status(404).json({ message: "Expense not found" });

        expense.title = title;
        expense.amount = amount;
        expense.category = category;
        expense.date = date;

        await expense.save();
        res.json(expense);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
    try {
        const userId = req.user.id;
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId });

        if (!expense) return res.status(404).json({ message: "Expense not found" });

        res.json({ message: "Expense deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Get monthly expenses summary
exports.getMonthlyExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        const expenses = await Expense.find({
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

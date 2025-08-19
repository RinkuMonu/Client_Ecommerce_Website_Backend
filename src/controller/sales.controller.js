import Order from "../models/Order.model.js";



export const getSalesOverview = async (req, res) => {
    try {
        
        const now = new Date();

        // Start of Day
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // Start of Week (Monday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        // Start of Month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Start of Year
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Sales Stats
        const dailySales = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfDay }, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        const weeklySales = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfWeek }, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        const monthlySales = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfMonth }, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        const yearlySales = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfYear }, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            daily: dailySales[0] || { total: 0, count: 0 },
            weekly: weeklySales[0] || { total: 0, count: 0 },
            monthly: monthlySales[0] || { total: 0, count: 0 },
            yearly: yearlySales[0] || { total: 0, count: 0 },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error fetching sales overview" });
    }
};

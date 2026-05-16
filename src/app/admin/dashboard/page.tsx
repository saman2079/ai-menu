"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        activeCustomers: 0,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch("/api/admin/analytics", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            setStats({
                totalRevenue: data.totalRevenue || 0,
                totalOrders: data.totalOrders || 0,
                avgOrderValue: data.avgOrderValue || 0,
                activeCustomers: data.activeCustomers || 0,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">dashboard</h1>
                <p className="text-gray-500 mt-1">Summary of restaurant performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="total income"
                    value={`${stats.totalRevenue.toLocaleString()} $`}
                    icon={DollarSign}
                    trend="+12.5%"
                    trendUp={true}
                />
                <StatsCard
                    title="Number of orders"
                    value={stats.totalOrders.toString()}
                    icon={ShoppingBag}
                    trend="+8.2%"
                    trendUp={true}
                />
                <StatsCard
                    title="average order"
                    value={`${stats.avgOrderValue.toLocaleString()} `}
                    icon={TrendingUp}
                    trend="+3.1%"
                    trendUp={true}
                />
                <StatsCard
                    title="Active customers"
                    value={stats.activeCustomers.toString()}
                    icon={Users}
                    trend="-2.4%"
                    trendUp={false}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Latest orders
                    </h2>
                    <div className="text-gray-500 text-center py-8">
                        Loading...
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Best-selling foods
                    </h2>
                    <div className="text-gray-500 text-center py-8">
                        Loading...
                    </div>
                </div>
            </div>
        </div>
    );
}

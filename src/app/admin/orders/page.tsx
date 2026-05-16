// src/app/admin/orders/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  orderNumber: number;
  tableId:number

  items: Array<{
    menuItem: { name: string; price: number };
    quantity: number;
  }>;
  totalAmount: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: string;
}

const statusConfig = {
  pending: { label: "waiting", color: "bg-yellow-500", icon: Clock },
  preparing: { label: "Preparing", color: "bg-blue-500", icon: Package },
  ready: {
    label: "Ready for delivery",
    color: "bg-green-500",
    icon: CheckCircle,
  },
  delivered: {
    label: "was delivered",
    color: "bg-gray-500",
    icon: CheckCircle,
  },
  cancelled: { label: "canceled", color: "bg-red-500", icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [socket, setSocket] = useState<Socket | null>(null);
  console.log(orders)

  useEffect(() => {
    fetchOrders();

    // Initialize socket
    const socketInstance = io({
      path: "/api/socket",
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected");
    });

    socketInstance.on("new-order", (newOrder: Order) => {
      console.log("📥 New order received:", newOrder);
      setOrders((prev) => [newOrder, ...prev]);

      // Show notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("سفارش جدید!", {
          body: `${newOrder.customerName} - ${newOrder.totalAmount.toLocaleString()} تومان`,
          icon: "/icon.png",
        });
      }

      // Play sound
      const audio = new Audio("/notification.mp3");
      audio.play().catch((e) => console.log("Audio play failed:", e));
    });

    socketInstance.on("order-updated", (updatedOrder: Order) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order,
        ),
      );
    });

    socketInstance.on("order-deleted", (data) => {
      setOrders((prev) => prev.filter((order) => order._id !== data._id));
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    setSocket(socketInstance);

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      console.log("🔑 Token:", token ? "exists" : "missing");

      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📡 Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`Failed to fetch: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      console.log(data);
      console.log("✅ Orders fetched:", data.orders?.length);
      setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    orderId: string,
    status: "pending" | "preparing" | "ready" | "delivered" | "cancelled",
  ) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      // No need to fetchOrders() - socket will update it
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
        <p className="text-gray-600">Managing and tracking customer orders</p>
        {socket?.connected && (
          <span className="inline-flex items-center gap-2 text-sm text-green-600 mt-2">
            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
            Online
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            filter === "all"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({orders.length})
        </button>
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === key
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {config.label} ({orders.filter((o) => o.status === key).length})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No Orders Yet</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            return (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all animate-fadeIn"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      Order #{order.orderNumber} - {order.tableId}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {order.customerPhone}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(order.createdAt).toLocaleString("En")}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                      statusConfig[order.status].color
                    } text-white text-sm`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig[order.status].label}
                  </div>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                    >
                      <span className="text-gray-700">
                        {item.menuItem.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        {(item.menuItem.price * item.quantity).toLocaleString()}{" "}
                        $
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
                    <span className="font-bold text-gray-900">
                      {" "}
                      Total Price:
                    </span>
                    <span className="font-bold text-lg text-purple-600">
                      {order.totalAmount.toLocaleString()} $
                    </span>
                  </div>
                </div>

                {/* Status Actions */}
                {order.status !== "delivered" &&
                  order.status !== "cancelled" && (
                    <div className="flex gap-2 flex-wrap justify-end">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(order._id, "preparing")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Start preparation
                          </button>
                          <button
                            onClick={() => updateStatus(order._id, "cancelled")}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Cancel the order
                          </button>
                        </>
                      )}
                      {order.status === "preparing" && (
                        <button
                          onClick={() => updateStatus(order._id, "ready")}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          ready for delivery{" "}
                        </button>
                      )}
                      {order.status === "ready" && (
                        <button
                          onClick={() => updateStatus(order._id, "delivered")}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          was delivered
                        </button>
                      )}
                    </div>
                  )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

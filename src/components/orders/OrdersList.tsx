"use client";

import { useState, useEffect } from "react";
import OrderedCard from "./OrderedCard";
import Button from "@/components/UI/Button";
import { useOrderStore } from "@/app/hooks/orderStore";
import Invoice from "./Invoice";
import { AnimatePresence, motion } from "framer-motion";


export default function OrdersList() {
  const orders = useOrderStore((s) => s.orders);
  const removeOrder = useOrderStore((s) => s.removeOrder);
  const updateQty = useOrderStore((s) => s.updateQty);
  const clearCart = useOrderStore((s) => s.clearCart);
  const setInvoiceData = useOrderStore((s) => s.setInvoiceData);
  const openInvoice = useOrderStore((s) => s.openInvoice);
  const invoiceData = useOrderStore((s) => s.invoiceData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);

  // اگه قبلاً سفارش داده، از API بخون
  useEffect(() => {
    const tableId = localStorage.getItem("tableId");
    const sessionId = localStorage.getItem("sessionId");
    if (!tableId || !sessionId) return;

    fetch(`/api/orders/current?tableId=${tableId}&sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) setSubmittedOrder(data.order);
      })
      .catch(console.error);
  }, []);

  const handleAcceptOrder = async () => {
    if (orders.length === 0) return;
    setIsSubmitting(true);
    try {
      const tableId = localStorage.getItem("tableId");
      const sessionId = localStorage.getItem("sessionId");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Guest",
          customerPhone: "0000000000",
          tableId: tableId ? parseInt(tableId) : null,
          sessionId,
          items: orders.map((item) => ({
            menuItem: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setInvoiceData(result.order);
      openInvoice();
      clearCart();
      setSubmittedOrder(result.order);
    } catch (error: any) {
      console.error("Error submitting order:", error);
      alert("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // اگه سفارش ثبت شده، نمایش بده
  if (submittedOrder && orders.length === 0) {
    return (
      <div className="mt-10 w-full flex flex-col items-center gap-4 pb-20">
        <p className="text-green-400 text-[18px]">✅ Order submitted!</p>
        <Invoice />
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 flex flex-col gap-4 w-full pb-32 px-4">
        {orders.length > 0 ? (
          <AnimatePresence>
            {orders.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100, transition: { duration: 0.3 } }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <OrderedCard
                  item={item}
                  onRemove={removeOrder}
                  onQtyChange={updateQty}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-light text-xl mt-10"
          >
            Your cart is empty.
          </motion.p>
        )}
      </div>

      {orders.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 w-full max-w-[450px] mx-auto h-[120px] 
                     bg-gradient-to-t from-dark to-transparent pointer-events-none">
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="px-6 fixed bottom-8 w-full max-w-[450px] pointer-events-auto"
          >
            <Button
              variant="primary"
              className="w-full font-bold text-xl p-4 shadow-lg shadow-primary/20"
              onClick={handleAcceptOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Confirm Order"}
            </Button>
          </motion.div>
        </div>
      )}
    </>
  );
}

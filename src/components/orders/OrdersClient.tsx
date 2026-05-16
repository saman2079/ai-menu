"use client";

import { useOrderStore } from "@/app/hooks/orderStore";
import Invoice from "./Invoice";
import OrdersList from "./OrdersList";



export default function OrdersClient() {
  const showInvoice = useOrderStore((s) => s.showInvoice);

  return showInvoice ? <Invoice /> : <OrdersList />;
}

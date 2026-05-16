"use client";

import Image from "next/image";
import { useOrderStore } from "@/app/hooks/orderStore";

interface Props {
  order?: any; // اگه مستقیم پاس بدی
}

export default function Invoice({ order: propOrder }: Props) {
  const storeOrder = useOrderStore((s) => s.invoiceData);
  const closeInvoice = useOrderStore((s) => s.closeInvoice);

  const order = propOrder || storeOrder;
  if (!order) return null;


  return (
    <div className="animate-invoice w-[85%] max-w-[420px] bg-[#B1B1B1]/13 mt-4 text-white rounded-[30px] backdrop-blur-[50px] border border-[#707070] relative">
      <button onClick={closeInvoice} className="absolute top-6 right-6">
        <Image src="/icons/closebtn.svg" width={15} height={15} alt="close" />
      </button>

      <div className="flex flex-col gap-4 p-6">
        <p className="text-[20px] font-bold">Order #{order.orderNumber}</p>

        {order.items.map((item: any) => (
          <div key={item._id} className="flex justify-between text-[18px]">
            <span>{item.name} × {item.quantity}</span>
            <span className="text-[#EFE7BC]">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full h-[1px] bg-[#707070]" />

      <div className="flex justify-between text-[22px] py-8 px-6">
        <span>Total</span>
        <span className="text-[#EFE7BC]">${order.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
}

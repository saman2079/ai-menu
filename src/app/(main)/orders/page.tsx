import OrdersClient from "@/components/orders/OrdersClient";

export default function Page() {
  return (
    <div className=" w-full min-h-[100dvh] flex flex-col">
      <div className="w-full flex flex-col items-center mt-24 relative">
        <p className="mx-auto text-white text-[25px]">My Orders</p>
        <OrdersClient />
      </div>
    </div>
  );
}

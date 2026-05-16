"use client";

import { useOrderStore } from "@/app/hooks/orderStore";
import Button from "../UI/Button";
import type { MenuItem } from "@/types/product";

interface Props {
  item: MenuItem;
}

export default function QuantityButtons({ item }: Props) {
  const quantity = useOrderStore((s) => s.getQuantity(item._id));
  const addToCart = useOrderStore((s) => s.addToCart);
  const updateQty = useOrderStore((s) => s.updateQty);

  const increase = () => {
    addToCart(
      {
        id: item._id,
        name: item.name,
        price: `$${item.price.toFixed(2)}`,
        image: item.images?.[0],
        desc: item.description,
      },
      quantity + 1,
    );
  };

  const decrease = () => {
    updateQty(item._id, quantity - 1);
  };

  return (
    <>
      {quantity === 0 ? (
        <Button
          variant="primary"
          className="p-1 text-[17px] font-bold w-full"
          onClick={increase}
        >
          Add to cart
        </Button>
      ) : (
        <div className="flex items-center justify-between">
          <button
            onClick={decrease}
            className="text-[#202020] bg-white text-[25px] px-2.5 rounded-[7px]"
          >
            −
          </button>

          <span className="text-white text-[18px] font-semibold px-2">
            {quantity}
          </span>

          <button
            onClick={increase}
            className="text-[#202020] bg-white text-[25px] px-2.5 rounded-[7px]"
          >
            +
          </button>
        </div>
      )}
    </>
  );
}

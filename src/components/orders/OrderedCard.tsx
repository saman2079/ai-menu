"use client";

import { useState } from "react";
import Image from "next/image";
import React from "react";

export default function OrderedCard({ item, onRemove, onQtyChange }) {
  const [qty, setQty] = useState(item.quantity || 1);

  const increase = () => {
    const newQty = qty + 1;
    setQty(newQty);
    onQtyChange(item.id, newQty);
  };

  const decrease = () => {
    if (qty > 1) {
      const newQty = qty - 1;
      setQty(newQty);
      onQtyChange(item.id, newQty);
    } else {
      onRemove(item.id);
    }
  };

  return (
    <div className="w-[85%] mx-auto bg-[#B1B1B1]/20 rounded-[34px] border border-[#707070] backdrop-blur-[20px] shadow-xl flex gap-4 items-end-safe relative overflow-hidden">
      <Image
        width={159}
        height={159}
        src={item.image || "/placeholder.png"}
        alt={item.name}
        className="rounded-[34px] w-[40%] "
      />

      <div className="flex flex-col gap-1 mb-6">
        <p className="text-[18px] text-white">{item.name}</p>
        <p className="text-[14px] text-gray-300 line-clamp-2">{item.desc}</p>

        <div className="w-full flex items-center gap-3 pt-3">
          <p className="text-[#EFE7BC] text-[21px]">{item.price}</p>

          <div className="flex items-center justify-between">
            <button
              onClick={decrease}
              className="text-[#202020] bg-white text-[25px] w-[30px] h-[32px] rounded-[7px] flex items-center justify-center"
            >
              −
            </button>

            <span className="text-white text-[17px] font-semibold px-3">
              {qty}
            </span>

            <button
              onClick={increase}
              className="text-[#202020] bg-white text-[25px] w-[30px] h-[32px] rounded-[7px] flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <button onClick={() => onRemove(item.id)}>
        <Image
          width={14}
          height={14}
          src={"/icons/closebtn.svg"}
          alt="close btn"
          className="absolute top-4 right-4 cursor-pointer"
        />
      </button>
    </div>
  );
}

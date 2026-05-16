"use client";
import Image from "next/image";
import QuantityButtons from "./QuantityButtons";
import type { MenuItem } from "@/types/product";

interface Props {
  item: MenuItem;
}

export default function ProductCard({ item }: Props) {
  return (
    <div className="w-[85%] h-[510px] mx-auto bg-[#B1B1B1]/20 rounded-[34px] border border-[#707070] backdrop-blur-[20px]">
      <Image
        height={375}
        width={375}
        src={item.images?.[0] || "/placeholder.png"}
        alt={item.name}
        className="rounded-t-[34px] w-full h-[340px] object-cover"
      />

      <div className="w-full flex relative h-[170px]">
        <div className="w-[60%] h-full rounded-bl-[34px] p-5 flex flex-col justify-start">
          <p className="text-[24px] text-white break-words">{item.name}</p>
          <p className="text-[17px] mt-1 line-clamp-2 text-gray-300 break-words">
            {item.description}
          </p>
        </div>

        <div className="w-[40%] h-full relative rounded-br-[34px]">
          <p className="absolute top-6 right-1/3 text-[#EFE7BC] text-[21px]">
            ${item.price.toFixed(2)}
          </p>

          <div className="absolute bottom-10 right-4 w-[85%]">
            <QuantityButtons item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}

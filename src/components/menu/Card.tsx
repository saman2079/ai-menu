import { useState } from "react";
import Image from "next/image";
import Button from "../UI/Button";

function Card({ item }) {
  const [quantity, setQuantity] = useState(0);

  const increase = () => setQuantity((q) => q + 1);
  const decrease = () => setQuantity((q) => (q > 1 ? q - 1 : 0));

  return (
    <div className="w-[85%] h-[510px] mx-auto bg-[#B1B1B1]/20 rounded-[34px] border border-[#707070] backdrop-blur-[20px] ">
      <Image
        height={375}
        width={375}
        src={item.img}
        alt={item.name}
        className="rounded-t-[34px] w-full h-[340px]"
      />

      <div className="w-full flex relative h-[170px]">

        <div className="w-[60%] h-full rounded-bl-[34px] p-5 flex flex-col justify-start">
          <p className="text-[24px]">{item.name}</p>
          <p className="text-[17px] mt-1 leading-[22px]">{item.desc}</p>
        </div>

        <div className="w-[40%] h-full relative rounded-br-[34px]">

          <p className="absolute top-6 right-1/3 text-[#EFE7BC] text-[21px]">
            {item.price}
          </p>

          <div className="absolute bottom-10 right-4 w-[85%]">

            {quantity === 0 ? (
              <Button
                variant="primary"
                className="p-1 text-[17px] font-bold w-full"
                onClick={() => setQuantity(1)}
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

          </div>
        </div>

      </div>
    </div>
  );
}

export default Card;

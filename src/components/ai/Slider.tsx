"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import Image from "next/image";

export default function Slider() {
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true }, [
    AutoScroll({
      playOnInit: true,
      speed: 1.5,
      stopOnInteraction: false,
      direction: "backward",
    }),
  ]);

  const cards = [
    {
      id: 1,
      title: "Vegetables Pizza",
      price: 16,
      img: "/food/pizzacard.png",
      decription: "Lorem ipsum is placeholder text",
    },
    {
      id: 2,
      title: "Meat Pizza",
      price: 12,
      img: "/food/pizzacard2.png",
      decription: "Lorem ipsum is placeholder text",
    },
    {
      id: 3,
      title: "Chicken",
      price: 8,
      img: "/food/pizzacard.png",
      decription: "Lorem ipsum is placeholder text",
    },
    {
      id: 4,
      title: "CocaCola",
      price: 4,
      img: "/food/pizzacard2.png",
      decription: "Lorem ipsum is placeholder text",
    },
  ];

  return (
    <div
      className="overflow-hidden w-full pt-12 cursor-grab active:cursor-grabbing "
      ref={emblaRef}
      dir="ltr"
    >
      <div className="flex">
        {cards.map((card, index) => (
          <div
            key={index}
            className="   bg-[#B1B1B1]/20  w-[80%] max-w-[340px]  mx-3 h-[275px]  rounded-[34px] border border-[#707070] backdrop-blur-[20px] shadow-xl"
          >
            {/* <Image width={256} height={192} src={""} alt="pic" /> */}
            <div
              className=" h-54 w-[240px]   rounded-t-[34px] bg-cover bg-center"
              style={{ backgroundImage: `url(${card.img})` }}
            ></div>
            <div className="p-4">
              <p className="text-[17px] font-bold text-white">{card.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

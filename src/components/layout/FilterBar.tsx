"use client";

import React, { useState } from "react";
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

  const [selectedFilter, setSelectedFilter] = useState(2);

  const menuItems = [
    {
      id: 1,
      title: "Burger",
      description: "Lorem ipsum is placeholder text",
    },
    {
      id: 2,
      title: "Lazania",
      description: "Lorem ipsum is placeholder text",
    },
    {
      id: 3,
      title: "Burger1",
      description: "Lorem ipsum is placeholder text",
    },
    {
      id: 4,
      title: "Lazania2",
      description: "Lorem ipsum is placeholder text",
    },
    {
      id: 5,
      title: "Burger3",
      description: "Lorem ipsum is placeholder text",
    },
    {
      id: 6,
      title: "Lazania1",
      description: "Lorem ipsum is placeholder text",
    },
  ];

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
    <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header Navigation */}
      <header className="px-4 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-4 mb-4">
          <button className="text-cyan-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Horizontal Scrollable Filter */}
        <nav className="flex gap-6 text-sm overflow-x-auto scrollbar-hide pb-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedFilter(item.id)}
              className={`whitespace-nowrap transition-colors ${
                selectedFilter === item.id
                  ? "text-cyan-400 border-b-2 border-cyan-400 pb-1"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {item.title}
            </button>
          ))}
        </nav>
      </header>

      {/* TODO: Add carousel section here */}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

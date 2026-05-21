// app/page.tsx
"use client";

import Button from "@/components/UI/Button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center p-4 text-center overflow-hidden">
      
      {/* بک‌گراند نئونی و گرادینت نرم */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 flex flex-col items-center gap-8"
      >
        {/* نشان AI (Badge) */}
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-blue-400 text-sm font-medium tracking-wider backdrop-blur-sm"
        >
          POWERED BY INTELLIGENT AI
        </motion.span>

        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 leading-tight">
          فود فیوژن
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl leading-relaxed font-light">
          ذائقه شما، تخصص هوش مصنوعی ماست. <br />
          <span className="text-white font-medium italic">بدون گشتن در منوهای طولانی،</span> فقط بگو چی میل داری تا برات خلق کنیم.
        </p>

        <motion.div 
          className="flex flex-col md:flex-row gap-5 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link href="/ai-order">
            <button className="relative group px-8 py-4 bg-white text-black font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden">
              <span className="relative z-10">شروع گپ و سفارش</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>
          </Link>

          <Link href="/menu">
            <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-medium rounded-2xl hover:bg-white/5 transition-all">
              مشاهده منوی امروز
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* المان تزیینی: خطوط شبکه (Grid) برای حس تکنولوژی */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
    </div>
  );
}

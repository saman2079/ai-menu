"use client"
import React from 'react'
import {
    ChartBar,
    Contact,
    Home,
    Icon,
    ListOrderedIcon,
    Menu
} from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from "framer-motion"
import { div } from 'framer-motion/client';


export default function ButtonNav() {
    const path = usePathname()
    const links = [
        // { id: 2, link: "/", icon: Home, label: "خانه" },
        { id: 3, link: "/orders", icon: ListOrderedIcon, label: "سفارشات" },
        { id: 1, link: "/ai", icon: "/stream.png", label: "هوش مصنوعی" },
        { id: 4, link: "/menu", icon: Menu, label: "منو" },
        // { id: 5, link: "/about", icon: Contact, label: "درباره ما" },
    ]
    return (
        <div className='relative'>
            <div
                className='
            bg-black/70 
            border border-white/10
            backdrop-blur-xl
            rounded-[10px]
            px-3 py-1
            shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
            fixed bottom-0  left-1/2 -translate-x-1/2 w-[350px] 
            '>
                <div className='flex items-center relative justify-around'>
                    {
                        links.map(item => {
                            const Icon = item.icon
                            const active = path === item.link
                            const ai = item.link === "/ai"

                            return (

                                <Link className={`flex relative  basis-1/3 flex-col gap-2   justify-center items-center py-2 px-3 `} key={item.id} href={item.link}>
                                    {active && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="
                                    shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
                                    absolute inset-0   bg-white/10  rounded-[10%]
                                    "
                                            transition={{
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 40
                                            }}
                                        />
                                    )}
                                    {
                                        typeof item.icon === "string"
                                            ? (
                                                <Image
                                                    src={item.icon}
                                                    width={40}
                                                    height={40}
                                                    alt={item.label}
                                                    className="scale-125 shadow-2xl"
                                                />
                                            )
                                            : (
                                                <Icon
                                                    className={`w-5 h-5 `}
                                                />
                                            )
                                    }

                                    <p>{item.label}</p>
                                </Link>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

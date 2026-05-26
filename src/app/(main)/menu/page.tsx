import CategoryBar from '@/components/menu/CategoryBar'
import Header from '@/components/menu/Header'
import MenuList from '@/components/menu/MenuList'
import { getMenuItems } from '@/services/menu'
import Image from 'next/image'
import React from 'react'

async function Menu() {
  const data = await getMenuItems()
  return (
    <div className='min-h-[100dvh]'>
      <Header />


      <div className='-mt-10 space-y-5'>
        <CategoryBar categories={data.categories} />
        <MenuList items ={data.items} />
      </div>


    </div>
  )
}

export default Menu
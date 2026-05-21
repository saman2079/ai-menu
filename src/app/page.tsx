import Link from 'next/link'
import React from 'react'

function Home() {
  return (
    <div className="bg-[url('/home-bg.png')] text-center text-white bg-center bg-no-repeat flex flex-col justify-between py-8 px-5 min-h-[100dvh]">
      <div className='space-y-10'>
        <div>
          <p>میز ۱۲</p>
        </div>
        <div className='flex flex-col gap-5  px-14  '>
          <p>سلام</p>
          <p className='leading-8'>من دستیار هوشمند کافه تهرانم
            چطور می تونم کمکت کنم؟</p>
        </div>
      </div>


      <div className=' flex flex-col gap-5 p-5  items-center'>
        <Link className='w-full rounded-[15px] p-4 bg-white text-[#201F20] ' href={"/ai"}>شروع گفتگو</Link>
        <Link className='w-full rounded-[15px] p-4 text-white border-[1px] border-white' href={"/menu"}>مشاهده منو</Link>
      </div>
    </div>
  )
}

export default Home
import Image from 'next/image'
import React from 'react'

function Stream() {
  return (
    <div className=" flex justify-center max-w-[450px] w-full py-5 fixed bottom-[20vh] ">
        <div className="relative w-[124px] h-[124px]">
          <div className="absolute inset-0 bg-[#A0EAEB] blur-[20px] rounded-full z-0 animate-pulse"></div>
          <Image
            width={136}
            height={136}
            src="/stream.png"
            alt="stream"
            className="relative z-10"
          />
        </div>
      </div>
  )
}

export default Stream

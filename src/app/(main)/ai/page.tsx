"use client"
import Image from 'next/image'
import React, { useState } from 'react'

interface ai {
  role: "user" | "assistant",
  content: string
}

function ai() {

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ai[]>([])
  const [sessionId, setSessionId] = useState("")
  const [loading, setLoading] = useState(false)


  const sendMessage = async () => {

    if (!message.trim()) return

    const userMessage = {
      role: "user" as const,
      content: message
    }

    setMessages((perv) => [...perv, userMessage])
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "test-session",
          tableId: "1",
          messages: [
            ...messages,
            userMessage
          ]
        })
      })
      const data = await res.json()

      const aiMessage = {
        role: "assistant" as const,
        content:
          data.message ||
          data.response ||
          "پاسخی دریافت نشد",
      }

      setMessages((prev) => [...prev, aiMessage])

    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }

  }


  console.log(messages)


  return (
    <div className='bg-[#E4E4E4] flex flex-col  gap-2 text-[16px] text-[#201F20] h-screen ' >

      <div className='bg-white  shadow-[0px_2px_4.7px_0px_#00000021] p-4 flex items-center justify-center gap-2'>
        <div className='bg-[#4B9758] w-3 h-3 rounded-full' />
        <p>دستیار هوشمند</p>
      </div>



      <div className='p-10 min-h-[60dvh] overflow-y-auto  max-h-[70dvh] '>

        {
          messages.length === 0 ? <div className='bg-white w-full flex gap-2 items-center shadow-[2px_3px_8px_0px_#0000001A] p-5 py-7 rounded-[15px]'>
            <Image src={"/imge/ai.png"} alt='' width={46} height={68} />
            <p>سلام، به کافه تهران خوش اومدی
              امروز چی میل داری؟</p>
          </div> : <div className='flex flex-col gap-4'>

            {messages.map((msg, index) => (

              <div
                key={index}
                className={`flex ${msg.role === "user"
                  ? "justify-start"
                  : "justify-end"
                  }`}
              >

                <div
                  className={`
          max-w-[80%]
          p-4
          rounded-[18px]
          shadow-sm

          ${msg.role === "user"
                      ? "bg-[#E8E8E8] text-[#201F20]  rounded-br-[5px] shadow-[2px_3px_8px_0px_#0000001A]"
                      : "bg-white text-[#201F20] rounded-bl-[5px] shadow-[2px_3px_8px_0px_#0000001A]"
                    }
        `}
                >

                  {msg.content}

                </div>

              </div>

            ))}

            {loading && (

              <div className='flex justify-end'>

                <div className='bg-white p-4 rounded-[18px]'>

                  در حال نوشتن...

                </div>

              </div>

            )}

          </div>
        }

      </div>

      <div className="fixed bottom-[95px] left-1/2 -translate-x-1/2 w-full max-w-[420px] px-3 z-50">

        <div className="flex gap-2 items-center">

          <button
            type='submit'
            onClick={sendMessage}
            disabled={loading}
            className="bg-[#201F20] w-[54px] h-[54px] rounded-full flex items-center justify-center shrink-0">
            <Image
              src={"/icons/send.svg"}
              alt=""
              width={24}
              height={24}
            />
          </button>

          <div className="bg-white rounded-[18px] flex-1 shadow-md">
            <input
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage()
                }
              }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-transparent p-4 outline-none"
              type="text"
              placeholder="پیام خود را بنویسید..."
            />
          </div>

        </div>
      </div>


    </div>
  )
}

export default ai
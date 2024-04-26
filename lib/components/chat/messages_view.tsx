'use client'
export default function MessagesView({ messages }) {



    const dummyMessages = [
        { message: "Hey Tom! I am First", sender: "Jack" },
        { message: "Oh. I am second!", sender: "Tom" },
    ]
    // make a dynamic component using messages as array?
    // const messageHolder = messages?.map((message) => {
    //     <>
    //         <div className="flex">
    //             <p>{message.userId} </p>
    //             <p className="font-bold">{message.message}</p>
    //             {/* Sender */}
    //         </div>
    //     </>
    // })


    return (
        <>
            <div className="flex flex-col h-4/6 bg-red-500">
                {JSON.stringify(messages)}
            </div>
        </>
    )
}
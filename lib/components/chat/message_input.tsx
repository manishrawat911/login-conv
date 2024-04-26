
export default function MessageInput({send}) {
    return (
        <div className="h-1/6 bg-blue-400 flex p-2 space-x-1">
            <form className="flex basis-full space-x-1" action={send}>
                <input name="message" className="basis-5/6 placeholder:italic" placeholder="type..." type="text" />
                <button type="submit" className="basis-1/6 bg-green-800 w-1/6 h-full rounded text-fuchsia-100">Send</button>
            </form>
        </div>
    )
}
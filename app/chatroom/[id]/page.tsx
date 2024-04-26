'use client'
import { SocketProvider, getSocket, useSocket } from "@/app/SocketProvider";
import { selectIsLoggedIn, selectSessionID, selectUserType, selectUsername, setUserInfo } from "@/app/global.state";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import MessageInput from "@/lib/components/chat/message_input";
import MessagesView from "@/lib/components/chat/messages_view";
import { time } from "console";
import { stringify } from "querystring";
import { useEffect, useState } from "react";

export default function ChatPage({ params }: { params: { id: string } }) {
    const dispatch = useAppDispatch();
    const loggedIn = useAppSelector(selectIsLoggedIn);
    const userType = useAppSelector(selectUserType);
    const sessionId = useAppSelector(selectSessionID);

    if (!sessionId) {
        dispatch(setUserInfo({ sessionId: params.id }));
    }

    if (!loggedIn && userType != "admin") return (
        <ParticipantLogin />
    )

    return (
        <>
        <div className="container mx-auto 2xl:max-w-3xl justify-center items-center">
            <h1>Chat room id:  {params.id}</h1>
            <SocketProvider>
                <ChatView userType={userType} />
            </SocketProvider>
        </div>
        </>
    )
}

function ChatView({ userType }: { userType: string }) {
    const [chatHistory, setChatHistory] = useState([]);
    const username = useAppSelector(selectUsername)
    const { socket, isConnected } = useSocket();
    const sessionId = useAppSelector(selectSessionID)

    const date = new Date();

    function sendMessage(formData) {
        const json_ob = {
            sender: username,
            roomId: sessionId,
            message: formData.get("message")
        }
        if(socket)
            socket.emit('sendMessage', json_ob);
    }


    // useEffect(() => {
    //     if(window.myInterval ){
    //         clearInterval(window.myInterval);
    //     }
    //     window.myInterval = setInterval(() => {
    //         console.log(`First Date: ${date}`);
    //     }, 1000);
    // });

    // useEffect(() => {
    //     setInterval(() => {
    //         console.log(`Second Date: ${date}`);
    //     }, 1000)
    // }, []);

    useEffect(() => {
        if (socket) {
            if (userType == 'user') {
                socket.emit('joinRoom', { sessionId, username });
                console.log("joining session to chat");
            }
            else if (userType == 'admin') {
                socket.emit('createRoom', { sessionId, username })
                console.log(`session creation initiated by admin `)
            }

            socket.on('roomCreated', (data) => {
                console.log(`Room created: ${JSON.stringify(data)}`);
                // document.getElementById('roomIdInput').value = data.roomId;
                // document.getElementById('roomCreation').style.display = 'none';
                // document.getElementById('chatRoom').style.display = 'block';
            });
    
            socket.on('joinedRoom', (data) => {
                console.log('Joined room');
                setChatHistory((previousState) => {
                console.log(`previous messages: ${JSON.stringify(data)}`)
                   return data.chatHistory
                });
                // const messagesContainer = document.getElementById('messages');
                // messagesContainer.innerHTML = ''; // Clear previous messages
                // chatHistory.forEach(({ username, message }) => {
                //     const messageElement = document.createElement('div');
                //     messageElement.textContent = `${username}: ${message}`;
                //     messagesContainer.appendChild(messageElement);
                // });
            });
            socket.on('newMessage', (data) => {
                console.log(`New message : ${JSON.stringify(data)}`);
                // const newChatHistory = [...chatHistory, data];
                // chatHistory.push(data);
                setChatHistory((previousChatHistory) => {
                    console.log(`Previous messages so far: ${JSON.stringify(previousChatHistory)}`);
                    // const newChatHistory = [...previousChatHistory, data];
                    // console.log(`All messages so far: ${JSON.stringify(newChatHistory)}`);
                    // return newChatHistory;
                    return [...previousChatHistory, data];
                })
                // setChatHistory(newChatHistory);
                // console.log(temp)
                // const messagesContainer = document.getElementById('messages');
                // const messageElement = document.createElement('div');
                // messageElement.textContent = `${data.userId}: ${data.message}`;
                // messagesContainer.appendChild(messageElement);
            });
    
            socket.on('userJoined', (data) => {
                console.log(`New user joined: ${JSON.stringify(data)}`)
            });
    
            socket.on('userLeft', (data) => {
                console.log(`User left:, ${stringify(data)}`);
            });
        }
        if (!isConnected) {
            console.log('Unable to connect to the server')
        }

    }, [socket]);


    const messageHolder = chatHistory.map(message => {
        return (
            <div className="flex flex-col-reverse bg-slate-100 rounded m-1 p-2">
                <p className="text-blue-800 text-sm/[9px]">{message.username}</p>
                <p className="font-bold">{message.message}</p>
                {/* Sender */}
            </div>
        )
    });

    return (
        <>
            {/* <MessagesView messages={chatHistory}/> */}
            <div className="container flex flex-col h-4/6 bg-stone-400 rounded p-2 justify-center">
                {messageHolder}
            </div>
            <MessageInput send={sendMessage}/>
        </>
    )
}

function ParticipantLogin() {
    const dispatch = useAppDispatch();
    const sessionId = useAppSelector(selectSessionID);

    const handleSubmit = async (formData: any) => {
        const username = formData.get("username");
        const password = formData.get("password");

        const ob_json = {
            username: username,
            password: password,
            sessionId: sessionId
        }

        try {
            const response = await fetch('http://localhost:5050/login/participant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ob_json)
            });

            if (!response.ok) {
                console.log(response.body)
                throw new Error('Network response was not ok');
            }

            // dispatch(setUserInfo({username: username, userType: "user", isLoggedIn: true}));
            const data = await response.json();
            dispatch(setUserInfo({ username: username, userType: "user", isLoggedIn: true, sessionId: sessionId }));
            console.log(data); // Handle the response data
            // router.push('/session/new') 
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div className="flex min-w-full h-full bg-gray-100 justify-center items-center content-center">
            <div className="container 
                            flex 
                            flex-col 
                            rounded-lg
                            p-5 
                            w-fit h-fit 
                            bg-slate-600
                            justify-center 
                            items-center">
                <form className="flex flex-col space-y-0.5 content-center items-center" action={handleSubmit}>
                    <h1 className="text-center text-slate-100 ">Participant Login</h1>
                    <input className="rounded p-2" type='text' id='username' placeholder="username" name='username' required /><br />
                    <input className="rounded p-2" type='password' id='password' placeholder="password" name='password' required /><br />
                    <button className="p-1 w-1/2 text-green-950 font-bold bg-green-400 rounded place-self-center" type="submit">Submit</button>
                </form>
                <p className="text-sm text-gray-300">Enter password provided by instructor or TA</p>
            </div>
        </div>
    )
}
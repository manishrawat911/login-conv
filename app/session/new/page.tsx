'use client'

import { selectIsLoggedIn, selectSessionID, selectUserType } from "@/app/global.state";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setSessionId } from "@/app/global.state";

let nextId = 1;

export default function NewSession(){

    const dispatch = useAppDispatch();
    const loggedIn = useAppSelector(selectIsLoggedIn);
    const userType = useAppSelector(selectUserType);
    const sessionId = useAppSelector(selectSessionID);
    
    const router = useRouter();

    const [participants, setParticipants] = useState([]);
    const addParticipants = (formData: any) =>{
        let username = formData.get('username');
        let password = formData.get('password');
        
        //checking for existing user with the same name
        for(let i=0;i<participants.length;i++){
            console.log(participants[i].username);

            if(participants[i].username === username){
                alert(`User ${username} already exists!`);
                return;
            }
        }
        setParticipants([...participants, {username: username , password : password }]);
    };

    const startSession = async () =>{
        console.log("trying to start session");
        const ob_json = {
            username: "admin",
            participants: participants
        }
        console.log(`session data: ${JSON.stringify(ob_json)}`);

        try {
            const response = await fetch('http://localhost:5050/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ob_json)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            dispatch(setSessionId(data.sessionId));
            console.log(data); // Handle the response data
            router.push(`/chatroom/${data.sessionId}`) 
        } catch (error) {
            console.error('Error:', error);
        }
    };
    return (
        <div className="container h-5/6 flex flex-col justify-center items-center bg-slate-300">
            <h1>Add  Participants</h1>
            <div className="flex space-x-1">
                <form className="flex flex-col space-y-1" action={addParticipants}>
                    <input required name="username" type="text" placeholder="username"></input>
                    <input required name="password" type="password" placeholder="password"></input>
                    <button className="bg-blue-500 text-white rounded" type="submit">Add</button>
                </form>
                <button className="bg-green-500 p-3 text-white rounded" onClick={startSession}>Go!</button>
            </div>
            <p>List of participants</p>
            <ul>
                {participants.map( participant =>
            <li>username: {participant.username}, password: {participant.password}</li>
            )}
            </ul>
        </div>
    )
}
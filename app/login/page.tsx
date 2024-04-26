'use client'

import { useRouter } from "next/navigation";
import { useAppDispatch } from "../hooks";
import { setUserInfo } from "../global.state";

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const handleSubmit = async (formData: any) => {
        const username = formData.get("username");
        const password = formData.get("password");
        
        // const r_json = `"username": "${username}", "password": "${password}"`
        const ob_json = {
            username: username,
            password: password
        }
        // console.log(r_json);
        // console.log(formData)
        // console.log(JSON.stringify(formData.toString()));
        // console.log(JSON.stringify(ob_json));
        try {
            const response = await fetch('http://localhost:5050/login/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ob_json)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            dispatch(setUserInfo({username:  username, userType: "admin", isLoggedIn: true}));
            const data = await response.json();
            console.log(data); // Handle the response data
            router.push('/session/new') 
        } catch (error) {
            console.error('Error:', error);
        }
        // try authenticate use
        // if successfull , set user information to the store redirect to dashboard page
        // if fail show error
        // console.log(password);
    }

    return (
        <div className="flex min-w-full h-[90%] bg-gray-100 justify-center items-center content-center">
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
                    <h1 className="text-center text-slate-100 ">Login</h1>
                    <input className="rounded p-2" type='text' id='username' placeholder="username" name='username' required/><br />
                    <input className="rounded p-2" type='password' id='password' placeholder="password" name='password' required/><br />
                    <button className="p-1 w-1/2 text-green-950 font-bold bg-green-400 rounded place-self-center" type="submit">Submit</button>
                </form>
            </div>
            <p></p>
        </div>
    )
}
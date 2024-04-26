'use client'
import { selectIsLoggedIn, selectSessionID, selectUserType, selectUsername } from "../global.state";
import { useAppSelector } from "../hooks"

export default function Footer() {

    const loggedIn = useAppSelector(selectIsLoggedIn);
    const username = useAppSelector(selectUsername);
    const usertype = useAppSelector(selectUserType);
    const session = useAppSelector(selectSessionID);
    return (
        <>
            <div className="h-1/6 sticky bottom-0 bg-orange-500">
            <p>logged in status: {`${loggedIn}`}</p>
            <p>Username: {username}</p>
            <p>Role: {usertype}</p>
            <p>Session ID: {session}</p>
        </div>
        </>
    )
}
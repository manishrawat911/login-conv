import { createSlice } from "@reduxjs/toolkit"

export interface CustomizedAppConfig {
    isLoggedIn: boolean,
    username: string,
    userType: "admin" | "user" | "unknown"
    sessionId: string
}

const defaultConfig: CustomizedAppConfig = {
    isLoggedIn: false,
    username: "",
    userType: "unknown",
    sessionId: ""
}

export const globalSlice = createSlice(
    {
        name: "global",
        initialState: defaultConfig,
        reducers: {
            setUserInfo: (state, action) => {
                return { ...state, ...action.payload };
            },
            setSessionId: (state, action) => {
                return { ...state, sessionId: action.payload}
            },
            logout: state => { 
                return defaultConfig;    
            }
        }
    })

// Action creators are generated for each case reducer function
export const { setUserInfo, setSessionId, logout } = globalSlice.actions

export const selectIsLoggedIn = (state: any): boolean => state.global.isLoggedIn
export const selectUsername = (state: any): string => state.global.username
export const selectUserType = (state: any): "admin"|"user" => state.global.userType
export const selectSessionID = (state:  any):string=> state.global.sessionId

export default globalSlice.reducer      
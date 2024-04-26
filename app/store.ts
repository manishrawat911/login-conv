import { combineSlices, configureStore } from '@reduxjs/toolkit'
import { globalSlice } from './global.state'
// ...

const rootReducer = combineSlices(globalSlice);

export const makeStore = () => configureStore({
  reducer: rootReducer
    // posts: postsReducer,
    // comments: commentsReducer,
    // users: usersReducer,
})

// Infer the `RootState` and `AppDispatch` types from the store itself
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppStore = ReturnType<typeof  makeStore>
export type AppDispatch = AppStore['dispatch']
export type RootState = ReturnType<AppStore['getState']>

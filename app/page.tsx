'use client'
import { useRouter } from "next/navigation";
import { useAppSelector } from "./hooks";
import { selectIsLoggedIn } from "./global.state";

export default function Home() {
  // const dispatch = useAppDispatch();
  const router = useRouter();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  if(!isLoggedIn){
    router.push('/login');
  }
  
  return (
    <p>Home page</p>
  )
}

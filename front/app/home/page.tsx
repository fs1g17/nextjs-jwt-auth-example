import { ssrFetch } from "@/lib/server-side-fetching";
import { redirect } from "next/navigation";

async function fetchUsernameFromJwt(): Promise<string> {
  const [result, error] = await ssrFetch<{
    message: string;
    username: string;
  }>("/ready", { method: "GET" });
  if (error !== null || result?.username === undefined) {
    throw new Error("Failed to get /ready");
  }

  return result.username;
}

export default async function Home() {
  const username = await fetchUsernameFromJwt();

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="font-bold">Welcome {username}</div>
    </div>
  );
}

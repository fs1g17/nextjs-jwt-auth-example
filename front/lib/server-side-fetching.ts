import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/env";

export async function ssrFetch<O, I = undefined>(
  pathname: string,
  options: {
    method: string;
    body?: I;
    next?: NextFetchRequestConfig;
  }
): Promise<[O | null, Error | null]> {
  let response;
  try {
    response = await fetch(`${env.BACKEND_BASE_URL}${pathname}`, {
      method: options.method,
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        Cookie: `jwt=${(await cookies()).get("jwt")?.value || ""}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      next: {
        revalidate: 0,
        ...options.next,
      },
    });
  } catch (error) {
    return [null, error as Error];
  }

  if (response.status === 401) {
    redirect("/sign-in");
  }

  response = await response.json();

  return [response, null];
}

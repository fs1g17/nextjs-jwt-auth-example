"use client";

import { z } from "zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import clientFetch from "@/lib/client-side-fetching";
import { useRouter } from "next/navigation";

const schema = z.object({
  username: z.string().trim().min(1, { message: "input a username" }),
  password: z.string().trim().min(1, { message: "input a password" }),
});

export default function SignUp() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  const callSignin = async (data: { username: string; password: string }) => {
    try {
      await clientFetch.post("/api/sign-in", data);
      router.push("/home");
    } catch (error) {
      const err = error as AxiosError;
      const data = err.response?.data as { message: string };
      setError(data.message);
    }
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 h-full flex flex-col justify-center items-center p-4">
        <h1>Sign In</h1>
        <Form {...form}>
          <form
            ref={formRef}
            className="flex flex-col gap-2 w-full max-w-[400px]"
            onSubmit={(evt) => {
              evt.preventDefault();
              form.handleSubmit(() => {
                const formData = new FormData(formRef.current!);
                const data = {
                  username: formData.get("username") as string,
                  password: formData.get("password") as string,
                };
                callSignin(data);
              })(evt);
            }}
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="w-full">
                  <Label className="text-sm">Username</Label>
                  <FormControl>
                    <Input placeholder="pick a username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <Label className="text-sm">Password</Label>
                  <FormControl>
                    <Input placeholder="pick a password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {error !== null && <p className="text-destructive">{error}</p>}

            <Button type="submit">Sign in</Button>
          </form>
        </Form>
      </div>
      <div className="flex-1 h-full bg-gray-600 hidden md:block" />
    </div>
  );
}

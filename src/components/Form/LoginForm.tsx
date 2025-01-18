"use client";

import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FaGoogle, FaEnvelope, FaLock } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { loginSchema } from "@/schemas/login-schema";
import Link from "next/link";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { FaExclamationTriangle } from "react-icons/fa";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null
  );
  const { push } = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (!res?.error) {
      form.reset();
      setIsLoading(false);
      push("/");
    } else {
      setIsLoading(false);
      if (res.error === "email not verified") {
        setError({
          title: "Email Not Verified",
          message: "Please verify your email address before logging in.",
        });
      } else {
        setError({
          title: "Login Failed",
          message: "Invalid email or password. Please try again.",
        });
      }
    }
  }

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="md:w-[400px] w-96 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-gray-800 text-3xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600 text-center">
            Login to continue to{" "}
            <span className="text-primary font-bold">Talky</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <FaExclamationTriangle className="h-4 w-4" />
                  <AlertTitle>{error.title}</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <FaEnvelope />
                        </span>
                        <Input
                          placeholder="Enter your email"
                          {...field}
                          className="pl-10 bg-gray-100 text-gray-800 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <FaLock />
                        </span>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                          className="pl-10 bg-gray-100 text-gray-800 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                        />
                        <div
                          className="absolute right-2 top-2"
                          onClick={handleShowPassword}
                        >
                          {showPassword ? (
                            <FiEye className="text-gray-400 cursor-pointer text-xl" />
                          ) : (
                            <FiEyeOff className="text-gray-400 cursor-pointer text-xl" />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              {isLoading ? (
                <Button disabled className="w-full rounded-md ">
                  <Loader2 className="animate-spin mr-2" />
                  Please wait
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2 rounded-md transition-all"
                >
                  Login
                </Button>
              )}
            </form>
          </Form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-600">or</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center bg-gray-100 text-gray-800 border border-gray-300 hover:bg-secondary hover:text-white transition-all"
          >
            <FaGoogle className="w-5 h-5 mr-2" />
            Login with Google
          </Button>
          <div>
            <p className="text-gray-600 text-sm mt-8 text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;

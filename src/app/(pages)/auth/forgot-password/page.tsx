

"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useForgotPasswordMutation } from "@/rtk-query/apis/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const res = await forgotPassword({ email }).unwrap();
       toast.success(res?.message?.message || "Reset link sent! Check your email.");
      setEmail("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Email dosen't exists");
    }
  };

  return (
    <div className="h-full p-4 flex flex-col items-center justify-center w-full">
      <div className="w-[80%] max-w-[400px] bg-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email to reset your password
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <Input
            placeholder="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            className="bg-[#5b3cc4] text-white"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}

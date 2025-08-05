'use client';
import React, { Suspense, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useResetPasswordMutation } from "@/rtk-query/apis/auth";
import { useSearchParams } from 'next/navigation';

// This component uses useSearchParams and must be wrapped by Suspense
function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key"); // get key from URL
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!key) {
      toast.error("Invalid reset link");
      return;
    }

    try {
      const res = await resetPassword({ key, new_password: newPassword }).unwrap();
      toast.success(res?.message?.message || "Password updated successfully");
      router.push("/auth");
    } catch (error) {
      toast.error( "Failed to update password"); //error?.data?.message ||
    }
  };

  return (
    <div className="h-full p-4 flex flex-col items-center justify-center w-full">
      <div className="w-[80%] max-w-[400px] bg-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-sm text-gray-500 mt-1">Enter your new password</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <Input
            placeholder="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            placeholder="Re-enter New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            className="bg-[#5b3cc4] text-white"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// The default export: wraps the inner component with Suspense
export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}

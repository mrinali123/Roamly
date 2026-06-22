"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthCard from "@/components/AuthCard";
import FormInput from "@/components/FormInput";
import LoadingButton from "@/components/LoadingButton";
import { updatePassword } from "@/lib/auth";

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const next: FormErrors = {};
    if (!fields.password) next.password = "Password is required.";
    else if (fields.password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (!fields.confirmPassword)
      next.confirmPassword = "Please confirm your password.";
    else if (fields.password !== fields.confirmPassword)
      next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await updatePassword(fields.password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated successfully!");
    router.push("/dashboard");
  }

  return (
    <AuthCard
      title="Set new password"
      subtitle="Choose a strong password for your account."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormInput
          label="New password"
          type="password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          value={fields.password}
          onChange={(e) => setFields({ ...fields, password: e.target.value })}
          error={errors.password}
        />
        <FormInput
          label="Confirm new password"
          type="password"
          placeholder="Repeat your new password"
          autoComplete="new-password"
          value={fields.confirmPassword}
          onChange={(e) =>
            setFields({ ...fields, confirmPassword: e.target.value })
          }
          error={errors.confirmPassword}
        />

        <LoadingButton type="submit" loading={loading} className="mt-2 w-full">
          Update password
        </LoadingButton>
      </form>
    </AuthCard>
  );
}

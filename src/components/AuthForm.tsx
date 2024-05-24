import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

interface AuthFormProps {
  email: string;
  setEmail: (email: string) => void;
  createAccount: () => void;
  initiateLogin: () => void;
  isExistingUser: boolean;
  setIsCapsuleModalOpen: (isOpen: boolean) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  email,
  setEmail,
  createAccount,
  initiateLogin,
  isExistingUser,
  setIsCapsuleModalOpen,
}) => {
  return (
    <>
      <h3 className="font-semibold text-center text-xl">Capsule Modal</h3>
      <Button onClick={() => setIsCapsuleModalOpen(true)}>Sign In with Capsule Modal</Button>
      <Separator orientation="horizontal" className="my-6" />
      <h3 className="font-semibold text-center text-xl">Email Login</h3>
      <div>
        <Label htmlFor="email" className="label">
          Your Email
        </Label>
        <Input name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
      </div>
      <Button onClick={createAccount} disabled={!email || !email.includes("@") || isExistingUser}>
        Create Account
      </Button>
      <Button onClick={initiateLogin} disabled={!email || !email.includes("@")}>
        Login
      </Button>
    </>
  );
};

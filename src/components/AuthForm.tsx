import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface AuthFormProps {
  email: string;
  setEmail: (email: string) => void;
  createAccount: () => void;
  initiateLogin: () => void;
  isExistingUser: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  email,
  setEmail,
  createAccount,
  initiateLogin,
  isExistingUser,
}) => {
  return (
    <>
      <h3 className="font-semibold text-center text-xl">Get Started</h3>
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

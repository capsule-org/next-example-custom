import React from "react";
import { Button } from "./ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { Label } from "./ui/label";

interface VerifyEmailFormProps {
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  verifyEmail: () => void;
}

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({
  verificationCode,
  setVerificationCode,
  verifyEmail,
}) => {
  return (
    <>
      <div>
        <Label htmlFor="verificationCode" className="label">
          Verification Code
        </Label>
        <InputOTP
          name="verificationCode"
          maxLength={6}
          value={verificationCode}
          onChange={(value) => setVerificationCode(value)}
          textAlign="center">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button onClick={verifyEmail} disabled={!verificationCode || verificationCode.length < 6}>
        Verify Email
      </Button>
    </>
  );
};

"use client";

import { useEffect, useState } from "react";

import type Capsule from "@usecapsule/web-sdk";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

import { VerifyEmailForm } from "@/components/VerifyEmailForm";
import { AuthForm } from "@/components/AuthForm";
import { UserAlerts } from "@/components/UserAlerts";
import { CapsuleCard } from "@/components/CapsuleCard";
import { MessageSigner } from "@/components/MessageSigner";
import { Loader } from "@/components/ui/loader";
import { checkIfLoggedIn, createAccount, initiateLogin, logout, verifyEmail } from "@/utils/authUtils";
import { signMessage } from "@/utils/signingUtils";

export default function Home() {
  const [capsule, setCapsule] = useState<Capsule>();
  const [email, setEmail] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [recoverySecret, setRecoverySecret] = useState<string>("");
  const [userIsLoggedIn, setUserIsLoggedIn] = useState<boolean>(false);
  const [messageToSign, setMessageToSign] = useState<string>("");
  const [showVerificationInput, setShowVerificationInput] = useState<boolean>(false);

  const [isExistingUser, setIsExistingUser] = useState<boolean>(false);
  const [selectedSigner, setSelectedSigner] = useState<string>("");

  const { toast } = useToast();

  const CAPSULE_API_KEY = process.env.NEXT_PUBLIC_CAPSULE_API_KEY;
  if (!CAPSULE_API_KEY) {
    throw new Error("NEXT_PUBLIC_CAPSULE_API_KEY is undefined");
  }

  async function loadCapsule() {
    if (!capsule) {
      const CapsuleModule = await import("@usecapsule/web-sdk");
      const loadedInstance = new CapsuleModule.default(CapsuleModule.Environment.DEVELOPMENT, CAPSULE_API_KEY);
      setCapsule(loadedInstance);
    }
  }

  useEffect(() => {
    loadCapsule();
  }, []);

  useEffect(() => {
    if (capsule) {
      checkIfLoggedIn(capsule, toast, setWalletAddress, setUserIsLoggedIn);
    }
  }, [capsule]);

  const onSignerSelected = (signer: string) => {
    setSignature("");
    setSelectedSigner(signer);
    toast({
      title: "Signer selected",
      description: `Signer ${signer} selected successfully. Ready to sign messages.`,
      duration: 3000,
    });
  };

  return capsule ? (
    <CapsuleCard>
      {userIsLoggedIn ? (
        <UserAlerts.UserLoggedIn />
      ) : (
        <>
          <UserAlerts.UserNotLoggedIn />
          <Button onClick={() => checkIfLoggedIn(capsule, toast, setWalletAddress, setUserIsLoggedIn)}>
            Check if User Is Logged In
          </Button>
        </>
      )}
      {walletAddress && <Alert className="break-words">{`Wallet Address: ${walletAddress || "N/A"}`}</Alert>}

      <Separator orientation="horizontal" className="my-6" />

      {userIsLoggedIn ? (
        <>
          <MessageSigner
            onSignerSelected={onSignerSelected}
            messageToSign={messageToSign}
            setMessageToSign={setMessageToSign}
            signMessage={() => signMessage(capsule, selectedSigner, messageToSign, setSignature, toast)}
            selectedSigner={selectedSigner}
            walletAddress={walletAddress}
            userIsLoggedIn={userIsLoggedIn}
            signature={signature}
          />
          <Button
            onClick={() =>
              logout(
                capsule,
                toast,
                setUserIsLoggedIn,
                setEmail,
                setSignature,
                setVerificationCode,
                setWalletAddress,
                setRecoverySecret,
                setMessageToSign,
                setShowVerificationInput
              )
            }>
            Logout
          </Button>
        </>
      ) : (
        <>
          {!showVerificationInput && (
            <AuthForm
              email={email}
              setEmail={setEmail}
              createAccount={() => createAccount(capsule, email, toast, setIsExistingUser, setShowVerificationInput)}
              initiateLogin={() => initiateLogin(capsule, email, toast, setUserIsLoggedIn, setWalletAddress)}
              isExistingUser={isExistingUser}
            />
          )}
          {showVerificationInput && (
            <VerifyEmailForm
              verificationCode={verificationCode}
              setVerificationCode={setVerificationCode}
              verifyEmail={() => verifyEmail(capsule, verificationCode, setWalletAddress, setRecoverySecret, toast)}
            />
          )}
        </>
      )}

      {recoverySecret && <Alert className="break-words">{`Recovery Secret: ${recoverySecret}`}</Alert>}
    </CapsuleCard>
  ) : (
    <Loader alignment="center" />
  );
}

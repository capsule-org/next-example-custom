"use client";

import type Capsule from "@usecapsule/web-sdk";
import { CapsuleEthersSigner } from "@usecapsule/ethers-v6-integration";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function Home() {
  const [capsule, setCapsule] = useState<Capsule>();
  const [email, setEmail] = useState<string>("");
  const [signature, setSignature] = useState<string>();
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [passkeyCreationUrl, setPasskeyCreationUrl] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string | undefined>("");
  const [recoverySecret, setRecoverySecret] = useState<string>("");
  const [passkeyLoginUrl, setPasskeyLoginUrl] = useState<string>("");
  const [userIsLoggedIn, setUserIsLoggedIn] = useState<boolean>(false);
  const [messageToSign, setMessageToSign] = useState<string>("");
  const [showVerificationInput, setShowVerificationInput] = useState<boolean>(false);
  const [showLoginInput, setShowLoginInput] = useState<boolean>(false);

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

  const checkIfLoggedIn = async (): Promise<void> => {
    if (!capsule) {
      throw new Error("Capsule not instantiated");
    }
    const loggedIn = await capsule.isFullyLoggedIn();
    setUserIsLoggedIn(loggedIn);
  };

  const createAccount = async (): Promise<void> => {
    if (!capsule) {
      throw new Error("Capsule not instantiated");
    }
    await capsule.createUser(email);
    setShowVerificationInput(true);
  };

  const verifyEmail = async (): Promise<void> => {
    if (!capsule) {
      throw new Error("Capsule not instantiated");
    }
    const url = await capsule.verifyEmail(verificationCode);
    setPasskeyCreationUrl(url);
    window.open(url, "popup", "popup=true,width=400,height=500");

    const recoverySecret = await capsule.waitForPasskeyAndCreateWallet();
    setWalletAddress(Object.values(capsule.getWallets())[0].address);
    setRecoverySecret(recoverySecret);
  };

  const initiateLogin = async (): Promise<void> => {
    if (!capsule) {
      throw new Error("Capsule not instantiated");
    }
    const url = await capsule.initiateUserLogin(email);
    setPasskeyLoginUrl(url);
    window.open(url, "popup", "popup=true,width=400,height=500");

    await capsule.waitForLoginAndSetup();
    setWalletAddress(Object.values(capsule.getWallets())[0].address);
  };

  const signMessage = async (message: string) => {
    if (!capsule) {
      throw new Error("Capsule not instantiated");
    }
    const signer = new CapsuleEthersSigner(capsule);
    const signature = await signer.signMessage(message);
    setSignature(signature);
    setWalletAddress(Object.values(capsule.getWallets())[0].address);
  };

  const logout = async () => {
    if (!capsule) {
      throw new Error("Capsule not instantiated");
    }
    await capsule.logout();
    setUserIsLoggedIn(false);
    setEmail("");
    setSignature(undefined);
    setVerificationCode("");
    setPasskeyCreationUrl("");
    setWalletAddress(undefined);
    setRecoverySecret("");
    setPasskeyLoginUrl("");
    setMessageToSign("");
    setShowVerificationInput(false);
    setShowLoginInput(false);
  };

  return capsule ? (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Capsule SDK Demo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={checkIfLoggedIn}>Check if User Is Logged In</Button>
          <p className="m-2">{userIsLoggedIn ? "User is logged in" : "User is not logged in"}</p>
          {userIsLoggedIn ? (
            <>
              <Input
                name="messageToSign"
                value={messageToSign}
                onChange={(e) => setMessageToSign(e.target.value)}
                placeholder="Message to sign"
              />
              <Button onClick={() => signMessage(messageToSign)}>Sign Message</Button>
              {signature && <p className="m-2">Signature: {signature}</p>}
              <Button onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Input
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
              <Button onClick={createAccount}>Create Account</Button>
              <Button onClick={() => setShowLoginInput(true)}>Initiate Login</Button>
              {showVerificationInput && (
                <>
                  <Input
                    name="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter the verification code"
                  />
                  <Button onClick={verifyEmail}>Verify Email</Button>
                </>
              )}
              {showLoginInput && <Button onClick={initiateLogin}>Login</Button>}
            </>
          )}
          {passkeyCreationUrl && <Alert className="break-words">{`Passkey Creation URL: ${passkeyCreationUrl}`}</Alert>}
          {recoverySecret && <Alert className="break-words">{`Recovery Secret: ${recoverySecret}`}</Alert>}
          {walletAddress && <Alert className="break-words">{`Wallet Address: ${walletAddress}`}</Alert>}
          {passkeyLoginUrl && <Alert className="break-words">{`Passkey Login URL: ${passkeyLoginUrl}`}</Alert>}
        </CardContent>
      </Card>
    </div>
  ) : (
    <p className="text-lg">Loading...</p>
  );
}

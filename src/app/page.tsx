"use client";

import type Capsule from "@usecapsule/web-sdk";
import { CapsuleEthersSigner as CapsuleEthersV6Signer } from "@usecapsule/ethers-v6-integration";
import { CapsuleEthersV5Signer } from "@usecapsule/ethers-v5-integration";
import {
  CapsuleEIP1193Provider as CapsuleEIP1193ProviderV1,
  CapsuleConnector as CapsuleConnectorV1,
} from "@usecapsule/wagmi-v1-integration";
import {
  CapsuleEIP1193Provider as CapsuleEIP1193ProviderV2,
  capsuleConnector as CapsuleConnectorV2,
} from "@usecapsule/wagmi-v2-integration";

import {
  createCapsuleViemClient as createCapsuleViemClientV1,
  createCapsuleAccount as createCapsuleViemAccountV1,
} from "@usecapsule/viem-v1-integration";

import {
  createCapsuleViemClient as createCapsuleViemClientV2,
  createCapsuleAccount as createCapsuleViemAccountV2,
} from "@usecapsule/viem-v2-integration";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Account, SignMessageErrorType, SignMessageParameters, http as httpV2 } from "viem";
import { sepolia as sepoliaViemV2 } from "viem/chains";

import { http as httpV1 } from "viem-v1";
import { sepolia as sepoliaViemV1 } from "viem-v1/chains";

export default function Home() {
  const [capsule, setCapsule] = useState<Capsule>();
  const [email, setEmail] = useState<string>("");
  const [signature, setSignature] = useState<string>();
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string | undefined>("");
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

  //useEffect to check if user is already logged in on page load
  useEffect(() => {
    if (capsule) {
      checkIfLoggedIn();
    }
  }, [capsule]);

  const checkIfLoggedIn = async (): Promise<void> => {
    if (!capsule) {
      throw new Error("Capsule not instantiated");
    }
    const loggedIn = await capsule.isFullyLoggedIn();
    if (loggedIn) {
      toast({
        title: "Logged in",
        description: "User is already logged in. Welcome back!",
        duration: 3000,
      });
      setWalletAddress(Object.values(capsule.getWallets())[0].address);
    } else {
      toast({
        title: "Not logged in",
        description: "User is not logged in. Please log in to access your wallet.",
        duration: 3000,
      });
    }

    setUserIsLoggedIn(loggedIn);
  };

  const createAccount = async (): Promise<void> => {
    if (!capsule) {
      throw new Error("Capsule not instantiated");
    }
    const isExistingUser = await capsule.checkIfUserExists(email);
    if (isExistingUser) {
      setIsExistingUser(true);
      //show toast
      toast({
        title: "User already exists",
        description: "The user already exists. Please login instead.",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }
    await capsule.createUser(email);
    setShowVerificationInput(true);
  };

  const verifyEmail = async (): Promise<void> => {
    if (!capsule) {
      throw new Error("Capsule not instantiated");
    }
    const url = await capsule.verifyEmail(verificationCode);
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
    window.open(url, "popup", "popup=true,width=400,height=500");

    await capsule.waitForLoginAndSetup();
    setUserIsLoggedIn(true);
    toast({
      title: "User logged in",
      description: "User has been logged in successfully. Welcome back!",
      duration: 3000,
    });
    setWalletAddress(Object.values(capsule.getWallets())[0].address);
  };

  const signMessage = async (message: string) => {
    switch (selectedSigner) {
      case "ethers-v5":
        await signWithEthersV5(message);
        break;
      case "ethers-v6":
        await signWithEthersV6(message);
        break;
      case "wagmi-v1":
        await signWithWagmiV1(message);
        break;
      case "wagmi-v2":
        await signWithWagmiV2(message);
        break;
      case "viem-v1":
        await signWithViemV1(message);
        break;
      case "viem-v2":
        await signWithViemV2(message);
        break;
      default:
        toast({
          title: "Invalid signer",
          description: "Please select a valid signer to sign the message.",
          duration: 3000,
          variant: "destructive",
        });
    }
  };

  const signWithEthersV5 = async (message: string) => {
    if (!capsule) {
      throw new Error("Capsule not instantiated");
    }
    try {
      const ethersSigner = new CapsuleEthersV5Signer(capsule);
      const signature = await ethersSigner.signMessage(message);
      setSignature(signature);
      toast({
        title: "Message signed",
        description: "Message has been signed successfully.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error signing message",
        description: `Error signing message: ${error} with signer: ${selectedSigner}`,
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  const signWithEthersV6 = async (message: string) => {
    if (!capsule) {
      throw new Error("Capsule not instantiated");
    }
    try {
      const ethersSigner = new CapsuleEthersV6Signer(capsule);
      const signature = await ethersSigner.signMessage(message);
      setSignature(signature);
      toast({
        title: "Message signed",
        description: "Message has been signed successfully.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error signing message",
        description: `Error signing message: ${error} with signer: ${selectedSigner}`,
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  const signWithWagmiV1 = async (message: string) => {};
  const signWithWagmiV2 = async (message: string) => {};
  const signWithViemV1 = async (message: string) => {};
  const signWithViemV2 = async (message: string) => {};

  const logout = async () => {
    if (!capsule) {
      throw new Error("Capsule not instantiated");
    }
    await capsule.logout();
    toast({
      title: "User logged out",
      description: "User has been logged out successfully.",
      duration: 3000,
    });
    setUserIsLoggedIn(false);
    setEmail("");
    setSignature(undefined);
    setVerificationCode("");
    setWalletAddress(undefined);
    setRecoverySecret("");
    setMessageToSign("");
    setShowVerificationInput(false);
  };

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
    <>
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Capsule SDK Demo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {userIsLoggedIn ? (
              <Alert>
                <AlertTitle className="font-bold">🎉 You're logged in!</AlertTitle>
                <AlertDescription>Welcome back! Ready to manage your wallet?</AlertDescription>
              </Alert>
            ) : (
              <>
                {" "}
                <Alert>
                  <AlertTitle className="font-bold">🚫 Not logged in!</AlertTitle>
                  <AlertDescription>Please log in to access your wallet and other features.</AlertDescription>
                </Alert>
                <Button onClick={checkIfLoggedIn}>Check if User Is Logged In</Button>
              </>
            )}
            {walletAddress && <Alert className="break-words">{`Wallet Address: ${walletAddress}`}</Alert>}

            <Separator orientation="horizontal" className="my-6" />

            {userIsLoggedIn ? (
              <>
                {signature && <Alert className="break-words">{`Signature: ${signature}`}</Alert>}
                <Select onValueChange={onSignerSelected}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a signer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Signers</SelectLabel>
                      <SelectItem value="ethers-v5">Ethers v5</SelectItem>
                      <SelectItem value="ethers-v6">Ethers v6</SelectItem>
                      <SelectItem value="wagmi-v1">Wagmi v1</SelectItem>
                      <SelectItem value="wagmi-v2">Wagmi v2</SelectItem>
                      <SelectItem value="viem-v1">Viem v1</SelectItem>
                      <SelectItem value="viem-v2">Viem v2</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Input
                  name="messageToSign"
                  value={messageToSign}
                  onChange={(e) => setMessageToSign(e.target.value)}
                  placeholder="Message to sign"
                />
                <Button
                  onClick={() => signMessage(messageToSign)}
                  disabled={!messageToSign || !selectedSigner || !walletAddress || !userIsLoggedIn}>
                  Sign Message
                </Button>
                <Button onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                {!showVerificationInput && (
                  <>
                    <h3 className="font-semibold text-center text-xl">Get Started</h3>
                    <div>
                      <Label htmlFor="email">Your Email</Label>
                      <Input
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    <Button onClick={createAccount} disabled={!email || !email.includes("@") || isExistingUser}>
                      Create Account
                    </Button>
                    <Button onClick={initiateLogin} disabled={!email || !email.includes("@")}>
                      Login
                    </Button>
                  </>
                )}
                {showVerificationInput && (
                  <>
                    <div>
                      <Label htmlFor="verificationCode">Verification Code</Label>
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
                    <Button onClick={verifyEmail} disabled={!verificationCode && verificationCode.length < 6}>
                      Verify Email
                    </Button>
                  </>
                )}
              </>
            )}
            {/* {passkeyCreationUrl && (
              <Alert className="break-words">
                {" "}
                {`Passkey Creation URL: ${passkeyCreationUrl.substring(0, 48)}... `}
              </Alert>
            )} */}
            {recoverySecret && <Alert className="break-words">{`Recovery Secret: ${recoverySecret}`}</Alert>}
            {/* {passkeyLoginUrl && <Alert className="break-words">{`Passkey Login URL: ${passkeyLoginUrl}`}</Alert>} */}
          </CardContent>
        </Card>
      </div>
    </>
  ) : (
    <p className="text-lg">Loading...</p>
  );
}

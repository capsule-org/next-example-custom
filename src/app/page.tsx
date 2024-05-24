"use client";

import { useEffect, useState } from "react";

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
import dynamic from "next/dynamic";
import { CapsuleWeb, Environment, OAuthMethod } from "@usecapsule/web-sdk";
import "@usecapsule/react-sdk/styles.css";
import Logo from "../../public/logo.svg";

const CapsuleModal = dynamic(() => import("@usecapsule/react-sdk").then((module) => module.CapsuleModal), {
  ssr: false,
});

export default function Home() {
  const [capsuleClient, setCapsuleClient] = useState<CapsuleWeb | null>(null);

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

  const [isCapsuleModalOpen, setIsCapsuleModalOpen] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_CAPSULE_API_KEY) {
      const client = new CapsuleWeb(Environment.DEVELOPMENT, process.env.NEXT_PUBLIC_CAPSULE_API_KEY);
      setCapsuleClient(client);
    } else {
      console.error("Capsule API key is missing");
    }
  }, []);

  useEffect(() => {
    if (capsuleClient) {
      checkIfLoggedIn(capsuleClient, toast, setWalletAddress, setUserIsLoggedIn);
    }
  }, []);

  const onSignerSelected = (signer: string) => {
    setSignature("");
    setSelectedSigner(signer);
    toast({
      title: "Signer selected",
      description: `Signer ${signer} selected successfully. Ready to sign messages.`,
      duration: 3000,
    });
  };

  if (!capsuleClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader alignment="center" />
      </div>
    );
  }

  return (
    <>
      <CapsuleCard>
        {userIsLoggedIn ? (
          <UserAlerts.UserLoggedIn />
        ) : (
          <>
            <UserAlerts.UserNotLoggedIn />
            <Button onClick={() => checkIfLoggedIn(capsuleClient, toast, setWalletAddress, setUserIsLoggedIn)}>
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
              signMessage={() => signMessage(capsuleClient, selectedSigner, messageToSign, setSignature, toast)}
              selectedSigner={selectedSigner}
              walletAddress={walletAddress}
              userIsLoggedIn={userIsLoggedIn}
              signature={signature}
            />
            <Button
              onClick={() =>
                logout(
                  capsuleClient,
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
                createAccount={() =>
                  createAccount(capsuleClient, email, toast, setIsExistingUser, setShowVerificationInput)
                }
                initiateLogin={() => initiateLogin(capsuleClient, email, toast, setUserIsLoggedIn, setWalletAddress)}
                isExistingUser={isExistingUser}
                setIsCapsuleModalOpen={setIsCapsuleModalOpen}
              />
            )}
            {showVerificationInput && (
              <VerifyEmailForm
                verificationCode={verificationCode}
                setVerificationCode={setVerificationCode}
                verifyEmail={() =>
                  verifyEmail(capsuleClient, verificationCode, setWalletAddress, setRecoverySecret, toast)
                }
              />
            )}
          </>
        )}

        {recoverySecret && <Alert className="break-words">{`Recovery Secret: ${recoverySecret}`}</Alert>}
      </CapsuleCard>
      {isCapsuleModalOpen && (
        <CapsuleModal
          capsule={capsuleClient}
          isOpen={isCapsuleModalOpen}
          onClose={() => {
            setIsCapsuleModalOpen(false);
            checkIfLoggedIn(capsuleClient, toast, setWalletAddress, setUserIsLoggedIn);
          }}
          appName={"Capsule Example App"}
          logo={"/logo.png"}
          theme={{
            backgroundColor: "#ffffff",
            foregroundColor: "#0F172A",
            oAuthLogoVariant: "dark",
            borderRadius: "md",
          }}
          oAuthMethods={[OAuthMethod.APPLE, OAuthMethod.GOOGLE, OAuthMethod.TWITTER, OAuthMethod.FACEBOOK]}
        />
      )}
    </>
  );
}

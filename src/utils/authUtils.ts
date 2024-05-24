import type { Toast, toast } from "@/components/ui/use-toast";
import type Capsule from "@usecapsule/web-sdk";
import type { Dispatch, SetStateAction } from "react";

export const checkIfLoggedIn = async (
  capsule: Capsule,
  toast: ({}: Toast) => {},
  setWalletAddress: Dispatch<SetStateAction<string>>,
  setUserIsLoggedIn: Dispatch<SetStateAction<boolean>>
) => {
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
    setWalletAddress(Object.values(capsule.getWallets())[0].address || "");
  } else {
    toast({
      title: "Not logged in",
      description: "User is not logged in. Please log in to access your wallet.",
      duration: 3000,
    });
  }

  setUserIsLoggedIn(loggedIn);
};

export const createAccount = async (
  capsule: Capsule,
  email: string,
  toast: ({}: Toast) => void,
  setIsExistingUser: Dispatch<SetStateAction<boolean>>,
  setShowVerificationInput: Dispatch<SetStateAction<boolean>>
) => {
  if (!capsule) {
    throw new Error("Capsule not instantiated");
  }
  try {
    const isExistingUser = await capsule.checkIfUserExists(email);
    if (isExistingUser) {
      setIsExistingUser(true);
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
  } catch (error) {
    console.error(error);
    toast({
      title: "Error creating user",
      description: `Error creating user: ${error}`,
      duration: 3000,
      variant: "destructive",
    });
  }
};

export const verifyEmail = async (
  capsule: Capsule,
  verificationCode: string,
  setWalletAddress: Dispatch<SetStateAction<string>>,
  setRecoverySecret: Dispatch<SetStateAction<string>>,
  toast: ({}: Toast) => void
) => {
  if (!capsule) {
    throw new Error("Capsule not instantiated");
  }
  try {
    const url = await capsule.verifyEmail(verificationCode);
    window.open(url, "popup", "popup=true,width=400,height=500");
    const recoverySecret = await capsule.waitForPasskeyAndCreateWallet();
    setWalletAddress(Object.values(capsule.getWallets())[0].address || "");
    setRecoverySecret(recoverySecret);
  } catch (error) {
    console.error(error);
    toast({
      title: "Error verifying email",
      description: `Error verifying email: ${error}`,
      duration: 3000,
      variant: "destructive",
    });
  }
};

export const initiateLogin = async (
  capsule: Capsule,
  email: string,
  toast: ({}: Toast) => void,
  setUserIsLoggedIn: Dispatch<SetStateAction<boolean>>,
  setWalletAddress: Dispatch<SetStateAction<string>>
) => {
  if (!capsule) {
    throw new Error("Capsule not instantiated");
  }
  try {
    const url = await capsule.initiateUserLogin(email);
    window.open(url, "popup", "popup=true,width=400,height=500");

    await capsule.waitForLoginAndSetup();
    setUserIsLoggedIn(true);
    setWalletAddress(Object.values(capsule.getWallets())[0].address || "");
    toast({
      title: "User logged in",
      description: "User has been logged in successfully. Welcome back!",
      duration: 3000,
    });
  } catch (error) {
    console.error(error);
    toast({
      title: "Error logging in",
      description: `Error logging in: ${error}`,
      duration: 3000,
      variant: "destructive",
    });
  }
};

export const logout = async (
  capsule: Capsule,
  toast: ({}: Toast) => void,
  setUserIsLoggedIn: Dispatch<SetStateAction<boolean>>,
  setEmail: Dispatch<SetStateAction<string>>,
  setSignature: Dispatch<SetStateAction<string>>,
  setVerificationCode: Dispatch<SetStateAction<string>>,
  setWalletAddress: Dispatch<SetStateAction<string>>,
  setRecoverySecret: Dispatch<SetStateAction<string>>,
  setMessageToSign: Dispatch<SetStateAction<string>>,
  setShowVerificationInput: Dispatch<SetStateAction<boolean>>
) => {
  if (!capsule) {
    throw new Error("Capsule not instantiated");
  }
  try {
    await capsule.logout();
    toast({
      title: "User logged out",
      description: "User has been logged out successfully.",
      duration: 3000,
    });
    setUserIsLoggedIn(false);
    setEmail("");
    setSignature("");
    setVerificationCode("");
    setWalletAddress("");
    setRecoverySecret("");
    setMessageToSign("");
    setShowVerificationInput(false);
  } catch (error) {
    console.error(error);
    toast({
      title: "Error logging out",
      description: `Error logging out: ${error}`,
      duration: 3000,
      variant: "destructive",
    });
  }
};

import type Capsule from "@usecapsule/web-sdk";
import type { Dispatch, SetStateAction } from "react";
import type { Toast } from "@/components/ui/use-toast";
// Ethers
import { CapsuleEthersSigner as CapsuleEthersV6Signer } from "@usecapsule/ethers-v6-integration";
import { CapsuleEthersV5Signer } from "@usecapsule/ethers-v5-integration";
// Viem
import {
  createCapsuleViemClient as createCapsuleViemClientV1,
  createCapsuleAccount as createCapsuleViemAccountV1,
} from "@usecapsule/viem-v1-integration";
import {
  createCapsuleViemClient as createCapsuleViemClientV2,
  createCapsuleAccount as createCapsuleViemAccountV2,
} from "@usecapsule/viem-v2-integration";
import { WalletClientConfig as WalletClientConfigViemV2, http as httpViemV2 } from "viem";
import { WalletClientConfig as WalletClientConfigViemV1, http as httpViemV1 } from "viem-v1";
import { sepolia as sepoliaViemV2 } from "viem/chains";
import { sepolia as sepoliaViemV1 } from "viem-v1/chains";

export const signWithEthersV5 = async (
  capsule: Capsule,
  message: string,
  setSignature: Dispatch<SetStateAction<string>>,
  toast: ({}: Toast) => void
) => {
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
    console.error(error);
    toast({
      title: "Error signing message",
      description: `Error signing message: ${error} with signer: ethers-v5`,
      duration: 3000,
      variant: "destructive",
    });
  }
};

export const signWithEthersV6 = async (
  capsule: Capsule,
  message: string,
  setSignature: Dispatch<SetStateAction<string>>,
  toast: ({}: Toast) => void
) => {
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
    console.error(error);
    toast({
      title: "Error signing message",
      description: `Error signing message: ${error} with signer: ethers-v6`,
      duration: 3000,
      variant: "destructive",
    });
  }
};

export const signWithViemV1 = async (
  capsule: Capsule,
  message: string,
  setSignature: Dispatch<SetStateAction<string>>,
  toast: ({}: Toast) => void
) => {
  if (!capsule) {
    throw new Error("Capsule not instantiated");
  }
  try {
    const walletClientConfig: WalletClientConfigViemV1 = {
      chain: sepoliaViemV1,
      transport: httpViemV1(process.env.NEXT_PUBLIC_RPC_URL),
    };
    const viemClient = createCapsuleViemClientV1(capsule, walletClientConfig);

    const signature = await viemClient.signMessage({
      account: createCapsuleViemAccountV1(capsule),
      message: message,
    });
    setSignature(signature);
    toast({
      title: "Message signed",
      description: "Message has been signed successfully.",
      duration: 3000,
    });
  } catch (error) {
    console.error(error);
    toast({
      title: "Error signing message",
      description: `Error signing message: ${error} with signer: wagmi-v1`,
      duration: 3000,
      variant: "destructive",
    });
  }
};

export const signWithViemV2 = async (
  capsule: Capsule,
  message: string,
  setSignature: Dispatch<SetStateAction<string>>,
  toast: ({}: Toast) => void
) => {
  if (!capsule) {
    throw new Error("Capsule not instantiated");
  }
  try {
    const walletClientConfig: WalletClientConfigViemV2 = {
      chain: sepoliaViemV2,
      transport: httpViemV2(process.env.NEXT_PUBLIC_RPC_URL),
    };
    const viemClient = createCapsuleViemClientV2(capsule, walletClientConfig);

    const signature = await viemClient.signMessage({
      account: createCapsuleViemAccountV2(capsule),
      message: message,
    });
    setSignature(signature);
    toast({
      title: "Message signed",
      description: "Message has been signed successfully.",
      duration: 3000,
    });
  } catch (error) {
    console.error(error);
    toast({
      title: "Error signing message",
      description: `Error signing message: ${error} with signer: wagmi-v1`,
      duration: 3000,
      variant: "destructive",
    });
  }
};

export const signMessage = async (
  capsule: Capsule,
  selectedSigner: string,
  message: string,
  setSignature: Dispatch<SetStateAction<string>>,
  toast: ({}: Toast) => void
) => {
  switch (selectedSigner) {
    case "ethers-v5":
      await signWithEthersV5(capsule, message, setSignature, toast);
      break;
    case "ethers-v6":
      await signWithEthersV6(capsule, message, setSignature, toast);
      break;
    case "viem-v1":
      await signWithViemV1(capsule, message, setSignature, toast);
      break;
    case "viem-v2":
      await signWithViemV2(capsule, message, setSignature, toast);
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

import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Alert } from "./ui/alert";

interface MessageSignerProps {
  onSignerSelected: (value: string) => void;
  messageToSign: string;
  setMessageToSign: (message: string) => void;
  signMessage: () => void;
  selectedSigner: string | null;
  walletAddress: string | null;
  userIsLoggedIn: boolean;
  signature: string | null;
}

export const MessageSigner: React.FC<MessageSignerProps> = ({
  onSignerSelected,
  messageToSign,
  setMessageToSign,
  signMessage,
  selectedSigner,
  walletAddress,
  userIsLoggedIn,
  signature,
}) => {
  return (
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
      <Label>Message:</Label>
      <Input
        name="messageToSign"
        value={messageToSign}
        onChange={(e) => setMessageToSign(e.target.value)}
        placeholder="Message to sign"
      />
      <Button onClick={signMessage} disabled={!messageToSign || !selectedSigner || !walletAddress || !userIsLoggedIn}>
        Sign Message
      </Button>
    </>
  );
};

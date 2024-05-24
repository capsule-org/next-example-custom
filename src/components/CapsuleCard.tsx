import React, { PropsWithChildren } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";

export const CapsuleCard: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="Capsule Logo" className={"w-52 h-auto self-center mb-2"} />
          <CardTitle>Capsule SDK Demo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>
    </div>
  );
};

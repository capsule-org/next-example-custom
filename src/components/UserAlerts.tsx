import React from "react";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";

const UserLoggedIn: React.FC = () => (
  <Alert>
    <AlertTitle className="font-bold">🎉 You're logged in!</AlertTitle>
    <AlertDescription>Welcome back! Ready to manage your wallet?</AlertDescription>
  </Alert>
);

const UserNotLoggedIn: React.FC = () => (
  <Alert>
    <AlertTitle className="font-bold">🚫 Not logged in!</AlertTitle>
    <AlertDescription>Please log in to access your wallet and other features.</AlertDescription>
  </Alert>
);

export const UserAlerts = {
  UserLoggedIn,
  UserNotLoggedIn,
};

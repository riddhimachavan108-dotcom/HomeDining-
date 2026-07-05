import type { Metadata } from "next";
import SetupWizard from "./SetupWizard";

export const metadata: Metadata = {
  title: "Set up your hotel — Home Dining",
};

export default function SetupPage() {
  return <SetupWizard />;
}

"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import {
  Send,
  PiggyBank,
  FileText,
  Shield,
  Users,
  TrendingUp,
} from "lucide-react";
import FAQSection from "@/components/FAQSection";
import FeatureSection from "@/components/FeatureSection";
import WalletDropdown from "@/components/WalletDropdown";
import WhyChooseStellar from "@/components/WhyChooseStellar";
import Hero from "@/components/Hero";

export default function Home() {
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const walletButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      {/* <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">RemitWise</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </Link>
              <Link href="/send" className="text-gray-700 hover:text-blue-600">
                Send Money
              </Link>
              <Link href="/goals" className="text-gray-700 hover:text-blue-600">
                Savings Goals
              </Link>
              <Link href="/bills" className="text-gray-700 hover:text-blue-600">
                Bills
              </Link>
              <Link
                href="/settings"
                className="text-gray-700 hover:text-blue-600"
              >
                Settings
              </Link>
            </nav>
            <div className="relative">
              <button
                ref={walletButtonRef}
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Connect Wallet
              </button>
              <WalletDropdown
                isOpen={isWalletDropdownOpen}
                onClose={() => setIsWalletDropdownOpen(false)}
                buttonRef={walletButtonRef}
              />
            </div>
          </div>
        </div>
      </header> */}


      {/* Hero Section */}
      <Hero/>

      {/* FAQ Section */}
      < FAQSection />
    </main >
  );
}

function HighlightCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#141414] border border-[#232323] rounded-2xl p-7 pb-12 flex items-start gap-4">
      <div className="w-11 h-11 bg-[#1c1010] border border-[#2a1515] rounded-lg flex items-center justify-center flex-shrink-0">
        <div className="text-red-500">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-[#808080] text-sm leading-6 mt-3">{description}</p>
      </div>
    </div>
  );
}

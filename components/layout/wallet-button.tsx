"use client";

import { appConfig } from "@/config/app";
import { ExternalLinkIcon, LogOutIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function WalletButton() {
  function formatAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="h-auto gap-2 py-1 px-3">
          <Avatar>
            <AvatarFallback>
              <UserIcon />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <p>Demo Agentic Wallet</p>
            <p className="text-xs text-muted-foreground">
              {formatAddress(appConfig.demoAgenticWallet.address)}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={appConfig.demoAgenticWallet.explorerUrl} target="_blank">
            <ExternalLinkIcon /> X Layer Explorer
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={true}>
          <LogOutIcon /> Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

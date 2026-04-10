"use client";

import { appConfig } from "@/config/app";
import Link from "next/link";
import { Button } from "../ui/button";
import { ThemeToggleButton } from "./theme-toggle-button";
import { ToolsButton } from "./tools-button";

export function Footer() {
  return (
    <footer className="bg-background border-t py-2">
      <div className="container mx-auto px-4 flex flex-row items-center gap-4 h-16">
        {/* Left part */}
        <p className="flex-1 text-sm text-muted-foreground">
          Built by
          <Link href={appConfig.developer.url} target="_blank">
            <Button variant="link" className="px-1 py-0">
              {appConfig.developer.name}
            </Button>
          </Link>
          © 2026
        </p>
        {/* Right part */}
        <ThemeToggleButton />
        <ToolsButton />
      </div>
    </footer>
  );
}

"use client";

import { WrenchIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function ToolsButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={true}>
          <WrenchIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end"></DropdownMenuContent>
    </DropdownMenu>
  );
}

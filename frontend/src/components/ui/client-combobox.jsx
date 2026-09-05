"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ClientNameBadge } from "@/components/clients/ClientNameBadge";

const ClientCombobox = React.forwardRef(function ClientCombobox(
  {
    clients = [],
    isLoading = false,
    value,
    color_code,
    onValueChange,
    placeholder = "Search client...",
    disabled = false,
    className,
    searchValue = "",
    onSearchChange,
    simple = false,
  },
  ref
) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef(null);
  const commandInputRef = React.useRef(null);
  
  // Expose focus method through ref
  React.useImperativeHandle(ref, () => ({
    focus: () => {
      if (triggerRef.current) {
        triggerRef.current.focus();
        setOpen(true);
        setTimeout(() => {
          if (commandInputRef.current) {
            commandInputRef.current.focus();
          }
        }, 100);
      }
    },
  }));

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen && onSearchChange) {
      onSearchChange("");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10 text-sm px-4 py-2 rounded-md relative",
            className
          )}
          disabled={disabled}
        >
          {value ? (
            <ClientNameBadge name={value} color_code={color_code} className="truncate" />
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            ref={commandInputRef}
            placeholder="Search by name or phone..."
            value={searchValue}
            onValueChange={onSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No clients found."}
            </CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => {
                    onValueChange(client);
                    setOpen(false);
                  }}
                >
                  {simple ? (
                    <ClientNameBadge client={client} className="font-medium" />
                  ) : (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <ClientNameBadge client={client} className="font-medium" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground">
                              {client.phone_number || "No phone"}
                            </span>
                          </div>
                          <Badge
                            variant={client.balance < 0 ? "destructive" : "outline"}
                            className="text-xs"
                          >
                            {formatCurrency(client.balance || 0)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            client.type === "company"
                              ? "secondary"
                              : client.type === "customer"
                              ? "default"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {client.type}
                        </Badge>
                        {client.discount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {client.discount}% discount
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

export { ClientCombobox };


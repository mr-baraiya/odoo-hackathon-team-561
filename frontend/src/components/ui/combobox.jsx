"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const ProductCombobox = React.forwardRef(function ProductCombobox(
  {
    products = [],
    isLoading = false,
    value,
    onValueChange,
    placeholder = "Select product...",
    disabled = false,
    className,
    invoiceType = "sales",
    onSearch = null,
    searchProducts = [],
    isSearching = false,
    searchValue = "",
    onSearchValueChange = null,
  },
  ref
) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef(null);

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      if (triggerRef.current) {
        triggerRef.current.focus();
        setOpen(true);
      }
    },
    open: () => {
      setOpen(true);
    },
  }));

  const formatPrice = (product) => {
    if (invoiceType === "purchase" || invoiceType === "purchase_return") {
      return product.party_price || (product.purchase_price * (100 - (product.party_discount || 0))) / 100;
    }
    if (invoiceType === "sale" || invoiceType === "sale_return") {
      return product.party_price || (product.price * (100 - (product.party_discount || 0))) / 100;
    }

    return product.party_price || (product.price * (100 - (product.party_discount || 0))) / 100;
  };

  const displayProducts = searchProducts.length > 0 ? searchProducts : products;
  const isDisplayingSearchResults = searchProducts.length > 0;

  const handleSearchValueChange = (newValue) => {
    if (onSearchValueChange) {
      onSearchValueChange(newValue);
    }

    if (onSearch && newValue.length > 0) {
      onSearch(newValue);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-7 text-sm p-0 m-0 border-none shadow-none bg-transparent focus:ring-0 focus:border-blue-400",
            className
          )}
          disabled={disabled}
          onFocus={() => {
            if (!disabled) {
              setOpen(true);
            }
          }}>
          {value ? (
            <span className="truncate">{value}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search products..."
            value={searchValue || ""}
            onValueChange={handleSearchValueChange}
            autoFocus={open}
          />
          <CommandList>
            <CommandEmpty>{isLoading || isSearching ? "Loading..." : "No products found."}</CommandEmpty>
            <CommandGroup>
              {isDisplayingSearchResults && (
                <div className="px-2 py-1 text-xs text-muted-foreground bg-muted/50">Search results</div>
              )}
              {displayProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.full_name || product.name}
                  onSelect={() => {
                    onValueChange(product);
                    setOpen(false);
                    if (onSearchValueChange) {
                      onSearchValueChange("");
                    }
                  }}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <span className="font-medium">{product.full_name || product.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        Mfg: {product.mfg_days != null ? product.mfg_days : "-"}
                      </span>
                      <span className="text-sm font-medium">₹{formatPrice(product)}</span>
                      <Badge variant={product.stock > 0 ? "outline" : "destructive"} className="text-xs text-black bg-red-500/50 border-red-800/50">
                        <span className="text-xs text-red-800">{product.pending_order_quantity || 0}</span>/
                        <span className="text-xs">{product.stock || 0}</span> in stock
                      </Badge>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

function BindProductCombobox({
  bindProducts = [],
  isLoading = false,
  value,
  onValueChange,
  placeholder = "Select bind product...",
  disabled = false,
  className,
  onSearch = null,
  searchBindProducts = [],
  isSearching = false,
  searchValue = "",
  onSearchValueChange = null,
}) {
  const [open, setOpen] = React.useState(false);

  const displayBindProducts = searchBindProducts.length > 0 ? searchBindProducts : bindProducts;
  const isDisplayingSearchResults = searchBindProducts.length > 0;

  const handleSearchValueChange = (newValue) => {
    if (onSearchValueChange) {
      onSearchValueChange(newValue);
    }

    if (onSearch && newValue.length > 0) {
      onSearch(newValue);
    }
  };

  const handleValueChange = (bindProduct) => {
    onValueChange(bindProduct);
    if (onSearchValueChange) {
      onSearchValueChange("");
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-7 text-sm p-0 m-0 border-none shadow-none bg-transparent focus:ring-0 focus:border-blue-400",
            className
          )}
          disabled={disabled}>
          {value ? (
            <span className="truncate">{value}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search bind products..."
            value={searchValue || ""}
            onValueChange={handleSearchValueChange}
            autoFocus={open}
          />
          <CommandList>
            <CommandEmpty>{isLoading || isSearching ? "Loading..." : "No bind products found."}</CommandEmpty>
            <CommandGroup>
              {isDisplayingSearchResults && (
                <div className="px-2 py-1 text-xs text-muted-foreground bg-muted/50">Search results</div>
              )}
              {displayBindProducts.map((bindProduct) => (
                <CommandItem
                  key={bindProduct.id}
                  value={bindProduct.name}
                  onSelect={() => handleValueChange(bindProduct)}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <span className="font-medium">{bindProduct.name}</span>
                    </div>
                  </div>
                  {bindProduct.category && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Category: {bindProduct.category?.name || "N/A"}
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { ProductCombobox, BindProductCombobox };


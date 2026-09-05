import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  if (!dateString) return "N/A"

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date"

  // Format: DD/MM/YYYY, HH:MM
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}


export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return "₹0.00"

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

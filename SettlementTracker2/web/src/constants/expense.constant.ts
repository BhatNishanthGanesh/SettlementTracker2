

import {
  Car,
  CreditCard,
  Film,
  Hotel,
  ShoppingBag,
  Utensils,
  Lightbulb,
  HeartPulse,
} from "lucide-react";

export const categoryIcons: Record<string, any> = {
  food: Utensils,
  transport: Car,
  accommodation: Hotel,
  entertainment: Film,
  shopping: ShoppingBag,
  utilities: Lightbulb,
  health: HeartPulse,
  other: CreditCard,
};

export const categoryColors: Record<string, string> = {
  food: "from-red-500 to-red-600",
  transport: "from-purple-500 to-purple-600",
  accommodation: "from-orange-500 to-orange-600",
  entertainment: "from-yellow-500 to-yellow-600",
  shopping: "from-pink-500 to-pink-600",
  utilities: "from-blue-500 to-blue-600",
  health: "from-green-500 to-green-600",
  other: "from-gray-500 to-gray-600",
};

export const getCategoryIcon = (
  category?: string | null
) => {
  return (
    categoryIcons[
      category?.toLowerCase() || "other"
    ] || CreditCard
  );
};

export const getCategoryColor = (
  category?: string | null
) => {
  return (
    categoryColors[
      category?.toLowerCase() || "other"
    ] || "from-gray-500 to-gray-600"
  );
};

export const categories = [
  {
    value: "food",
    label: "🍽️ Food & Dining",
  },
  {
    value: "transport",
    label: "🚗 Transport",
  },
  {
    value: "accommodation",
    label: "🏨 Accommodation",
  },
  {
    value: "entertainment",
    label: "🎭 Entertainment",
  },
  {
    value: "shopping",
    label: "🛍️ Shopping",
  },
  {
    value: "utilities",
    label: "💡 Utilities",
  },
  {
    value: "health",
    label: "🏥 Health",
  },
  {
    value: "other",
    label: "📌 Other",
  },
];
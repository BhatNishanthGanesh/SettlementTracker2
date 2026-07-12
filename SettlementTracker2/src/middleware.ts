export { default } from "next-auth/middleware";

// to protect matching routes

export const config = {
  matcher: ["/dashboard", "/owes", "/pay", "/savings", "/calculator", "/expense","/expense/day","/monthlyexpenses"],
};

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthOptions } from "next-auth";
import prisma from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email..",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password..",
        },
      },
      async authorize(credentials: any) {
        try {
          console.log("Received credentials:", credentials);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          console.log("User from database:", user);

          if (!user || !user.password) return null;

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            return null;
          }

          return user;
        } catch (err: any) {
          throw new Error(`Authorization failed: ${err.message}`);
        }
      },
    }),

    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account }) {
      console.log("SIGNIN CALLBACK");
      console.log(user);
      console.log(account);

      if (!account || !user) return false;

      if (account.provider === "google") {
        console.log("Google login");

        if (!user.email || !user.name) {
          console.log("Missing email or name");
          return false;
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        console.log("Existing:", existingUser);

        if (!existingUser) {
          const created = await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
            },
          });

          console.log("Created:", created);
        }

        return true;
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      console.log("JWT CALLBACK");
      console.log("Token:", token);
      console.log("User:", user);
      console.log("Trigger:", trigger);
      console.log("Session:", session);

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
        }
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.picture = session.user.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.image = token.picture as string | null;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};
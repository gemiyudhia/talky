import { login, loginWithGoogle } from "@/lib/firebase/service";
import { UserData } from "@/types/UserData";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      type: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const loginResponse = await login({
            email: credentials.email,
            password: credentials.password,
          });

          if (!loginResponse.status) {
            throw new Error(loginResponse.error || "Login failed");
          }

          const user = loginResponse.user;

          if (!user?.emailVerified) {
            throw new Error("Email not verified. Please verify your email.");
          }

          return {
            id: user.id,
            email: user.email,
          };
        } catch (error) {
          console.error("Authorization error: ", error);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.provider === "credentials" && user) {
        const customUser = user as UserData;

        token.id = customUser.id;
        token.email = customUser.email;
        token.fullname = customUser.fullname;
        token.role = customUser.role;
      }

      if (account?.provider === "google") {
        const data: UserData = {
          id: user.id,
          fullname: user.name || "",
          email: user.email || "",
          type: "google",
        };

        await loginWithGoogle(
          data,
          (result: { status: boolean; data: UserData }) => {
            if (result.status) {
              token.id = result.data.id;
              token.email = result.data.email;
              token.fullname = result.data.fullname;
              token.role = result.data.role;
              token.type = result.data.type;
              token.createdAt = result.data.createdAt;
              token.pin = result.data.pin;
            }
          }
        );
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          fullname: token.fullname as string,
          role: token.role as string,
          pin: token.pin as string,
        };
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

import { login, loginWithGoogle } from "@/lib/firebase/service";
import { UserData } from "@/types/UserData";
import { compare } from "bcrypt";
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

          const user: UserData | null = await login({
            email: credentials.email,
          });

          if (!user) {
            throw new Error("user not found");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password || ""
          );

          if (!isPasswordValid) {
            throw new Error("invalid email or password");
          }

          return {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.log("authorization error: ", error);
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
        };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

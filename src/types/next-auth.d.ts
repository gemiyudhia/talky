import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      fullname: string;
      email: string;
      role: string;
      pin: string
    };
  }

  interface JWT {
    id: string;
    fullname: string;
    email: string;
    role: string;
  }
}

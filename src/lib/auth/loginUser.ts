import { signIn } from "next-auth/react";

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res?.ok) {
      return { success: true, message: "login success" };
    } else {
      return { success: false, message: "login failed" };
    }
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
};

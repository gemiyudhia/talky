export const registerUser = async (data: {
  fullname: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "something went wrong");
    }

    return { success: true, message: "registration successful" };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
};

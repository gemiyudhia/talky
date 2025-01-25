export const addFriend = async (pin: string, currentUserId: string) => {
  try {
    const response = await fetch("/api/friend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pin,
        currentUserId,
      }),
    });

    // Periksa jika response berhasil
    if (response.ok) {
      const result = await response.json(); // Dapatkan hasil json dari response
      return {
        success: true,
        message: "Friend added successfully",
        data: result,
      };
    } else {
      // Jika response gagal, kembalikan pesan gagal
      const result = await response.json();
      return {
        success: false,
        message: result.message || "Failed to add friend",
      };
    }
  } catch (error) {
    console.log("Error adding friend: ", error);
    throw new Error("Failed to add friend");
  }
};

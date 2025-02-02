import { NextRequest, NextResponse } from "next/server";
import {
  addFriendToUser,
  fetchUserData,
  findUserByPin,
  getUserData,
  updateFriendRequests,
  updateUserFriends,
} from "@/lib/firebase/service";

export async function POST(request: NextRequest) {
  try {
    const { pin, currentUserId } = await request.json();

    // Validate inputs
    if (!pin || !currentUserId) {
      return NextResponse.json(
        { success: false, message: "PIN and Current User ID are required" },
        { status: 400 }
      );
    }

    // Find user with matching PIN
    const querySnapshot = await findUserByPin({ pin });

    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, message: "No user found with this PIN" },
        { status: 404 }
      );
    }

    // Get the target user
    const targetUserDoc = querySnapshot.docs[0];
    const targetUserId = targetUserDoc.id;

    // Prevent self-friending
    if (targetUserId === currentUserId) {
      return NextResponse.json(
        { success: false, message: "You cannot friend yourself" },
        { status: 400 }
      );
    }

    // Update friend requests for target user
    await updateFriendRequests({
      userId: targetUserId,
      friendRequest: {
        fromUserId: currentUserId,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Friend request sent successfully",
    });
  } catch (error) {
    console.error("Friend request error:", error);
    return NextResponse.json(
      { success: false, message: "Error processing friend request" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { requestId, currentUserId, action } = await request.json();

    // Validate inputs
    if (!requestId || !currentUserId || !action) {
      return NextResponse.json(
        { success: false, message: "Invalid input data" },
        { status: 400 }
      );
    }

    // Get user data
    const userData = await getUserData({ userId: currentUserId });
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update friend requests list
    const updatedFriendRequests = userData.friendRequests?.filter(
      (friendRequest: { fromUserId: string; status: string }) =>
        friendRequest.fromUserId !== requestId
    );

    if (action === "accept") {
      // Add friend to user's friend list
      await addFriendToUser({ userId: currentUserId, friendId: requestId });

      // Add current user to requester's friend list (bidirectional addition)
      await addFriendToUser({ userId: requestId, friendId: currentUserId });

      // Update friend requests
      await updateUserFriends({
        userId: currentUserId,
        friendList: [...(userData.friends || []), requestId],
        friendRequestsList: updatedFriendRequests,
      });
    } else {
      // If rejected, just update friend requests
      await updateUserFriends({
        userId: currentUserId,
        friendList: userData.friends,
        friendRequestsList: updatedFriendRequests,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Friend request ${action}ed successfully`,
    });
  } catch (error) {
    console.error("Friend request response error:", error);
    return NextResponse.json(
      { success: false, message: "Error processing friend request response" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const userData = await fetchUserData({ userId });
    if (!userData) return NextResponse.json({ friends: [] });

    if (!userData.friends || userData.friends.length === 0) {
      return NextResponse.json({ friends: [] });
    }

    const friends = await Promise.all(
      userData.friends.map(async (friendId: string) => {
        const friendData = await fetchUserData({ userId: friendId });
        return {
          id: friendId,
          fullname: friendData?.fullname || "unknown",
        };
      })
    );

    return NextResponse.json({ friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
}

import { UserData } from "@/types/UserData";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { app } from "./init";
import { generateUniquePin } from "./generatePin";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";

const firestore = getFirestore(app);
const auth = getAuth(app);

export async function register(data: UserData) {
  if (!data.email) {
    throw new Error("Email is required");
  }

  const q = query(
    collection(firestore, "users"),
    where("email", "==", data.email)
  );

  const snapshot = await getDocs(q);

  const user = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (user.length > 0) {
    return { status: false, statusCode: 400, message: "User already exists" };
  } else {
    if (!data.role) {
      data.role = "member";
    }

    const pin = await generateUniquePin();
    data.pin = pin;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password || ""
      );

      await sendEmailVerification(userCredential.user);

      await addDoc(collection(firestore, "users"), {
        fullname: data.fullname,
        email: data.email,
        pin: data.pin,
        role: data.role,
        createdAt: new Date().toISOString(),
      });

      return {
        status: true,
        statusCode: 200,
        message: "User created successfully. Please verify your email.",
        pin,
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        statusCode: 500,
        message: "Something went wrong",
      };
    }
  }
}

export async function login(data: { email: string; password: string }) {
  try {
    const q = query(
      collection(firestore, "users"),
      where("email", "==", data.email)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { status: false, error: "User not found" };
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const user = userCredential.user;

    if (!user.emailVerified) {
      return { status: false, error: "Email not verified" };
    }

    return {
      status: true,
      user: {
        email: user.email,
        id: user.uid,
        emailVerified: user.emailVerified,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { status: false, error: "Invalid credentials" };
  }
}

export async function loginWithGoogle(
  data: UserData,
  callback: (result: { status: boolean; data: UserData }) => void
) {
  const q = query(
    collection(firestore, "users"),
    where("email", "==", data.email)
  );

  const snapshot = await getDocs(q);

  const user: UserData[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (user.length > 0) {
    callback({
      status: true,
      data: {
        id: user[0].id,
        fullname: data.fullname,
        email: data.email,
        pin: user[0].pin,
        type: user[0].type,
        role: data.role,
        createdAt: user[0].createdAt,
      },
    });
  } else {
    data.role = "member";

    // Generate a unique pin for the new user
    const pin = await generateUniquePin();
    const newUserRef = await addDoc(collection(firestore, "users"), {
      fullname: data.fullname,
      email: data.email,
      role: data.role,
      pin: pin,
      type: "google",
      createdAt: new Date().toISOString(),
    });

    callback({
      status: true,
      data: {
        id: newUserRef.id,
        fullname: data.fullname,
        email: data.email,
        pin: pin,
        role: data.role,
        createdAt: new Date().toISOString(),
      },
    });
  }
}

export async function findUserByPin(data: { pin: string }) {
  const userRef = collection(firestore, "users");
  const q = query(userRef, where("pin", "==", data.pin));
  return await getDocs(q);
}

export async function updateFriendRequests(data: {
  userId: string;
  friendRequest: {
    fromUserId: string;
    status: string;
  };
}) {
  const userRef = doc(firestore, "users", data.userId);

  await updateDoc(userRef, {
    friendRequests: arrayUnion(data.friendRequest),
  });
}

export async function updateUserFriends(data: {
  userId: string;
  friendList: string[];
  friendRequestsList: {
    fromUserId: string;
    status: "pending" | "accepted" | "rejected";
  }[];
}) {
  const userRef = doc(firestore, "users", data.userId);
  await updateDoc(userRef, {
    friends: data.friendList,
    friendRequests: data.friendRequestsList,
  });
}

export async function getUserData(data: { userId: string }) {
  const userRef = doc(firestore, "users", data.userId);

  const userDoc = await getDoc(userRef);

  return userDoc.data();
}

export async function addFriendToUser(data: {
  userId: string;
  friendId: string;
}) {
  const userRef = doc(firestore, "users", data.userId);
  await updateDoc(userRef, {
    friend: arrayUnion(data.friendId),
  });
}

export async function fetchUserData(data: { userId: string }) {
  try {
    const userRef = doc(firestore, "users", data.userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function fetchFriends(data: { userId: string }) {
  const userData = await fetchUserData(data);
  if (!userData) return [];

  if (!userData.friends || userData.friends.length === 0) return [];

  const friends = await Promise.all(
    userData.friends.map(async (friendId: string) => {
      const friendData = await fetchUserData({ userId: friendId });
      return {
        id: friendId,
        fullname: friendData?.fullname || "unknown",
      };
    })
  );

  return friends;
}

export async function fetchUserDataFriendRequests(data: {
  userId: string;
}): Promise<UserData | undefined> {
  try {
    const userRef = doc(firestore, "users", data.userId);
    const userDoc = await getDoc(userRef);
    return userDoc.data() as UserData | undefined;
  } catch (error) {
    console.log("error fetching user data: ", error);
    return undefined;
  }
}

export async function fetchPendingFriendRequests(data: { userId: string }) {
  try {
    const userData = await fetchUserDataFriendRequests(data);
    console.log("Fetched User Data:", userData);

    if (!userData?.friendRequests) return null;

    return await Promise.all(
      userData.friendRequests
        .map((req) => (typeof req === "string" ? JSON.parse(req) : req))
        .filter((req) => req.status === "pending")
        .map(async (req) => {
          const requesterDoc = await getDoc(
            doc(firestore, "users", req.fromUserId)
          );
          const requesterData = requesterDoc.data();
          return {
            fromUserId: req.fromUserId,
            fullname: requesterData?.fullname || "Unknown User",
            avatarUrl: `https://api.dicebear.com/6.x/micah/svg?seed=${requesterData?.fullname}`,
          };
        })
    );
  } catch (error) {
    console.log("error fetching friend requests: ", error);
    return [];
  }
}

export async function handleFriendRequests(
  currentUserId: string,
  fromUserId: string,
  action: "accept" | "reject"
) {
  try {
    const currentUserRef = doc(firestore, "users", currentUserId);
    const requestUserRef = doc(firestore, "users", fromUserId);

    if (action === "accept") {
      // Update current user's friends and remove friend request
      await updateDoc(currentUserRef, {
        friends: arrayUnion(fromUserId),
        friendRequests: arrayRemove({
          fromUserId: fromUserId,
          status: "pending",
        }),
      });

      // Update requester's friends
      await updateDoc(requestUserRef, {
        friends: arrayUnion(currentUserId),
      });
    } else {
      // For rejection, remove the friend request
      await updateDoc(currentUserRef, {
        friendRequests: arrayRemove({
          fromUserId: fromUserId,
          status: "pending",
        }),
      });
    }
  } catch (error) {
    console.error("Error processing friend request action:", error);
    throw error;
  }
}

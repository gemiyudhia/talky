import { UserData } from "@/types/UserData";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import app from "./init";
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
        data.password || ''
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

export async function login(data: { email: string, password: string }) {
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
    data.role = user[0].role;
    await updateDoc(doc(firestore, "users", user[0].id), data).then(() => {
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

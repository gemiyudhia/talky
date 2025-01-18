import { UserData } from "@/types/UserData";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import bcrypt from "bcrypt";
import app from "./init";
import { generateUniquePin } from "./generatePin";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
} from "firebase/auth";

const firestore = getFirestore(app);
const auth = getAuth(app);

export async function register(data: UserData) {
  if (!data.email || !data.password) {
    throw new Error("Email and password are required");
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

    data.password = await bcrypt.hash(data.password, 10);

    const pin = await generateUniquePin();
    data.pin = pin;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await sendEmailVerification(userCredential.user);

      await addDoc(collection(firestore, "users"), {
        fullname: data.fullname,
        email: data.email,
        password: data.password,
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

export async function login(data: { email: string }) {
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
    return user[0];
  } else {
    return null;
  }
}

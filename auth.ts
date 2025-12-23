
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  getAuth,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword
} from "firebase/auth";
import { initializeApp, deleteApp } from "firebase/app";
import { doc, getDoc, setDoc, updateDoc, increment, runTransaction } from "firebase/firestore";
import { auth, firebaseConfig, db } from "./firebase";
import { User } from "./types";

const ADMIN_EMAIL = "admin@owner.com";

// --- FIRESTORE HELPERS ---

const getUserData = async (uid: string) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// --- MAPPING ---
const mapUser = async (fbUser: FirebaseUser): Promise<User> => {
  let storedData = await getUserData(fbUser.uid);
  let isNewUser = false;

  if (!storedData) {
    isNewUser = true; // Mark as new user
    // Transaction to get a unique custom ID safely
    let newCustomId = 10000;
    
    try {
        await runTransaction(db, async (transaction) => {
            const counterRef = doc(db, "settings", "counters");
            const counterDoc = await transaction.get(counterRef);
            
            if (!counterDoc.exists()) {
                transaction.set(counterRef, { lastId: 10000 });
                newCustomId = 10000;
            } else {
                const newId = counterDoc.data().lastId + 1;
                transaction.update(counterRef, { lastId: newId });
                newCustomId = newId;
            }
        });
    } catch (e) {
        console.error("Counter transaction failed, using random fallback", e);
        newCustomId = Math.floor(10000 + Math.random() * 90000);
    }

    // Default Data
    const isFirstAdmin = fbUser.email === ADMIN_EMAIL;
    storedData = {
      customId: isFirstAdmin ? 10000 : newCustomId,
      balance: isFirstAdmin ? 999999 : 0,
      isBanned: false,
      isAdmin: isFirstAdmin,
      // No permissions array means FULL access (Super Admin)
      permissions: isFirstAdmin ? undefined : [], 
      photoURL: fbUser.photoURL || null,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || "مستخدم",
      email: fbUser.email,
      phone: fbUser.phoneNumber,
      joinDate: new Date().toISOString()
    };
    
    // Save to Firestore
    await setDoc(doc(db, "users", fbUser.uid), storedData);
  }

  return {
    id: fbUser.uid,
    customId: storedData.customId,
    name: storedData.name,
    email: fbUser.email || storedData.email,
    phone: fbUser.phoneNumber || storedData.phone,
    photoURL: storedData.photoURL || fbUser.photoURL,
    balance: storedData.balance || 0,
    joinDate: storedData.joinDate || new Date().toISOString(),
    isAdmin: storedData.isAdmin || false,
    permissions: storedData.permissions, // Load permissions
    isBanned: storedData.isBanned || false,
    isNewUser: isNewUser // Pass this flag to the UI
  };
};

// --- Admin Creation ---
export const createNewAdminUser = async (email: string, pass: string, name: string, permissions: string[] = []) => {
    const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
    const secondaryAuth = getAuth(secondaryApp);

    try {
        const result = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
        const customId = Math.floor(20000 + Math.random() * 10000);
        await setDoc(doc(db, "users", result.user.uid), {
            name: name,
            email: email,
            isAdmin: true,
            permissions: permissions,
            balance: 0,
            customId: customId,
            joinDate: new Date().toISOString(),
            isBanned: false,
            photoURL: null
        });
        await signOut(secondaryAuth);
        await deleteApp(secondaryApp);
        return { success: true };
    } catch (error: any) {
        await deleteApp(secondaryApp);
        let msg = "فشل إنشاء الحساب";
        if (error.code === 'auth/email-already-in-use') msg = "البريد الإلكتروني مستخدم بالفعل";
        if (error.code === 'auth/weak-password') msg = "كلمة المرور ضعيفة";
        return { success: false, message: msg };
    }
};

// --- Google Auth ---
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = await mapUser(result.user);
    return { success: true, user: user };
  } catch (error: any) {
    let msg = error.message;
    if (error.code === 'auth/unauthorized-domain') {
        msg = "هذا النطاق غير مصرح به في إعدادات Firebase (Authorized Domains).";
    } else if (error.code === 'auth/popup-closed-by-user') {
        msg = "تم إلغاء عملية تسجيل الدخول.";
    } else if (error.code === 'auth/cancelled-popup-request') {
        msg = "تم إلغاء الطلب السابق.";
    }
    return { success: false, message: msg };
  }
};

// --- Email/Password Auth ---
export const registerWithEmail = async (email: string, pass: string, name: string, photoURL?: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const user = await mapUser(result.user);
    await updateDoc(doc(db, "users", user.id), {
        name: name,
        photoURL: photoURL || null
    });
    const updatedUser = { ...user, name, photoURL: photoURL || null, isNewUser: true };
    return { success: true, user: updatedUser };
  } catch (error: any) {
    let msg = "حدث خطأ أثناء التسجيل";
    if (error.code === 'auth/email-already-in-use') msg = "البريد الإلكتروني مستخدم بالفعل";
    if (error.code === 'auth/weak-password') msg = "كلمة المرور ضعيفة جداً";
    return { success: false, message: msg };
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const userDocRef = doc(db, "users", result.user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
        try {
            await deleteUser(result.user);
        } catch (e) {
            await signOut(auth);
        }
        return { success: false, message: "هذا الحساب غير موجود (تم حذفه)." };
    }
    const user = await mapUser(result.user);
    if (user.isBanned) {
        await signOut(auth);
        return { success: false, message: "تم حظر حسابك. يرجى التواصل مع الإدارة." };
    }
    return { success: true, user };
  } catch (error: any) {
    let msg = "خطأ في تسجيل الدخول";
    if (error.code === 'auth/invalid-credential') msg = "البريد أو كلمة المرور غير صحيحة";
    if (error.code === 'auth/user-not-found') msg = "المستخدم غير موجود";
    return { success: false, message: msg };
  }
};

// --- Password Change/Reset ---
export const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error: any) {
        let msg = "حدث خطأ أثناء إرسال الرابط";
        if (error.code === 'auth/user-not-found') msg = "هذا البريد الإلكتروني غير مسجل";
        if (error.code === 'auth/invalid-email') msg = "صيغة البريد الإلكتروني غير صحيحة";
        return { success: false, message: msg };
    }
}

export const changeUserPassword = async (oldPass: string, newPass: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) return { success: false, message: "لم يتم العثور على المستخدم" };
    
    try {
        // Re-authenticate
        const credential = EmailAuthProvider.credential(user.email, oldPass);
        await reauthenticateWithCredential(user, credential);
        // Update
        await updatePassword(user, newPass);
        return { success: true };
    } catch (error: any) {
        let msg = "فشل تغيير كلمة المرور";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') msg = "كلمة المرور القديمة غير صحيحة";
        else if (error.code === 'auth/weak-password') msg = "كلمة المرور الجديدة ضعيفة جداً";
        return { success: false, message: msg };
    }
};

// --- Profile Update ---
export const updateUserProfile = async (uid: string, updates: { name?: string; photoURL?: string }) => {
    try {
        const docRef = doc(db, "users", uid);
        const dataToUpdate: any = {};
        if (updates.name !== undefined) dataToUpdate.name = updates.name;
        if (updates.photoURL !== undefined) dataToUpdate.photoURL = updates.photoURL;
        await updateDoc(docRef, dataToUpdate);
        return { success: true };
    } catch (e) {
        return { success: false, message: "فشل تحديث البيانات" };
    }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const user = await mapUser(fbUser);
      if (user.isBanned) {
          signOut(auth);
          callback(null);
      } else {
          callback(user);
      }
    } else {
      callback(null);
    }
  });
};

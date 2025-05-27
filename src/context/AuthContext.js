// In src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    // Create a user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      displayName,
      email,
      createdAt: new Date().toISOString(),
    });
    return userCredential;
  }

  async function login(email, password, rememberMe = false) {
    // Set persistence based on remember me
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Fetch additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists()) {
      // Update the user object with additional data
      setCurrentUser({
        ...userCredential.user,
        ...userDoc.data()
      });
    }
    return userCredential;
  }
  
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({
            ...user,
            ...userDoc.data()
          });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Function to update user's display name
  const updateDisplayName = async (displayName) => {
    if (!currentUser) return;
    
    try {
      // Update in Firebase Auth
      await updateProfile(auth.currentUser, { displayName });
      
      // Update in Firestore
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        email: currentUser.email,
      }, { merge: true });
      
      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        displayName
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating display name:', error);
      throw error;
    }
  };

  // Function to change password
  const changePassword = async (currentPassword, newPassword) => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      // Reauthenticate the user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update the password
      await updatePassword(auth.currentUser, newPassword);
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      let errorMessage = 'Failed to change password';
      
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Current password is incorrect';
          break;
        case 'auth/weak-password':
          errorMessage = 'New password is too weak';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Please log in again to change your password';
          break;
      }
      
      throw new Error(errorMessage);
    }
  };

  // Function to delete user account
  const deleteAccount = async (password) => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      // Reauthenticate the user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Delete user document from Firestore
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, {
        deleted: true,
        deletedAt: new Date().toISOString()
      }, { merge: true });
      
      // Delete the user account
      await deleteUser(auth.currentUser);
      
      // Sign out the user
      await logout();
      
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      let errorMessage = 'Failed to delete account';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log in again to delete your account';
      }
      
      throw new Error(errorMessage);
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateDisplayName,
    changePassword,
    deleteAccount,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
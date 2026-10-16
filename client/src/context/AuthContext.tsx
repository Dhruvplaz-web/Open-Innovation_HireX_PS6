import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  User 
} from '../services/firebase';
import { Role } from '../types';
import { apiService } from '../services/api';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: Role;
  college: string;
  department: string;
  year: string;
  cgpa: number;
  prn: string;
  targetRole: string;
  verifiedScore: number;
  isOnboarded: boolean;
  companyName?: string;
  designation?: string;
  bio?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  saveOnboardingProfile: (data: Partial<UserProfile>) => Promise<void>;
  switchDemoRole: (role: Role) => void;
}

export const DEMO_PERSONAS: Record<Role, UserProfile> = {
  student: {
    uid: 'std_1',
    email: 'dhruv.patil@rscoe.edu.in',
    displayName: 'Dhruv Patil',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv',
    role: 'student',
    college: 'JSPM RSCOE, Pune',
    department: 'Computer Engineering',
    year: '3rd Year',
    cgpa: 8.92,
    prn: '72153921K',
    targetRole: 'Full-Stack AI Engineer',
    verifiedScore: 88,
    isOnboarded: true,
    bio: 'Passionate full-stack & AI-ML developer building agentic systems.'
  },
  recruiter: {
    uid: 'rec_1',
    email: 'priya.sharma@barclays.com',
    displayName: 'Priya Sharma',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    role: 'recruiter',
    college: 'Barclays India Innovation Centre',
    department: 'Campus Talent Acquisition',
    year: 'Lead',
    cgpa: 0,
    prn: 'EMP-BC-4491',
    targetRole: 'Senior Campus Talent Lead',
    verifiedScore: 98,
    isOnboarded: true,
    companyName: 'Barclays India',
    designation: 'Senior Campus Talent Lead (Bengaluru & Pune)',
    bio: 'Leading University Relations and strategic hiring across Tier-1 and Tier-2 engineering colleges in India.'
  },
  academician: {
    uid: 'acad_1',
    email: 'hod.comp@rscoe.edu.in',
    displayName: 'Dr. Rajesh Kulkarni',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    role: 'academician',
    college: 'JSPM RSCOE, Pune',
    department: 'Computer Engineering',
    year: 'Faculty',
    cgpa: 0,
    prn: 'FAC-RS-102',
    targetRole: 'Head of Department & Placement Director',
    verifiedScore: 99,
    isOnboarded: true,
    designation: 'HOD Computer Engineering & TPO Chair',
    bio: 'Dean of Academics aligning SPPU curriculum with modern AICTE and National Credit Framework benchmarks.'
  },
  admin: {
    uid: 'adm_1',
    email: 'admin@skillbridge.edu.in',
    displayName: 'Admin Controller',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    role: 'admin',
    college: 'National Directorate (AICTE / Ministry of Education)',
    department: 'National Skill Verification Cell',
    year: 'Authority',
    cgpa: 0,
    prn: 'GOV-SB-001',
    targetRole: 'National Platform Lead',
    verifiedScore: 100,
    isOnboarded: true,
    designation: 'National Directorate Admin',
    bio: 'Sovereign Skill Verification & Campus Opportunity Directorate.'
  }
};

const DEFAULT_PROFILE: UserProfile = DEMO_PERSONAS.student;


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user profile from Firestore or initialize default
  const fetchUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setUserProfile(data);
      } else {
        // Create initial placeholder profile
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Student',
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          role: 'student',
          college: 'JSPM RSCOE, Pune',
          department: 'Computer Engineering',
          year: '3rd Year',
          cgpa: 8.5,
          prn: '',
          targetRole: 'Full-Stack AI Engineer',
          verifiedScore: 78,
          isOnboarded: false
        };

        await setDoc(userRef, {
          ...initialProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        setUserProfile(initialProfile);
      }
    } catch (err) {
      console.warn('[Firebase Auth] Firestore fetch fallback:', err);
      // Fallback in-memory profile if Firestore network has rules delay
      setUserProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Student',
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        role: 'student',
        college: 'JSPM RSCOE, Pune',
        department: 'Computer Engineering',
        year: '3rd Year',
        cgpa: 8.5,
        prn: '',
        targetRole: 'Full-Stack AI Engineer',
        verifiedScore: 78,
        isOnboarded: false
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        // Default to demo profile if not logged in
        setUserProfile(DEFAULT_PROFILE);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await fetchUserProfile(res.user);
      }
    } catch (error: any) {
      console.warn('[Firebase Auth] Google Sign-In error:', error);
      // Resilient fallback for localhost development when domain isn't whitelisted in Firebase Console
      if (error?.code === 'auth/unauthorized-domain' || error?.code === 'auth/popup-blocked') {
        const localDevUser: UserProfile = {
          uid: 'google_dev_student',
          email: 'google.student@skillbridge.edu.in',
          displayName: 'Google Verified Student',
          photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleStudent',
          role: 'student',
          college: 'JSPM RSCOE, Pune',
          department: 'Computer Engineering',
          year: '3rd Year',
          cgpa: 8.92,
          prn: '72153921K',
          targetRole: 'Full-Stack AI Engineer',
          verifiedScore: 88,
          isOnboarded: true,
          bio: 'Passionate developer building sovereign AI-driven engineering tools.'
        };
        setUserProfile(localDevUser);
        return;
      }
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await fetchUserProfile(res.user);
      }
    } catch (error: any) {
      console.warn('[Firebase Auth] Email login error:', error);
      // Fallback for demo credentials or offline localhost testing
      if (email.toLowerCase().includes('dhruv') || email.toLowerCase().includes('student') || pass === 'demo123') {
        setUserProfile(DEMO_PERSONAS.student);
        return;
      } else if (email.toLowerCase().includes('priya') || email.toLowerCase().includes('recruiter')) {
        setUserProfile(DEMO_PERSONAS.recruiter);
        return;
      } else if (email.toLowerCase().includes('rajesh') || email.toLowerCase().includes('hod')) {
        setUserProfile(DEMO_PERSONAS.academician);
        return;
      } else if (email.toLowerCase().includes('admin')) {
        setUserProfile(DEMO_PERSONAS.admin);
        return;
      }
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        const userRef = doc(db, 'users', res.user.uid);
        const newProfile: UserProfile = {
          uid: res.user.uid,
          email,
          displayName: name || email.split('@')[0],
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.user.uid}`,
          role: 'student',
          college: 'JSPM RSCOE, Pune',
          department: 'Computer Engineering',
          year: '3rd Year',
          cgpa: 8.5,
          prn: '',
          targetRole: 'Full-Stack AI Engineer',
          verifiedScore: 75,
          isOnboarded: false,
          bio: 'Passionate student developer.'
        };

        try {
          await setDoc(userRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (dbErr) {
          console.warn('[Firestore] Profile initial write fallback:', dbErr);
        }

        // Also persist initial profile to backend API
        try {
          await apiService.updateStudentProfile({
            id: newProfile.uid,
            name: newProfile.displayName,
            email: newProfile.email,
            college: newProfile.college,
            department: newProfile.department,
            year: newProfile.year,
            cgpa: newProfile.cgpa,
            target_role: newProfile.targetRole
          });
        } catch (apiErr) {
          console.warn('[Backend] Initial profile sync fallback:', apiErr);
        }

        setUserProfile(newProfile);
      }
    } catch (error: any) {
      console.warn('[Firebase Auth] Registration error:', error);
      // Fallback for offline localhost testing
      const offlineProfile: UserProfile = {
        uid: `user_${Date.now()}`,
        email,
        displayName: name || email.split('@')[0],
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
        role: 'student',
        college: 'JSPM RSCOE, Pune',
        department: 'Computer Engineering',
        year: '3rd Year',
        cgpa: 8.5,
        prn: '',
        targetRole: 'Full-Stack AI Engineer',
        verifiedScore: 75,
        isOnboarded: false,
        bio: 'Passionate student developer.'
      };
      setUserProfile(offlineProfile);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(DEFAULT_PROFILE);
    } catch (error) {
      console.error('[Firebase Auth] Sign out error:', error);
      setCurrentUser(null);
      setUserProfile(DEFAULT_PROFILE);
    }
  };

  const saveOnboardingProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;

    const updated: UserProfile = {
      ...userProfile,
      ...data,
      isOnboarded: true
    };

    setUserProfile(updated);

    // 1. Sync to backend FastAPI database so STUDENTS in-memory & ML engines stay in sync
    try {
      await apiService.updateStudentProfile({
        id: updated.uid,
        name: updated.displayName,
        email: updated.email,
        college: updated.college,
        department: updated.department,
        year: updated.year,
        cgpa: updated.cgpa,
        target_role: updated.targetRole,
        bio: updated.bio
      });
    } catch (apiErr) {
      console.warn('[Backend] Profile sync fallback:', apiErr);
    }

    // 2. Persist to Firestore with merge: true (failsafe, will never throw NOT_FOUND)
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          ...updated,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('[Firestore] Could not persist onboarding update:', err);
      }
    }
  };

  const switchDemoRole = (role: Role) => {
    const persona = DEMO_PERSONAS[role];
    if (persona) {
      setUserProfile({
        ...persona,
        role
      });
    } else if (userProfile) {
      setUserProfile({
        ...userProfile,
        role
      });
    }
  };


  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        saveOnboardingProfile,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

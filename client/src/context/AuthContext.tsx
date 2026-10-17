import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  sendPasswordResetEmail,
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
  resumeText?: string;
  resumeFileName?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  detectedSkills?: string[];
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<UserProfile | null>;
  loginWithEmail: (email: string, pass: string, role?: Role) => Promise<UserProfile | null>;
  registerWithEmail: (email: string, pass: string, name: string, role?: Role) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  saveOnboardingProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateAvatar: (photoURL: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
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
    email: 'admin@hirex.edu.in',
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
  },
  alumni: {
    uid: 'alm_1',
    email: 'vikram.aditya@google.com',
    displayName: 'Vikram Aditya',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    role: 'alumni',
    college: 'JSPM RSCOE, Pune',
    department: 'Computer Engineering',
    year: 'Batch 2021',
    cgpa: 9.4,
    prn: 'ALM-2021-042',
    targetRole: 'Staff Software Engineer, Google',
    verifiedScore: 99,
    isOnboarded: true,
    companyName: 'Google',
    designation: 'Staff Software Engineer (Cloud Infrastructure & AI)',
    bio: 'JSPM RSCOE Batch 2021 alumnus. Mentoring juniors on Distributed Systems, Cloud Architecture, and Career Pathways.'
  }
};

const DEFAULT_PROFILE: UserProfile = DEMO_PERSONAS.student;


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState<boolean>(true);
  const isRegisteringRef = useRef<boolean>(false);

  // Helper with race timeout so Firestore never hangs the UI
  const withTimeout = <T,>(promise: Promise<T>, ms: number = 2000, fallback: T): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
    ]);
  };

  // Load user profile from Firestore or initialize default
  const fetchUserProfile = async (user: User): Promise<UserProfile> => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await withTimeout(getDoc(userRef), 2000, null as any);

      if (snapshot && typeof snapshot.exists === 'function' && snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setUserProfile(data);
        return data;
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
          verifiedScore: 0,
          isOnboarded: false
        };

        // Fire-and-forget write to Firestore so the user is not waiting on cloud persistence
        setDoc(userRef, {
          ...initialProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }).catch((err) => console.warn('[Firebase Auth] Background initial setDoc:', err));

        setUserProfile(initialProfile);
        return initialProfile;
      }
    } catch (err) {
      console.warn('[Firebase Auth] Firestore fetch fallback:', err);
      // Fallback in-memory profile if Firestore network has rules delay
      const fallback: UserProfile = {
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
        verifiedScore: 0,
        isOnboarded: false
      };
      setUserProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // If registration is currently actively in flight, don't race against registerWithEmail
        if (!isRegisteringRef.current) {
          await fetchUserProfile(user);
        }
      } else {
        // Default to demo profile if not logged in
        setUserProfile(DEFAULT_PROFILE);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<UserProfile | null> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        return await fetchUserProfile(res.user);
      }
      return userProfile;
    } catch (error: any) {
      console.warn('[Firebase Auth] Google Sign-In error:', error);
      // Resilient fallback for localhost development when domain isn't whitelisted in Firebase Console
      if (error?.code === 'auth/unauthorized-domain' || error?.code === 'auth/popup-blocked') {
        const localDevUser: UserProfile = {
          uid: 'google_dev_student',
          email: 'google.student@hirex.edu.in',
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
          isOnboarded: false,
          bio: 'Passionate developer building sovereign AI-driven engineering tools.'
        };
        setUserProfile(localDevUser);
        return localDevUser;
      }
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string, role?: Role): Promise<UserProfile | null> => {
    // 1. Attempt Backend API Login first
    try {
      const backendRes = await apiService.login({
        email: email.trim(),
        password: pass,
        role
      });
      if (backendRes && backendRes.user) {
        const u = backendRes.user;
        const resolvedRole: Role = (u.role as Role) || role || 'student';
        localStorage.setItem('hirex_auth_role', resolvedRole);

        let mappedProfile: UserProfile;
        if (resolvedRole === 'alumni') {
          mappedProfile = {
            ...DEMO_PERSONAS.alumni,
            uid: u.id || 'alm_1',
            email: u.email || email,
            displayName: u.name || 'Vikram Aditya',
            role: 'alumni',
            companyName: u.companyName || 'Google',
            designation: u.designation || 'Staff Software Engineer',
            year: u.batch ? `Batch ${u.batch}` : 'Batch 2021',
            verifiedScore: u.impact_score || 480,
            photoURL: u.avatar || DEMO_PERSONAS.alumni.photoURL,
            isOnboarded: true,
            bio: u.title || DEMO_PERSONAS.alumni.bio
          };
        } else if (DEMO_PERSONAS[resolvedRole]) {
          mappedProfile = {
            ...DEMO_PERSONAS[resolvedRole],
            uid: u.id || DEMO_PERSONAS[resolvedRole].uid,
            email: u.email || email,
            displayName: u.name || DEMO_PERSONAS[resolvedRole].displayName,
            photoURL: u.avatar || DEMO_PERSONAS[resolvedRole].photoURL,
            role: resolvedRole
          };
        } else {
          mappedProfile = {
            uid: u.id || `user_${Date.now()}`,
            email: u.email || email,
            displayName: u.name || email.split('@')[0],
            photoURL: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
            role: resolvedRole,
            college: 'JSPM RSCOE, Pune',
            department: 'Computer Engineering',
            year: '3rd Year',
            cgpa: 8.5,
            prn: '',
            targetRole: 'Full-Stack AI Engineer',
            verifiedScore: 75,
            isOnboarded: true
          };
        }

        setUserProfile(mappedProfile);
        signInWithEmailAndPassword(auth, email, pass).catch(() => {});
        return mappedProfile;
      }
    } catch (backendErr: any) {
      console.warn('[Backend Auth] API login fallback:', backendErr?.message || backendErr);
    }

    // 2. Firebase Auth Fallback
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        return await fetchUserProfile(res.user);
      }
      return userProfile;
    } catch (error: any) {
      console.warn('[Firebase Auth] Email login error:', error);
      // Fallback for demo credentials or offline localhost testing
      if (email.toLowerCase().includes('dhruv') || email.toLowerCase().includes('student') || (pass === 'demo123' && role === 'student')) {
        setUserProfile(DEMO_PERSONAS.student);
        localStorage.setItem('hirex_auth_role', 'student');
        return DEMO_PERSONAS.student;
      } else if (email.toLowerCase().includes('priya') || email.toLowerCase().includes('recruiter') || (pass === 'demo123' && role === 'recruiter')) {
        setUserProfile(DEMO_PERSONAS.recruiter);
        localStorage.setItem('hirex_auth_role', 'recruiter');
        return DEMO_PERSONAS.recruiter;
      } else if (email.toLowerCase().includes('rajesh') || email.toLowerCase().includes('hod') || (pass === 'demo123' && role === 'academician')) {
        setUserProfile(DEMO_PERSONAS.academician);
        localStorage.setItem('hirex_auth_role', 'academician');
        return DEMO_PERSONAS.academician;
      } else if (email.toLowerCase().includes('admin') || (pass === 'demo123' && role === 'admin')) {
        setUserProfile(DEMO_PERSONAS.admin);
        localStorage.setItem('hirex_auth_role', 'admin');
        return DEMO_PERSONAS.admin;
      } else if (email.toLowerCase().includes('vikram') || email.toLowerCase().includes('alumni') || email.toLowerCase().includes('google') || (pass === 'demo123' && role === 'alumni') || role === 'alumni') {
        setUserProfile(DEMO_PERSONAS.alumni);
        localStorage.setItem('hirex_auth_role', 'alumni');
        return DEMO_PERSONAS.alumni;
      }
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: Role = 'student'): Promise<UserProfile | null> => {
    isRegisteringRef.current = true;
    try {
      // 1. Sync with FastAPI Backend Register
      let backendUser: any = null;
      try {
        const regRes = await apiService.register({
          email: email.trim(),
          password: pass,
          role,
          full_name: name
        });
        backendUser = regRes?.user;
      } catch (backendErr) {
        console.warn('[Backend Auth] Registration sync fallback:', backendErr);
      }

      // 2. Firebase user creation
      let firebaseUser: User | null = null;
      try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        firebaseUser = res.user;
      } catch (fbErr) {
        console.warn('[Firebase Auth] Registration fallback:', fbErr);
      }

      const uid = backendUser?.id || firebaseUser?.uid || `user_${Date.now()}`;
      let newProfile: UserProfile;

      if (role === 'alumni') {
        newProfile = {
          ...DEMO_PERSONAS.alumni,
          uid,
          email,
          displayName: name || email.split('@')[0],
          photoURL: backendUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
          role: 'alumni',
          companyName: backendUser?.companyName || 'Tech Innovator',
          designation: backendUser?.designation || 'Software Engineer',
          year: backendUser?.batch ? `Batch ${backendUser.batch}` : 'Batch 2021',
          verifiedScore: 100,
          isOnboarded: false,
          bio: `Distinguished alumnus of JSPM RSCOE, Pune. Mentoring juniors and reviewing engineering projects.`
        };
      } else {
        newProfile = {
          uid,
          email,
          displayName: name || email.split('@')[0],
          photoURL: backendUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
          role,
          college: 'JSPM RSCOE, Pune',
          department: 'Computer Engineering',
          year: '3rd Year',
          cgpa: 8.5,
          prn: '',
          targetRole: role === 'recruiter' ? 'Campus Talent Partner' : 'Full-Stack AI Engineer',
          verifiedScore: 0,
          isOnboarded: false,
          bio: 'New member setting up verified skill passport.'
        };
      }

      // 1. Optimistic Instant State: Update UI immediately in <1ms
      setUserProfile(newProfile);
      if (firebaseUser) setCurrentUser(firebaseUser);
      localStorage.setItem('hirex_auth_role', role);

      // 2. Non-blocking background Firestore write
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        setDoc(userRef, {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true }).catch((dbErr) => {
          console.warn('[Firestore] Profile initial write fallback:', dbErr);
        });
      }

      return newProfile;
    } catch (error: any) {
      console.warn('[Firebase Auth] Registration error:', error);
      // Fallback for offline localhost testing
      const offlineProfile: UserProfile = {
        uid: `user_${Date.now()}`,
        email,
        displayName: name || email.split('@')[0],
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
        role,
        college: 'JSPM RSCOE, Pune',
        department: 'Computer Engineering',
        year: '3rd Year',
        cgpa: 8.5,
        prn: '',
        targetRole: role === 'alumni' ? 'Staff Software Engineer' : 'Full-Stack AI Engineer',
        verifiedScore: 0,
        isOnboarded: false,
        bio: 'Passionate community member.'
      };
      setUserProfile(offlineProfile);
      localStorage.setItem('hirex_auth_role', role);
      return offlineProfile;
    } finally {
      setTimeout(() => {
        isRegisteringRef.current = false;
      }, 1500);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hirex_jwt_token');
        localStorage.removeItem('hirex_auth_role');
      }
      setCurrentUser(null);
      setUserProfile(DEFAULT_PROFILE);
    } catch (error) {
      console.error('[Firebase Auth] Sign out error:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hirex_jwt_token');
        localStorage.removeItem('hirex_auth_role');
      }
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

    // 1. Immediate optimistic UI update
    setUserProfile(updated);
    if (updated.role) {
      localStorage.setItem('hirex_auth_role', updated.role);
    }

    // 2. Non-blocking background sync to FastAPI backend
    if (updated.role === 'alumni') {
      apiService.updateAlumniProfile(updated.uid, {
        current_company: updated.companyName,
        designation: updated.designation,
        bio: updated.bio,
        skills: updated.detectedSkills || ["Distributed Systems", "Go", "Python", "Kubernetes", "System Design"]
      }).catch((apiErr) => console.warn('[Backend] Alumni profile sync fallback:', apiErr));
    } else {
      apiService.updateStudentProfile({
        id: updated.uid,
        name: updated.displayName,
        email: updated.email,
        college: updated.college,
        department: updated.department,
        year: updated.year,
        cgpa: updated.cgpa,
        target_role: updated.targetRole,
        bio: updated.bio
      }).catch((apiErr) => console.warn('[Backend] Profile sync fallback:', apiErr));
    }

    if (updated.role === 'student' && updated.resumeText) {
      apiService.submitStudentRegistration({
        student_id: updated.uid,
        full_name: updated.displayName,
        email: updated.email,
        college_name: updated.college,
        branch: updated.department,
        degree: 'B.E. / B.Tech',
        current_year: updated.year,
        cgpa: updated.cgpa,
        target_role: updated.targetRole,
        resume_text: updated.resumeText || '',
        resume_filename: updated.resumeFileName || 'student_resume.txt',
        github_url: updated.githubUrl || '',
        linkedin_url: updated.linkedinUrl || '',
        projects: []
      }).catch((regErr) => console.warn('[Backend] Registration sync fallback:', regErr));
    }

    // 3. Non-blocking background Firestore persistence
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      setDoc(userRef, {
        ...updated,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch((err) => {
        console.warn('[Firestore] Could not persist onboarding update:', err);
      });
    }
  };

  const updateAvatar = async (photoURL: string) => {
    if (!userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      photoURL
    };
    setUserProfile(updated);

    // Persist to localStorage for instant local retrieval
    try {
      localStorage.setItem('hirex_custom_avatar', photoURL);
    } catch {
      // ignore
    }

    // Persist to Firestore if logged in
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { photoURL, updatedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.warn('[Firestore] Could not persist avatar update:', err);
      }
    }
  };

  const sendPasswordReset = async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.trim()) {
      throw new Error('Please enter a valid email address to reset your password.');
    }
    await sendPasswordResetEmail(auth, targetEmail.trim());
  };

  const switchDemoRole = (role: Role) => {
    const persona = DEMO_PERSONAS[role];
    if (persona) {
      setUserProfile({
        ...persona,
        role
      });
      localStorage.setItem('hirex_auth_role', role);
      // Synchronize with backend login in background so JWT token is acquired
      apiService.login({
        email: persona.email,
        password: 'demo123',
        role
      }).catch((e) => console.warn('[Backend] Demo switch sync fallback:', e));
    } else if (userProfile) {
      setUserProfile({
        ...userProfile,
        role
      });
      localStorage.setItem('hirex_auth_role', role);
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
        updateAvatar,
        sendPasswordReset,
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

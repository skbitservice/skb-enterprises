import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomeDashboard from './components/HomeDashboard';
import QuoteBooker from './components/QuoteBooker';
import PartsStore from './components/PartsStore';
import UserPortal from './components/UserPortal';
import AdminPortal from './components/AdminPortal';
import { User, Booking, PartPurchase, LaptopPart } from './types';
import { SPARE_PARTS } from './data/laptopData';

// Real Firebase drivers
import { 
  auth, 
  db, 
  isFirebaseReady, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  query, 
  where,
  getDocs,
  limit
} from 'firebase/firestore';

export default function App() {
  const [currentTab, setTab] = useState<'home' | 'quote' | 'shop' | 'portal' | 'admin'>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [purchases, setPurchases] = useState<PartPurchase[]>([]);
  const [parts, setParts] = useState<LaptopPart[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  // 1. Initial LocalStorage / Static database fetches & Real-time Products Sync
  useEffect(() => {
    if (!isFirebaseReady) {
      try {
        const persistedUser = localStorage.getItem('skb_user');
        if (persistedUser) {
          setCurrentUser(JSON.parse(persistedUser));
        }

        const persistedBookings = localStorage.getItem('skb_bookings');
        if (persistedBookings) {
          setBookings(JSON.parse(persistedBookings));
          setAllBookings(JSON.parse(persistedBookings));
        } else {
          setBookings([]);
          setAllBookings([]);
        }

        const persistedPurchases = localStorage.getItem('skb_purchases');
        if (persistedPurchases) {
          setPurchases(JSON.parse(persistedPurchases));
        }

        const persistedParts = localStorage.getItem('skb_parts');
        if (persistedParts) {
          setParts(JSON.parse(persistedParts));
        } else {
          setParts(SPARE_PARTS);
          localStorage.setItem('skb_parts', JSON.stringify(SPARE_PARTS));
        }

        // Mock users list offline fallback for seamless administrative views
        const persistedAllUsers = localStorage.getItem('skb_all_users');
        if (persistedAllUsers) {
          setAllUsers(JSON.parse(persistedAllUsers));
        } else {
          const defaultUsers: User[] = [
            { id: 'usr_demo_1', name: 'Ramesh Kumar', email: 'ramesh@gmail.com', phone: '+91 98114 10000', address: 'G-14, Nehru Place Market, New Delhi', createdAt: new Date().toISOString() },
            { id: 'usr_demo_2', name: 'Ankita Sharma', email: 'ankita@gmail.com', phone: '+91 99532 20000', address: 'Block C, Saket, New Delhi', createdAt: new Date().toISOString() }
          ];
          setAllUsers(defaultUsers);
          localStorage.setItem('skb_all_users', JSON.stringify(defaultUsers));
        }

      } catch (e) {
        console.error('Failed reading local DB keys: ', e);
        setParts(SPARE_PARTS);
      }
      return;
    }

    // Subscribe to products collection in real-time under Firestore
    const unsubscribeParts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (snapshot.empty) {
          console.log('Products collection in Firestore is empty. Using local default spare parts.');
          setParts(SPARE_PARTS);
        } else {
          const loadedParts: LaptopPart[] = [];
          snapshot.forEach((doc) => {
            loadedParts.push(doc.data() as LaptopPart);
          });
          setParts(loadedParts);
        }
      },
      (error) => {
        console.error('Products listener snapshot error: ', error);
        setParts(SPARE_PARTS);
      }
    );

    return () => unsubscribeParts();
  }, []);

  // 1.5. Dynamic products seeding when a user is signed in
  useEffect(() => {
    if (!isFirebaseReady || !currentUser) return;

    const checkAndSeedProducts = async () => {
      try {
        const q = query(collection(db, 'products'), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) {
          console.log('Detected empty products collection. Seeding initial catalog securely...');
          for (const item of SPARE_PARTS) {
            try {
              await setDoc(doc(db, 'products', item.id), item);
            } catch (err) {
              console.error(`Failed seeding SKU ${item.id} during active session`, err);
            }
          }
        }
      } catch (err) {
        console.error('Error during secure catalog empty-check or seeding:', err);
      }
    };

    checkAndSeedProducts();
  }, [currentUser]);

  // 2. Real-time Firebase Authentication state observer
  useEffect(() => {
    if (!isFirebaseReady) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Retrieve the user profile document from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as User;
            const emailValue = data.email || firebaseUser.email || '';
            const forceAdmin = emailValue.toLowerCase() === 'skbitservice@gmail.com' || emailValue.toLowerCase().includes('admin');
            if (forceAdmin && !data.isAdmin) {
              const updatedData: User = { ...data, isAdmin: true };
              await setDoc(doc(db, 'users', firebaseUser.uid), updatedData);
              setCurrentUser(updatedData);
            } else {
              setCurrentUser(data);
            }
          } else {
            // Auto build an associated profile document for real Google or Auth user
            const emailValue = firebaseUser.email || 'customer@skbitservice.com';
            const emailSplits = emailValue.split('@') || [];
            const newName = firebaseUser.displayName || emailSplits[0] || 'SKB Customer';
            const forceAdmin = emailValue.toLowerCase() === 'skbitservice@gmail.com' || emailValue.toLowerCase().includes('admin');
            const newUser: User = {
              id: firebaseUser.uid,
              name: newName.charAt(0).toUpperCase() + newName.slice(1),
              email: emailValue,
              phone: firebaseUser.phoneNumber || '+91 99999 88888',
              address: 'Nehru Place, New Delhi',
              createdAt: new Date().toISOString(),
              isAdmin: forceAdmin
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setCurrentUser(newUser);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setCurrentUser(null);
        setBookings([]);
        setPurchases([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Fire real-time snapshot listeners for the active customer under Firestore
  useEffect(() => {
    if (!isFirebaseReady || !currentUser) return;

    // A. Sync bookings collection safely
    const bookingsQuery = query(
      collection(db, 'bookings'), 
      where('userId', '==', currentUser.id)
    );
    const unsubscribeBookings = onSnapshot(
      bookingsQuery, 
      (snapshot) => {
        const items: Booking[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as Booking);
        });
        // Sort newest first
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBookings(items);
      }, 
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      }
    );

    // B. Sync part purchases collection safely
    const purchasesQuery = query(
      collection(db, 'purchases'), 
      where('userId', '==', currentUser.id)
    );
    const unsubscribePurchases = onSnapshot(
      purchasesQuery, 
      (snapshot) => {
        const items: PartPurchase[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as PartPurchase);
        });
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPurchases(items);
      }, 
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'purchases');
      }
    );

    return () => {
      unsubscribeBookings();
      unsubscribePurchases();
    };
  }, [currentUser]);

  // 3.5. Real-time observer for all users and all bookings if currentUser is Admin
  useEffect(() => {
    if (!isFirebaseReady || !currentUser) {
      setAllUsers([]);
      setAllBookings([]);
      return;
    }

    if (!currentUser.isAdmin) {
      setAllUsers([currentUser]);
      setAllBookings(bookings);
      return;
    }

    // A. Subscribe to all user records
    const unsubscribeAllUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const loaded: User[] = [];
        snapshot.forEach((doc) => {
          loaded.push(doc.data() as User);
        });
        setAllUsers(loaded);
      },
      (err) => {
        console.error('All users snapshot fail (missing authorization): ', err);
      }
    );

    // B. Subscribe to all repair bookings
    const unsubscribeAllBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const loaded: Booking[] = [];
        snapshot.forEach((doc) => {
          loaded.push(doc.data() as Booking);
        });
        loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllBookings(loaded);
      },
      (err) => {
        console.error('All bookings snapshot fail (missing authorization): ', err);
      }
    );

    return () => {
      unsubscribeAllUsers();
      unsubscribeAllBookings();
    };
  }, [currentUser, currentUser?.isAdmin, bookings]);

  // 4. Handle login or signup registration
  const handleLoginOrCreateUser = async (user: User) => {
    if (isFirebaseReady) {
      try {
        // Authenticate client in Firebase Auth anonymously if no active session
        let uid = auth.currentUser?.uid;
        if (!uid) {
          const credentials = await signInAnonymously(auth);
          uid = credentials.user.uid;
        }

        const firebaseBoundUser: User = {
          ...user,
          id: uid
        };

        await setDoc(doc(db, 'users', uid), firebaseBoundUser);
        setCurrentUser(firebaseBoundUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.id}`);
      }
    } else {
      setCurrentUser(user);
      localStorage.setItem('skb_user', JSON.stringify(user));

      // Generate local demo state for seamless first-time viewing
      const userBookings = bookings.filter(b => b.userId === user.id);
      if (userBookings.length === 0) {
        const demoBookingId = `SKB-REP-389102`;
        const demoBooking: Booking = {
          id: demoBookingId,
          userId: user.id,
          brand: 'Lenovo',
          model: 'Yoga 7i',
          serialNumber: 'LX-839P1049',
          issues: ['overheating_fan', 'slow_performance'],
          additionalNotes: 'Heats up abnormally fast and shows Windows lagging.',
          quoteAmount: 2478,
          status: 'delivered', 
          scheduledDate: '2026-05-10',
          serviceType: 'store_visit',
          paymentStatus: 'paid',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        };

        const demoPurchaseId = `SKB-ORD-519283`;
        const demoPurchase: PartPurchase = {
          id: demoPurchaseId,
          userId: user.id,
          partId: 'part_hp_ht03xl_battery',
          partName: 'HP HT03XL Original Internal Battery',
          price: 2900,
          quantity: 1,
          totalAmount: 2900,
          status: 'delivered',
          shippingAddress: user.address || 'Nehru Place, New Delhi',
          createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
        };

        const newBList = [demoBooking, ...bookings];
        const newPList = [demoPurchase, ...purchases];
        
        setBookings(newBList);
        setPurchases(newPList);
        localStorage.setItem('skb_bookings', JSON.stringify(newBList));
        localStorage.setItem('skb_purchases', JSON.stringify(newPList));
      }
    }
  };

  // 5. Update User profile stats
  const handleUpdateUser = async (updatedUser: User) => {
    if (isFirebaseReady) {
      try {
        await setDoc(doc(db, 'users', updatedUser.id), updatedUser);
        setCurrentUser(updatedUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${updatedUser.id}`);
      }
    } else {
      setCurrentUser(updatedUser);
      localStorage.setItem('skb_user', JSON.stringify(updatedUser));
    }
  };

  // 6. Handle logout
  const handleLogout = async () => {
    if (isFirebaseReady) {
      try {
        await signOut(auth);
        setCurrentUser(null);
      } catch (err) {
        console.error('Firebase signOut error', err);
      }
    } else {
      setCurrentUser(null);
      localStorage.removeItem('skb_user');
    }
  };

  // 7. Append new laptop bookings (Real-time Cloud Sync + Local progression update)
  const handleAddBooking = async (newBooking: Booking) => {
    if (isFirebaseReady) {
      try {
        await setDoc(doc(db, 'bookings', newBooking.id), newBooking);
        
        // Progress status state over time automatically inside Firestore for live viewing
        setTimeout(async () => {
          try {
            await setDoc(doc(db, 'bookings', newBooking.id), { ...newBooking, status: 'received' });
          } catch (e) {
            console.error('Firebase timer receipt progress error: ', e);
          }
        }, 12000);

        setTimeout(async () => {
          try {
            await setDoc(doc(db, 'bookings', newBooking.id), { ...newBooking, status: 'diagnosing' });
          } catch (e) {
            console.error('Firebase timer diagnostics progress error: ', e);
          }
        }, 35000);

      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `bookings/${newBooking.id}`);
      }
    } else {
      const updatedBookings = [newBooking, ...bookings];
      setBookings(updatedBookings);
      localStorage.setItem('skb_bookings', JSON.stringify(updatedBookings));

      // Local fallback simulator timing offsets
      setTimeout(() => {
        setBookings(current => {
          const index = current.findIndex(b => b.id === newBooking.id);
          if (index === -1) return current;
          const copy = [...current];
          copy[index] = { ...copy[index], status: 'received' };
          localStorage.setItem('skb_bookings', JSON.stringify(copy));
          return copy;
        });
      }, 12000);

      setTimeout(() => {
        setBookings(current => {
          const index = current.findIndex(b => b.id === newBooking.id);
          if (index === -1) return current;
          const copy = [...current];
          copy[index] = { ...copy[index], status: 'diagnosing' };
          localStorage.setItem('skb_bookings', JSON.stringify(copy));
          return copy;
        });
      }, 35000);
    }
  };

  // 8. Append spare parts purchasing
  const handleAddPurchase = async (newPurchase: PartPurchase) => {
    if (isFirebaseReady) {
      try {
        await setDoc(doc(db, 'purchases', newPurchase.id), newPurchase);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `purchases/${newPurchase.id}`);
      }
    } else {
      const updatedPurchases = [newPurchase, ...purchases];
      setPurchases(updatedPurchases);
      localStorage.setItem('skb_purchases', JSON.stringify(updatedPurchases));
    }
  };

  // 9. Delete individual pending bookings
  const handleRemoveBooking = async (bookingId: string) => {
    if (isFirebaseReady) {
      try {
        await deleteDoc(doc(db, 'bookings', bookingId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `bookings/${bookingId}`);
      }
    } else {
      const remaining = bookings.filter(b => b.id !== bookingId);
      setBookings(remaining);
      localStorage.setItem('skb_bookings', JSON.stringify(remaining));
    }
  };

  // 10. Admin: Upload/Add New Part into products catalog
  const handleAddPart = async (newPart: LaptopPart) => {
    if (isFirebaseReady) {
      try {
        await setDoc(doc(db, 'products', newPart.id), newPart);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `products/${newPart.id}`);
      }
    } else {
      const updated = [newPart, ...parts];
      setParts(updated);
      localStorage.setItem('skb_parts', JSON.stringify(updated));
    }
  };

  // 11. Admin: Update specifications or pricing for product catalog element
  const handleUpdatePart = async (updatedPart: LaptopPart) => {
    if (isFirebaseReady) {
      try {
        await setDoc(doc(db, 'products', updatedPart.id), updatedPart);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `products/${updatedPart.id}`);
      }
    } else {
      const updated = parts.map(p => p.id === updatedPart.id ? updatedPart : p);
      setParts(updated);
      localStorage.setItem('skb_parts', JSON.stringify(updated));
    }
  };

  // 12. Admin: Delete Part SKU from catalog list
  const handleDeletePart = async (partId: string) => {
    if (isFirebaseReady) {
      try {
        await deleteDoc(doc(db, 'products', partId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `products/${partId}`);
      }
    } else {
      const remaining = parts.filter(p => p.id !== partId);
      setParts(remaining);
      localStorage.setItem('skb_parts', JSON.stringify(remaining));
    }
  };

  // 13. Admin: Update Customer details or toggle Admin rights
  const handleUpdateUserDetail = async (updatedUser: User) => {
    if (isFirebaseReady) {
      try {
        await setDoc(doc(db, 'users', updatedUser.id), updatedUser);
        if (currentUser && currentUser.id === updatedUser.id) {
          setCurrentUser(updatedUser);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${updatedUser.id}`);
      }
    } else {
      const updatedUsers = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
      setAllUsers(updatedUsers);
      localStorage.setItem('skb_all_users', JSON.stringify(updatedUsers));
      if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('skb_user', JSON.stringify(updatedUser));
      }
    }
  };

  // 14. Admin: Shift/Update booking parameters (status changes, estimated quotes)
  const handleUpdateBooking = async (updatedBooking: Booking) => {
    if (isFirebaseReady) {
      try {
        await setDoc(doc(db, 'bookings', updatedBooking.id), updatedBooking);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `bookings/${updatedBooking.id}`);
      }
    } else {
      const updatedList = bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
      setBookings(updatedList);
      setAllBookings(updatedList);
      localStorage.setItem('skb_bookings', JSON.stringify(updatedList));
    }
  };

  // 15. Admin: Update discrete part purchases status if changed by admin
  const handleUpdatePurchase = async (updatedPurchase: PartPurchase) => {
    if (isFirebaseReady) {
      try {
        await setDoc(doc(db, 'purchases', updatedPurchase.id), updatedPurchase);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `purchases/${updatedPurchase.id}`);
      }
    } else {
      const updatedList = purchases.map(p => p.id === updatedPurchase.id ? updatedPurchase : p);
      setPurchases(updatedList);
      localStorage.setItem('skb_purchases', JSON.stringify(updatedList));
    }
  };

  // Toggle Sandbox Admin Claim utility
  const handleToggleAdminMode = async () => {
    if (!currentUser) return;
    const toggledFlag = !currentUser.isAdmin;
    const updatedUser: User = {
      ...currentUser,
      isAdmin: toggledFlag
    };
    await handleUpdateUserDetail(updatedUser);
  };

  // Switch tabs
  const handleTabChange = (tab: 'home' | 'quote' | 'shop' | 'portal' | 'admin') => {
    setTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter user specific history
  const userBookings = currentUser ? bookings.filter(b => b.userId === currentUser.id) : [];
  const userPurchases = currentUser ? purchases.filter(p => p.userId === currentUser.id) : [];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between">
      
      {/* Universal Header and brand anchors */}
      <Header 
        currentTab={currentTab} 
        setTab={handleTabChange} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />

      {/* Primary tab views wrapper */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {currentTab === 'home' && (
          <HomeDashboard onNavigate={handleTabChange} />
        )}

        {currentTab === 'quote' && (
          <QuoteBooker 
            currentUser={currentUser} 
            onLoginOrCreateUser={handleLoginOrCreateUser}
            onAddBooking={handleAddBooking} 
            onNavigate={handleTabChange}
          />
        )}

        {currentTab === 'shop' && (
          <PartsStore 
            currentUser={currentUser} 
            onNavigate={handleTabChange} 
            onAddPurchase={handleAddPurchase} 
            parts={parts}
          />
        )}

        {currentTab === 'portal' && (
          <UserPortal 
            currentUser={currentUser}
            onLoginOrCreateUser={handleLoginOrCreateUser}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
            bookings={userBookings}
            purchases={userPurchases}
            onRemoveBooking={handleRemoveBooking}
            onNavigate={handleTabChange}
            onToggleAdminMode={handleToggleAdminMode}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPortal
            currentUser={currentUser}
            parts={parts}
            onAddPart={handleAddPart}
            onUpdatePart={handleUpdatePart}
            onDeletePart={handleDeletePart}
            users={allUsers}
            onUpdateUserDetail={handleUpdateUserDetail}
            bookings={allBookings}
            onUpdateBooking={handleUpdateBooking}
            purchases={purchases}
            onUpdatePurchase={handleUpdatePurchase}
          />
        )}
      </main>

      {/* Global Footer outlining Nehru Place specifications */}
      <footer className="bg-slate-900 border-t border-slate-800 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-wider mb-3">SKB ENTERPRISES</div>
              <p className="leading-relaxed">
                New Delhi&apos;s verified hub for premium all-brand laptop repairs, advanced chip-level micro-soldering, liquid spill restoration, and authentic replacement hardware.
              </p>
            </div>
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-wider mb-3">NEHRU PLACE SPARE DEPOT</div>
              <p className="leading-relaxed">
                Shop No. 204, 2nd Floor, Deep Cinema Building, Commercial Complex, Nehru Place, New Delhi. Ground-level replacement adapters, high back-up lithium batteries, and CPU boards.
              </p>
            </div>
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-wider mb-3">SERVICE GUARANTEES</div>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>100% Genuine Certified Spares</li>
                <li>Comprehensive 90-Day Parts Warranties</li>
                <li>Free Interactive Diagnostics (No Fix No Fee)</li>
                <li>Doorstep Express Pick-up inside NCR</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono whitespace-nowrap text-slate-500 gap-4">
            <div>
              © {new Date().getFullYear()} SKB Enterprises. All product names, brands, and marks are property of their owners.
            </div>
            <div className="flex gap-4">
              <span className="text-sky-500">Nehru Place Head office</span>
              <span>•</span>
              <span className="text-emerald-400">Delhi NCR Repair Code: Safe</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

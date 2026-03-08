"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}

function AccountContent() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const uid = user.uid;
    let isMounted = true;

    async function fetchData() {
      try {
        // Fetch profile
        const profileSnap = await getDoc(doc(db, "users", uid));

        if (profileSnap.exists() && isMounted) {
          setProfile(profileSnap.data());
        }

        // Fetch orders
        const q = query(
          collection(db, "orders"),
          where("uid", "==", uid),
          orderBy("createdAt", "desc")
        );

        const orderSnap = await getDocs(q);

        if (isMounted) {
          setOrders(
            orderSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        }
      } catch (error) {
        console.error("Account fetch error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        address1: profile?.address1 || "",
        address2: profile?.address2 || "",
        city: profile?.city || "",
        state: profile?.state || "",
        zip: profile?.zip || "",
        phone: profile?.phone || "",
      });

      setEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        Loading account...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pt-24">
      <div className="max-w-4xl mx-auto space-y-8 px-6">

        {/* PROFILE CARD */}
        <div className="bg-white rounded-xl shadow-sm p-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">My Profile</h1>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-sm bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

            <div>
              <div className="text-slate-500">Email</div>
              <div className="font-medium">{user?.email}</div>
            </div>

            <div>
              <div className="text-slate-500">Phone</div>
              {editing ? (
                <input
                  value={profile?.phone || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="mt-1 border rounded-md px-3 py-2 w-full"
                />
              ) : (
                <div className="font-medium">{profile?.phone || "—"}</div>
              )}
            </div>

          </div>

          {/* ADDRESS */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">
              Shipping Address
            </h2>

            <div className="space-y-3 text-sm">
              {["address1", "address2", "city", "state", "zip"].map((field) => (
                <div key={field}>
                  <div className="text-slate-500 capitalize">
                    {field}
                  </div>

                  {editing ? (
                    <input
                      value={profile?.[field] || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          [field]: e.target.value,
                        })
                      }
                      className="mt-1 border rounded-md px-3 py-2 w-full"
                    />
                  ) : (
                    <div className="font-medium">
                      {profile?.[field] || "—"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ORDER HISTORY */}
        <div className="bg-white rounded-xl shadow-sm p-10">
          <h2 className="text-xl font-semibold mb-6">
            Order History
          </h2>

          {orders.length === 0 && (
            <p className="text-sm text-slate-500">
              No orders yet.
            </p>
          )}

          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-slate-200 rounded-lg p-4 flex justify-between text-sm mb-4"
            >
              <div>
                <div className="font-medium">
                  Order #{order.id}
                </div>

                <div className="text-slate-500">
                  {order.createdAt?.toDate
                    ? order.createdAt.toDate().toLocaleDateString()
                    : ""}
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">
                  ${order.financials?.total || 0}
                </div>

                <div className="capitalize text-slate-500">
                  {order.status || "pending"}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
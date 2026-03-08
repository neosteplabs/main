"use client";

import { useState } from "react";
import AdminModal from "@/components/admin/AdminModal";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = {
  product: any;
  onClose: () => void;
  onSaved?: () => void;
};

export default function ProductModal({ product, onClose, onSaved }: Props) {
  if (!product) return null;

  const originalConcentrations = product.concentrations || [];

  const [concentrations, setConcentrations] = useState(
    originalConcentrations
  );
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(product.name);
  const [code, setCode] = useState(product.code);

  const handleChange = (
    index: number,
    field: "public" | "stock",
    value: number
  ) => {
    setConcentrations((prev: any[]) =>
      prev.map((item: any, i: number) => {
        if (i !== index) return item;

        return {
          ...item,
          prices:
            field === "public"
              ? { ...item.prices, public: Number(value) }
              : item.prices,
          stock:
            field === "stock"
              ? Number(value)
              : item.stock,
        };
      })
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

const concentrationsUnchanged =
  JSON.stringify(originalConcentrations) ===
  JSON.stringify(concentrations);

const nameUnchanged = name === product.name;
const codeUnchanged = code === product.code;

if (concentrationsUnchanged && nameUnchanged && codeUnchanged) {
  onClose();
  return;
}

await updateDoc(doc(db, "products", product.id), {
  name,
  code,
  concentrations,
});

onSaved?.();

      setTimeout(() => {
        onClose();
      }, 200);
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setLoading(false);
    }
  };

  const stockStyle = (stock: number) => {
    if (stock === 0) return "border-red-400 bg-red-50";
    if (stock <= 3) return "border-amber-400 bg-amber-50";
    return "border-slate-300";
  };

  return (
    <AdminModal onClose={onClose} width="w-[520px]">
<div className="mb-6 space-y-4">

  <div>
    <label className="text-xs text-slate-500 mb-1 block">
      Product Name
    </label>

    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full border rounded-md px-3 py-2 text-sm"
    />
  </div>

  <div>
    <label className="text-xs text-slate-500 mb-1 block">
      Product Code
    </label>

    <input
      value={code}
      onChange={(e) => setCode(e.target.value.toUpperCase())}
      className="w-full border rounded-md px-3 py-2 text-sm"
    />
  </div>

</div>

<p className="text-sm text-slate-500 mb-6">
  Manage concentrations
</p>

      <div className="space-y-4">
        {concentrations.map((c: any, index: number) => (
          <div
            key={index}
            className="border border-slate-200 rounded-xl p-4"
          >
            <div className="grid grid-cols-3 gap-6 items-end">
              
              {/* Label */}
              <div>
                <div className="text-xs text-slate-500 mb-1">
                  Label
                </div>
                <div className="font-medium text-sm">
                  {c.label}
                </div>
              </div>

              {/* Public Price */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Public Price
                </label>
                <input
                  type="number"
                  value={c.prices?.public ?? 0}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "public",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Stock
                </label>
                <input
                  type="number"
                  value={c.stock ?? 0}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "stock",
                      Number(e.target.value)
                    )
                  }
                  className={`w-full border rounded-md px-3 py-2 text-sm ${stockStyle(
                    c.stock
                  )}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-md border border-slate-300 text-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm transition"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </AdminModal>
  );
}
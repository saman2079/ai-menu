// src/app/admin/menu/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CategoryObj {
  _id: string;
  name: string;
  title?: string;
  slug?: string;
}

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  ingredients: string[];
  preparationTime?: number;
  category: string | CategoryObj; // ← مهم
  isAvailable: boolean;
}

export default function AdminMenuPage() {
  // const [items, setItems] = useState<MenuItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form , setForm] = useState([])
  const [editingid,setEditingId] = useState("")
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    images: [] as string[],
    price: 0,
    ingredients: [] as string[],
    preparationTime: 0,
    category: "",
    isAvailable: true,
  });

  const [newIngredient, setNewIngredient] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    return await res.json();
  };

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const fetchItems = async () => {
    const res = await fetch("/api/admin/menu");
    return await res.json();
  };

  const { data: items = [] } = useQuery({
    queryKey: ["menu-admin"],
    queryFn: fetchItems,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.urls || [];
    } catch (error) {
      console.error("خطا در آپلود:", error);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrls = [...formData.images];

      if (selectedFiles.length > 0) {
        const uploadedUrls = await uploadImages();
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      const payload = { ...formData, images: imageUrls };

      if (editingItem) {
        await fetch(`/api/admin/menu/${editingItem._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/admin/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["menu-admin"] });

      fetchItems();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("خطا در ذخیره:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا مطمئن هستید؟")) return;

    try {
      await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
      fetchItems();
    } catch (error) {
      console.error("خطا در حذف:", error);
    }

    await queryClient.invalidateQueries({ queryKey: ["menu-admin"] });
  };

  const handleEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      images: item.images || [],
      ingredients: item.ingredients || [],
      preparationTime: item.preparationTime || 0,
      isAvailable: item.isAvailable,
      category:
        typeof item.category === "string" ? item.category : item.category?._id, // ← این مهم است
    });
    setEditingId(item._id);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      images: [],
      price: 0,
      ingredients: [],
      preparationTime: 0,
      category: "",
      isAvailable: true,
    });
    setEditingItem(null);
    setSelectedFiles([]);
    setNewIngredient("");
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredient.trim()],
      });
      setNewIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Menu management</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Add food
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items?.items?.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48 bg-gray-200">
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No photo
                  </div>
                )}
                {item.images?.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                    +{item.images.length - 1}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>⏱️ {item.preparationTime} minutes</span>
                  <span className="font-bold text-green-600">
                    {item.price.toLocaleString()} $
                  </span>
                </div>

                {item.ingredients?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Raw materials</p>
                    <div className="flex flex-wrap gap-1">
                      {item.ingredients.slice(0, 3).map((ing, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {ing}
                        </span>
                      ))}
                      {item.ingredients.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{item.ingredients.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 flex items-center justify-center gap-1"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center justify-center gap-1"
                  >
                    <Trash2 size={16} />
                    remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingItem ? "Edit food" : "Add food"}
                  </h2>
                  <button onClick={() => setShowModal(false)}>
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium">food name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-4 py-2"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Photos</label>
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full"
                      />
                      {selectedFiles.length > 0 && (
                        <p className="text-sm text-gray-600 mt-2">
                          {selectedFiles.length} Selected file
                        </p>
                      )}
                    </div>

                    {formData.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {formData.images.map((img, i) => (
                          <div key={i} className="relative">
                            <img
                              src={img}
                              alt=""
                              className="w-full h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-medium">price </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">
                        preparation time
                      </label>
                      <input
                        type="number"
                        value={formData.preparationTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preparationTime: Number(e.target.value),
                          })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">
                      categorization
                    </label>
                    {/* <input
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full border rounded-lg px-4 py-2"
                                            placeholder="مثلاً: پیتزا، برگر، نوشیدنی"
                                            required
                                        /> */}

                    {/* <select  name="" id="">
                                            {
                                                data?.categories?.map((item) => (
                                                    <option value="">{item.name}</option>
                                                ))
                                            }
                                        </select> */}

                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2 bg-white"
                      required
                    >
                      <option value=""> choose...</option>
                      {data?.categories
                        ?.filter((cat) => cat.isActive)
                        .map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">
                      Ingredients
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addIngredient())
                        }
                        className="flex-1 border rounded-lg px-4 py-2"
                        placeholder="For example: meat, cheese, tomato"
                      />
                      <button
                        type="button"
                        onClick={addIngredient}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.ingredients.map((ing, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                        >
                          {ing}
                          <button
                            type="button"
                            onClick={() => removeIngredient(i)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isAvailable}
                                            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                            className="w-5 h-5"
                                        />
                                        <label className="font-medium">موجود است</label>
                                    </div> */}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading || uploading}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {loading || uploading ? "Saving..." : "save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
                    >
                      opt out
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

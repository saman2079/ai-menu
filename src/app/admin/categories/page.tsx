"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, X, Upload } from "lucide-react"

interface Category {
    _id: string
    name: string
    slug: string
    title: string
    image?: string
    isActive: boolean
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({ name: "", title: "", image: "" })
    const [editId, setEditId] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/categories")
            const data = await res.json()
            setCategories(data.categories)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const uploadImage = async () => {
        if (!selectedFile) return formData.image

        setUploading(true)
        const formDataUpload = new FormData()
        formDataUpload.append('images', selectedFile)

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formDataUpload,
            })
            const data = await res.json()
            return data.urls?.[0] || ''
        } catch (error) {
            console.error('خطا در آپلود:', error)
            return ''
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let imageUrl = formData.image

            if (selectedFile) {
                imageUrl = await uploadImage()
            }

            const payload = { ...formData, image: imageUrl }

            if (editId) {
                await fetch(`/api/admin/categories/${editId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
            } else {
                await fetch("/api/admin/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
            }

            resetForm()
            setShowModal(false)
            fetchCategories()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("مطمئنی؟")) return

        try {
            await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
            fetchCategories()
        } catch (error) {
            console.error(error)
        }
    }

    const handleEdit = (cat: Category) => {
        setFormData({ name: cat.name, title: cat.title, image: cat.image || "" })
        setPreviewUrl(cat.image || "")
        setEditId(cat._id)
        setShowModal(true)
    }

    const resetForm = () => {
        setFormData({ name: "", title: "", image: "" })
        setEditId(null)
        setSelectedFile(null)
        setPreviewUrl("")
    }

    if (loading && categories.length === 0) return <div className="p-8">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Manage categories</h1>
                    <button
                        onClick={() => {
                            resetForm()
                            setShowModal(true)
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Add category
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories?.map((cat) => (
                        <div key={cat._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative h-48 bg-gray-200">
                                {cat.image ? (
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No photo
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{cat.title}</p>
                                <p className="text-xs text-gray-400 mb-3">slug: {cat.slug}</p>

                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-xs px-2 py-1 rounded ${cat.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {cat.isActive ? "active" : "disabled"}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 flex items-center justify-center gap-1"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat._id)}
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
                        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">
                                        {editId ? 'Edit category' : 'Add category'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block mb-2 font-medium"> Category name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full border rounded-lg px-4 py-2"
                                            placeholder="Example: Pizza"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-medium">title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full border rounded-lg px-4 py-2"
                                            placeholder="For example: Delicious pizzas"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-medium">Photo category</label>
                                        <div className="border-2 border-dashed rounded-lg p-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="w-full"
                                            />
                                            {selectedFile && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    {selectedFile.name}
                                                </p>
                                            )}
                                        </div>

                                        {previewUrl && (
                                            <div className="mt-3">
                                                <img
                                                    src={previewUrl}
                                                    alt="پیش‌نمایش"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading || uploading}
                                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            {loading || uploading ? 'saving...' : 'save'}
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
    )
}

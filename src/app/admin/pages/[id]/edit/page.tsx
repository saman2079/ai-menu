// src/app/admin/pages/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { COMPONENTS_REGISTRY } from "@/lib/page-builder/components-registry";

export default function PageBuilderPage({ params }: { params: { id: string } }) {
    const [page, setPage] = useState<any>(null);
    const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

    useEffect(() => {
        if (params.id === "new") {
            setPage({
                title: "New Page",
                slug: "/new-page",
                components: [],
                settings: {},
            });
        } else {
            fetch(`/api/admin/pages/${params.id}`)
                .then((r) => r.json())
                .then((data) => setPage(data.page));
        }
    }, [params.id]);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setPage((prev: any) => {
                const oldIndex = prev.components.findIndex((c: any) => c.id === active.id);
                const newIndex = prev.components.findIndex((c: any) => c.id === over.id);
                return {
                    ...prev,
                    components: arrayMove(prev.components, oldIndex, newIndex),
                };
            });
        }
    };

    const addComponent = (type: string) => {
        const def = COMPONENTS_REGISTRY.find((c) => c.type === type);
        if (!def) return;

        const newComponent = {
            id: `${type}-${Date.now()}`,
            type,
            props: { ...def.defaultProps },
            order: page.components.length,
        };

        setPage((prev: any) => ({
            ...prev,
            components: [...prev.components, newComponent],
        }));
    };

    const updateComponentProps = (id: string, props: any) => {
        setPage((prev: any) => ({
            ...prev,
            components: prev.components.map((c: any) =>
                c.id === id ? { ...c, props } : c
            ),
        }));
    };

    const savePage = async () => {
        const url =
            params.id === "new"
                ? "/api/admin/pages"
                : `/api/admin/pages/${params.id}`;
        const method = params.id === "new" ? "POST" : "PUT";

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(page),
        });

        alert("Page saved!");
    };

    if (!page) return <div>Loading...</div>;

    return (
        <div className="flex h-screen">
            {/* Sidebar - Component Library */}
            <div className="w-[250px] bg-gray-900 p-4 overflow-y-auto">
                <h2 className="text-[20px] font-bold mb-4">Components</h2>
                {COMPONENTS_REGISTRY.map((comp) => (
                    <button
                        key={comp.type}
                        onClick={() => addComponent(comp.type)}
                        className="w-full bg-gray-800 p-3 rounded mb-2 text-left hover:bg-gray-700"
                    >
                        {comp.icon} {comp.label}
                    </button>
                ))}
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-gray-800 overflow-y-auto p-8">
                <div className="mb-4 flex gap-4">
                    <input
                        type="text"
                        value={page.title}
                        onChange={(e) => setPage({ ...page, title: e.target.value })}
                        className="bg-gray-700 px-4 py-2 rounded flex-1"
                        placeholder="Page Title"
                    />
                    <input
                        type="text"
                        value={page.slug}
                        onChange={(e) => setPage({ ...page, slug: e.target.value })}
                        className="bg-gray-700 px-4 py-2 rounded flex-1"
                        placeholder="/slug"
                    />
                    <button onClick={savePage} className="bg-green-500 px-6 py-2 rounded">
                        Save
                    </button>
                </div>

                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={page.components.map((c: any) => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {page.components.map((comp: any) => (
                            <SortableComponent
                                key={comp.id}
                                component={comp}
                                onSelect={() => setSelectedComponent(comp.id)}
                                isSelected={selectedComponent === comp.id}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            {/* Properties Panel */}
            {selectedComponent && (
                <div className="w-[300px] bg-gray-900 p-4 overflow-y-auto">
                    <h2 className="text-[20px] font-bold mb-4">Properties</h2>
                    <PropertiesPanel
                        component={page.components.find((c: any) => c.id === selectedComponent)}
                        onChange={(props) => updateComponentProps(selectedComponent, props)}
                    />
                </div>
            )}
        </div>
    );
}

function SortableComponent({ component, onSelect, isSelected }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: component.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const def = COMPONENTS_REGISTRY.find((c) => c.type === component.type);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onSelect}
            className={`mb-4 border-2 ${isSelected ? "border-blue-500" : "border-gray-700"
                } rounded cursor-move`}
        >
            {def?.render(component.props)}
        </div>
    );
}

function PropertiesPanel({ component, onChange }: any) {
    const def = COMPONENTS_REGISTRY.find((c) => c.type === component.type);
    if (!def) return null;

    return (
        <div className="flex flex-col gap-4">
            {def.propsSchema.map((field) => (
                <div key={field.name}>
                    <label className="block text-sm mb-1">{field.label}</label>
                    {field.type === "text" && (
                        <input
                            type="text"
                            value={component.props[field.name] || ""}
                            onChange={(e) =>
                                onChange({ ...component.props, [field.name]: e.target.value })
                            }
                            className="w-full bg-gray-800 px-3 py-2 rounded"
                        />
                    )}
                    {field.type === "textarea" && (
                        <textarea
                            value={component.props[field.name] || ""}
                            onChange={(e) =>
                                onChange({ ...component.props, [field.name]: e.target.value })
                            }
                            className="w-full bg-gray-800 px-3 py-2 rounded"
                            rows={4}
                        />
                    )}
                    {field.type === "number" && (
                        <input
                            type="number"
                            value={component.props[field.name] || 0}
                            onChange={(e) =>
                                onChange({
                                    ...component.props,
                                    [field.name]: parseInt(e.target.value),
                                })
                            }
                            className="w-full bg-gray-800 px-3 py-2 rounded"
                        />
                    )}
                    {field.type === "color" && (
                        <input
                            type="color"
                            value={component.props[field.name] || "#000000"}
                            onChange={(e) =>
                                onChange({ ...component.props, [field.name]: e.target.value })
                            }
                            className="w-full h-10 rounded"
                        />
                    )}
                    {field.type === "select" && (
                        <select
                            value={component.props[field.name] || ""}
                            onChange={(e) =>
                                onChange({ ...component.props, [field.name]: e.target.value })
                            }
                            className="w-full bg-gray-800 px-3 py-2 rounded"
                        >
                            {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            ))}
        </div>
    );
}

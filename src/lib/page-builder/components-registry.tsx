// src/lib/page-builder/components-registry.tsx
import { ReactNode } from "react";

export interface ComponentDefinition {
    type: string;
    label: string;
    icon: string;
    defaultProps: Record<string, any>;
    propsSchema: Array<{
        name: string;
        type: "text" | "textarea" | "color" | "number" | "image" | "select";
        label: string;
        options?: string[];
    }>;
    render: (props: any) => ReactNode;
}

export const COMPONENTS_REGISTRY: ComponentDefinition[] = [
    {
        type: "Hero",
        label: "Hero Section",
        icon: "🎭",
        defaultProps: {
            title: "Welcome",
            subtitle: "Best Restaurant",
            backgroundImage: "/images/hero-bg.jpg",
            textColor: "#ffffff",
        },
        propsSchema: [
            { name: "title", type: "text", label: "Title" },
            { name: "subtitle", type: "text", label: "Subtitle" },
            { name: "backgroundImage", type: "image", label: "Background" },
            { name: "textColor", type: "color", label: "Text Color" },
        ],
        render: (props) => (
            <div
                className="h-[400px] flex flex-col items-center justify-center"
                style={{
                    backgroundImage: `url(${props.backgroundImage})`,
                    backgroundSize: "cover",
                    color: props.textColor,
                }}
            >
                <h1 className="text-[48px] font-bold">{props.title}</h1>
                <p className="text-[24px]">{props.subtitle}</p>
            </div>
        ),
    },
    {
        type: "Text",
        label: "Text Block",
        icon: "📝",
        defaultProps: {
            content: "Enter your text here...",
            fontSize: 18,
            textAlign: "left",
            color: "#ffffff",
        },
        propsSchema: [
            { name: "content", type: "textarea", label: "Content" },
            { name: "fontSize", type: "number", label: "Font Size" },
            {
                name: "textAlign",
                type: "select",
                label: "Align",
                options: ["left", "center", "right"],
            },
            { name: "color", type: "color", label: "Color" },
        ],
        render: (props) => (
            <div
                className="p-8"
                style={{
                    fontSize: `${props.fontSize}px`,
                    textAlign: props.textAlign,
                    color: props.color,
                }}
            >
                {props.content}
            </div>
        ),
    },
    {
        type: "MenuGrid",
        label: "Menu Items Grid",
        icon: "🍔",
        defaultProps: {
            category: "all",
            columns: 3,
        },
        propsSchema: [
            { name: "category", type: "text", label: "Category Filter" },
            { name: "columns", type: "number", label: "Columns" },
        ],
        render: (props) => (
            <div className="p-8">
                <p className="text-white">Menu Grid (category: {props.category})</p>
                {/* اینجا از API منو بخونی */}
            </div>
        ),
    },
    {
        type: "Image",
        label: "Image",
        icon: "🖼️",
        defaultProps: {
            src: "/images/placeholder.jpg",
            alt: "Image",
            width: "100%",
            height: "auto",
        },
        propsSchema: [
            { name: "src", type: "image", label: "Image URL" },
            { name: "alt", type: "text", label: "Alt Text" },
            { name: "width", type: "text", label: "Width" },
            { name: "height", type: "text", label: "Height" },
        ],
        render: (props) => (
            <div className="p-4">
                <img
                    src={props.src}
                    alt={props.alt}
                    style={{ width: props.width, height: props.height }}
                />
            </div>
        ),
    },
];

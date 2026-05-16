// src/components/DynamicPageRenderer.tsx
"use client";

import { COMPONENTS_REGISTRY } from "@/lib/page-builder/components-registry";

export default function DynamicPageRenderer({ page }: { page: any }) {
    return (
        <div style={{ backgroundColor: page.settings.backgroundColor }}>
            {page.components
                .sort((a: any, b: any) => a.order - b.order)
                .map((comp: any) => {
                    const def = COMPONENTS_REGISTRY.find((c) => c.type === comp.type);
                    return def ? <div key={comp.id}>{def.render(comp.props)}</div> : null;
                })}
        </div>
    );
}

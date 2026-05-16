import SessionInitializer from "@/components/menu/SessionInitializer";

export default function MenuLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SessionInitializer />
            {children}
        </>
    );
}

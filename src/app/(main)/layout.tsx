
import ButtonNav from "@/components/layout/ButtonNav";
import ScrollContainer from "@/components/layout/scroll-container";
import SessionInitializer from "@/components/menu/SessionInitializer";
import { Suspense } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-[100dvh]">
      <ScrollContainer>
        <div className="min-h-[100dvh] mx-auto w-full max-w-[450px] ">
          <div className="bg-[#090100]/69 w-full min-h-[100dvh] relative ">
            <Suspense fallback={null}>
              <SessionInitializer />
            </Suspense>
            {children}
            <ButtonNav />
          </div>
        </div>
      </ScrollContainer>
    </div>
  );
}

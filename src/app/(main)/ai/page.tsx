import Slider from "@/components/ai/Slider";
import ContentSwitcher from "@/components/ai/ContentSwitcher";

export default function ai() {
  return (
    <div className=" w-full flex flex-col pt-10">
      <Slider />
      <ContentSwitcher />
    </div>
  );
}

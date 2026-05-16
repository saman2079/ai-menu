import React from "react";

type ButtonVariant = "primary" | "menu" | "outline" | "danger" | "ghost";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
};

const baseClasses = "";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-black w-full rounded-[10px] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  menu: "bg-white/13 rounded-[16px] text-white  backdrop-blur-[2px]  cursor-pointer ",
  outline:
    " bg-white/[0.08] backdrop-blur-[18px] backdrop-saturate-[180%] border border-white/15 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/12 before:to-white/[0.02] before:rounded-2xl before:pointer-events-none relative",

  danger: "",
  ghost: "",
};

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function Button({
  children,
  variant = "primary",
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  visibilityLabel?: string;
  visibilityButtonClassName?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      className,
      id,
      disabled,
      visibilityLabel = "password",
      visibilityButtonClassName,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative w-full">
        <input
          {...props}
          ref={ref}
          id={inputId}
          type={visible ? "text" : "password"}
          disabled={disabled}
          className={cn(className, "pr-12")}
        />
        <button
          type="button"
          aria-label={`${visible ? "Hide" : "Show"} ${visibilityLabel}`}
          aria-controls={inputId}
          aria-pressed={visible}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setVisible((value) => !value)}
          className={cn(
            "absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-[#39BED3] disabled:opacity-40",
            visibilityButtonClassName,
          )}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

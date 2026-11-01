"use client";
import { useField } from "formik";
import { PasswordInput as PasswordField } from "@/components/ui/password-input";
import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  name: string;
  label: string;
};
export default function PasswordInput({ label, ...props }: Props) {
  const [field, meta] = useField(props.name);
  const id = props.id || props.name;
  return (
    <article className="my-5">
      <label htmlFor={id} className="text-white">
        {label}
      </label>
      <div className="mt-2 text-black">
        <PasswordField
          {...field}
          {...props}
          id={id}
          visibilityLabel={label.toLowerCase()}
          aria-invalid={meta.touched && !!meta.error}
          aria-describedby={
            meta.touched && meta.error ? `${id}-error` : undefined
          }
          className="w-full rounded-full bg-white py-3 pl-6 outline-none focus:ring-2 focus:ring-[#0795B0]"
        />
      </div>
      {meta.touched && meta.error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-400">
          {meta.error}
        </p>
      )}
    </article>
  );
}

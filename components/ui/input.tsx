import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, errorText, leftIcon, className = "", id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const hasError = !!errorText;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-label-md font-medium text-on-surface-variant"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full rounded-md border bg-surface px-3 py-2.5 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50",
            leftIcon ? "pl-9" : "",
            hasError
              ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
              : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          ].join(" ")}
          {...props}
        />
      </div>

      {errorText && (
        <p className="text-label-sm text-error">{errorText}</p>
      )}
      {helperText && !errorText && (
        <p className="text-label-sm text-on-surface-variant">{helperText}</p>
      )}
    </div>
  );
});

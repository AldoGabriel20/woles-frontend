import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, helperText, errorText, className = "", id, maxLength, value, ...props },
    ref,
  ) {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = !!errorText;
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-label-md font-medium text-on-surface-variant"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          rows={3}
          className={[
            "w-full resize-none rounded-md border bg-surface px-3 py-2.5 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50",
            hasError
              ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
              : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          ].join(" ")}
          {...props}
        />

        <div className="flex items-start justify-between gap-2">
          <div>
            {errorText && <p className="text-label-sm text-error">{errorText}</p>}
            {helperText && !errorText && (
              <p className="text-label-sm text-on-surface-variant">{helperText}</p>
            )}
          </div>
          {maxLength && (
            <p className="shrink-0 text-label-sm text-on-surface-variant">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

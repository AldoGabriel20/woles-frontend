import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helperText, errorText, options, placeholder, className = "", id, ...props },
  ref,
) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const hasError = !!errorText;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="text-label-md font-medium text-on-surface-variant"
        >
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        className={[
          "w-full rounded-md border bg-surface px-3 py-2.5 text-body-md text-on-surface outline-none transition-colors",
          hasError
            ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
            : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        ].join(" ")}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {errorText && <p className="text-label-sm text-error">{errorText}</p>}
      {helperText && !errorText && (
        <p className="text-label-sm text-on-surface-variant">{helperText}</p>
      )}
    </div>
  );
});

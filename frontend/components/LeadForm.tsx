"use client";

import { useState, type FormEvent } from "react";
import { LeadCreateSchema, type LeadCreate } from "@/lib/schemas";
import BudgetSelect from "@/components/BudgetSelect";

interface LeadFormProps {
  onSubmit: (data: LeadCreate) => Promise<void>;
  isSubmitting: boolean;
}

const inputClassName =
  "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export default function LeadForm({ onSubmit, isSubmitting }: LeadFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [budget, setBudget] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = {
      first_name: (formData.get("first_name") as string) ?? "",
      last_name: (formData.get("last_name") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      company: (formData.get("company") as string) ?? "",
      budget: (formData.get("budget") as string) ?? "",
    };

    const result = LeadCreateSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.map(String).join(".");
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            className={inputClassName}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            className={inputClassName}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Corporate Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={inputClassName}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="company"
          className="block text-sm font-medium text-gray-700"
        >
          Company
        </label>
        <input
          id="company"
          name="company"
          type="text"
          className={inputClassName}
        />
        {errors.company && (
          <p className="mt-1 text-sm text-red-600">{errors.company}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="budget"
          id="budget-label"
          className="block text-sm font-medium text-gray-700"
        >
          Estimated Annual Budget
        </label>
        <BudgetSelect value={budget} onChange={setBudget} />
        {errors.budget && (
          <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting && (
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {isSubmitting ? "Submitting…" : "Submit Lead"}
      </button>
    </form>
  );
}

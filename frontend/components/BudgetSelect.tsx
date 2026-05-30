"use client";

import { useEffect, useRef, useState } from "react";
import { BUDGET_OPTIONS } from "@/lib/config";

interface BudgetSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
}

export default function BudgetSelect({
  value,
  onChange,
  id = "budget",
  name = "budget",
}: BudgetSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedLabel =
    BUDGET_OPTIONS.find((opt) => opt.value === value)?.label ??
    "Select a budget range";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('[role="option"]');
      const el = items[focusedIndex] as HTMLElement | undefined;
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex, isOpen]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(
          Math.max(
            0,
            BUDGET_OPTIONS.findIndex((opt) => opt.value === value),
          ),
        );
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          Math.min(prev + 1, BUDGET_OPTIONS.length - 1),
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0) {
          onChange(BUDGET_OPTIONS[focusedIndex].value);
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  }

  function selectOption(optValue: string) {
    onChange(optValue);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        aria-labelledby={`${id}-label`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`mt-1 flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          value
            ? "border-gray-300 text-gray-900"
            : "border-gray-300 text-gray-400"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          ref={listboxRef}
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
        >
          {BUDGET_OPTIONS.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused = idx === focusedIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOption(opt.value)}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={`cursor-pointer select-none px-3 py-2 text-sm ${
                  isFocused ? "bg-blue-50 text-blue-700" : "text-gray-900"
                } ${isSelected ? "font-medium" : "font-normal"}`}
              >
                <div className="flex items-center justify-between">
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

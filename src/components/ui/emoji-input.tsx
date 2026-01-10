import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmojiInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function EmojiInput({
  value,
  onChange,
  placeholder,
  maxLength,
  multiline = false,
  rows = 3,
  disabled = false,
  className,
  autoFocus = false,
}: EmojiInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Закрыть picker при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiSelect = (emoji: { native: string }) => {
    const input = inputRef.current;
    if (!input) {
      onChange(value + emoji.native);
      return;
    }

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const newValue = value.slice(0, start) + emoji.native + value.slice(end);
    
    if (maxLength && newValue.length > maxLength) return;
    
    onChange(newValue);

    // Восстановить фокус и позицию курсора
    setTimeout(() => {
      input.focus();
      const newPos = start + emoji.native.length;
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const inputClassName = cn(
    "flex w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:cursor-not-allowed disabled:opacity-50",
    className
  );

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(inputClassName, "resize-none")}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          autoFocus={autoFocus}
          className={inputClassName}
        />
      )}

      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => setShowPicker(!showPicker)}
        className={cn(
          "absolute right-1 h-7 w-7 text-muted-foreground hover:text-foreground",
          multiline ? "top-1" : "top-1/2 -translate-y-1/2"
        )}
      >
        <Smile className="h-4 w-4" />
      </Button>

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute right-0 top-full z-50 mt-1"
        >
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="dark"
            locale="ru"
            previewPosition="none"
            skinTonePosition="none"
            maxFrequentRows={2}
          />
        </div>
      )}
    </div>
  );
}


import { useRef, useState, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  error?: boolean;
}

export default function OTPInput({
  value, onChange, disabled, autoFocus, error
}: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (index: number, char: string) => {
    // Handle paste of full code
    if (char.length > 1) {
      const clean = char.replace(/\D/g, '').slice(0, 6);
      onChange(clean);
      const nextIndex = Math.min(clean.length, 5);
      inputs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d$/.test(char) && char !== '') return;

    const newDigits = [...digits];
    newDigits[index] = char === '' ? ' ' : char;
    onChange(newDigits.join('').replace(/ /g, ''));

    // Auto-advance to next
    if (char && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const currentVal = digits[index].trim();
      const newDigits = [...digits];

      if (currentVal) {
        // Clear current digit
        newDigits[index] = ' ';
        onChange(newDigits.join('').replace(/ /g, ''));
      } else if (index > 0) {
        // Move to previous and clear it
        newDigits[index - 1] = ' ';
        onChange(newDigits.join('').replace(/ /g, ''));
        inputs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text')
      .replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const nextIndex = Math.min(pasted.length, 5);
    inputs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={6}   // allow paste of full code
          value={digits[i].trim() ?? ''}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          className={`w-12 h-14 text-center text-xl font-bold
            border-2 rounded-xl bg-input-background text-foreground
            focus:outline-none transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
              : digits[i] && digits[i] !== ' '
                ? 'border-primary focus:border-primary focus:ring-2 focus:ring-primary/20'
                : 'border-input focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
        />
      ))}
    </div>
  );
}

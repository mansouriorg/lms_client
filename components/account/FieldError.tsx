import { AlertCircle } from 'lucide-react';

// The message under a form field; `id` is what the field's
// aria-describedby points to.
export default function FieldError({ id, text }: { id: string; text: string | undefined }) {
  if (text === undefined) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-xs text-red-400">
      <AlertCircle aria-hidden="true" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      {text}
    </p>
  );
}

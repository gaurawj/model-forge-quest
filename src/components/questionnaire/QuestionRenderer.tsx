import type { Question, AnswerValue } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  question: Question;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
}

export function QuestionRenderer({ question, value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div>
        <Label className="text-sm font-medium text-foreground">
          {question.label}
          {question.required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {question.description && (
          <p className="mt-1 text-xs text-muted-foreground">{question.description}</p>
        )}
      </div>

      {question.type === "descriptive" && (
        <Textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? "Type your answer…"}
          className="min-h-[88px] bg-background"
        />
      )}

      {question.type === "single_choice" && (
        <RadioGroup
          value={(value as string) ?? ""}
          onValueChange={(v) => onChange(v)}
          className="grid gap-2"
        >
          {question.options?.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5 text-sm hover:border-primary/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <RadioGroupItem value={opt.value} />
              <span>{opt.label}</span>
            </label>
          ))}
        </RadioGroup>
      )}

      {question.type === "multi_choice" && (
        <div className="grid gap-2">
          {question.options?.map((opt) => {
            const arr = Array.isArray(value) ? value : [];
            const checked = arr.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5 text-sm hover:border-primary/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => {
                    const next = c
                      ? [...arr, opt.value]
                      : arr.filter((v) => v !== opt.value);
                    onChange(next);
                  }}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* fallback: unknown type → text */}
      {!["descriptive", "single_choice", "multi_choice"].includes(question.type) && (
        <Input
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="bg-background"
        />
      )}
    </div>
  );
}

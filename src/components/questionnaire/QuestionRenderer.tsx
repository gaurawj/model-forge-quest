import { useState } from "react";
import type { Question, AnswerValue } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        <Select
          value={(value as string) ?? ""}
          onValueChange={(v) => onChange(v)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select an option…" />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {question.type === "multi_choice" && (
        <MultiSelect question={question} value={value} onChange={onChange} />
      )}

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

function MultiSelect({ question, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const arr = Array.isArray(value) ? value : [];
  const opts = question.options ?? [];

  const toggle = (v: string) => {
    const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
    onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between bg-background font-normal h-auto min-h-9 py-1.5"
        >
          <div className="flex flex-wrap gap-1 text-left">
            {arr.length === 0 && (
              <span className="text-muted-foreground text-sm">Select one or more…</span>
            )}
            {arr.map((v) => {
              const o = opts.find((x) => x.value === v);
              return (
                <Badge
                  key={v}
                  variant="secondary"
                  className="gap-1 text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggle(v);
                  }}
                >
                  {o?.label ?? v}
                  <X className="h-3 w-3 opacity-60" />
                </Badge>
              );
            })}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
        <div className="max-h-72 overflow-y-auto">
          {opts.map((opt) => {
            const checked = arr.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-2 text-sm hover:bg-accent"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggle(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

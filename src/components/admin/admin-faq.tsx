import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { faqSave, faqDelete, faqList } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AdminFAQ() {
  const queryClient = useQueryClient();
  const faqListFn = useServerFn(faqList);
  const faqSaveFn = useServerFn(faqSave);
  const faqDeleteFn = useServerFn(faqDelete);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const { data: faqs = [] } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: () => faqListFn(),
  });

  const saveMutation = useMutation({
    mutationFn: (input: { question: string; answer: string; id?: string }) =>
      faqSaveFn({ data: { id: input.id, question: input.question, answer: input.answer } }),
    onSuccess: () => {
      setQuestion("");
      setAnswer("");
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["site-data"] });
      toast.success("FAQ saved");
    },
    onError: () => toast.error("Could not save FAQ"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faqDeleteFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["site-data"] });
      toast.success("FAQ deleted");
    },
    onError: () => toast.error("Could not delete FAQ"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    saveMutation.mutate({ question: question.trim(), answer: answer.trim(), id: editId ?? undefined });
  };

  const handleEdit = (faq: { id: string; question: string; answer: string }) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setEditId(faq.id);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">FAQ Questions</h3>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border p-4">
        <Input
          placeholder="Question"
          value={question}
          maxLength={500}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Textarea
          placeholder="Answer"
          rows={3}
          value={answer}
          maxLength={4000}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={saveMutation.isPending} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            {saveMutation.isPending ? "Saving…" : editId ? "Update" : "Add"}
          </Button>
          {editId && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setQuestion("");
                setAnswer("");
                setEditId(null);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {faqs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No FAQ questions yet.</p>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq) => (
            <div key={faq.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{faq.question}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(faq)}>
                  Edit
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(faq.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
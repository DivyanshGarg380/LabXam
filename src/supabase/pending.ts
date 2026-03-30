import { supabase } from "@/lib/supabase";

export type PendingItem = {
  id: string;
  semester: string;
  subject: string;
  year: string;
  question: string;
  section: string;
  evaluationType: string;
  status: string;
  submittedAt: Date | null;
};

export const fetchPending = async (): Promise<PendingItem[]> => {
  const { data, error } = await supabase
    .from("pending")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id:             row.id,
    semester:       row.semester,
    subject:        row.subject,
    year:           row.year,
    question:       row.question,
    section:        row.section,
    evaluationType: row.evaluation_type,
    status:         row.status,
    submittedAt:    row.submitted_at ? new Date(row.submitted_at) : null,
  }));
};

export const approvePending = async (
  item: PendingItem,
  question: string
) => {
  const { data, error } = await supabase
    .from("questions")
    .select("id, questions")
    .eq("semester", item.semester)
    .eq("subject", item.subject)
    .eq("evaluation", item.evaluationType)
    .eq("section", item.section)
    .eq("year", item.year)
    .single();

  if (error && error.code !== "PGRST116") return false;

  if (data) {
    const { error: updateError } = await supabase
      .from("questions")
      .update({ questions: [...data.questions, question] })
      .eq("id", data.id);

    if (updateError) return false;
  } else {
    const { error: insertError } = await supabase
      .from("questions")
      .insert({
        semester:    item.semester,
        subject:     item.subject,
        evaluation:  item.evaluationType,
        section:     item.section,
        year:        item.year,
        questions:   [question],
        uploaded_at: Date.now(),
      });

    if (insertError) return false;
  }

  const { error: deleteError } = await supabase
    .from("pending")
    .delete()
    .eq("id", item.id);

  return !deleteError;
};

export const rejectPending = async (id: string) => {
  const { error } = await supabase
    .from("pending")
    .delete()
    .eq("id", id);

  return !error;
};

export const submitPending = async (
  semester: string,
  subject: string,
  year: string,
  question: string,
  section: string,
  evaluationType: string
) => {
  const { error } = await supabase
    .from("pending")
    .insert({
      semester,
      subject,
      year,
      question,
      section,
      evaluation_type: evaluationType,
    });

  return !error;
};
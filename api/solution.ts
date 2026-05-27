import { createClient } from "@supabase/supabase-js";

const PROMPT_VERSION = "v1";
const DEFAULT_MODEL = "meta/llama-3.1-8b-instruct";

type RequestBody = {
  questionId?: string;
};

type QuestionRow = {
  id: string;
  semester: string | null;
  subject: string | null;
  evaluation: string | null;
  section: string | null;
  year: string | null;
  questions: string[] | string | null;
};

const parseBody = (body: unknown): RequestBody => {
  if (typeof body === "string") return JSON.parse(body);
  return (body ?? {}) as RequestBody;
};

const parseQuestionId = (questionId: string) => {
  const separatorIndex = questionId.lastIndexOf(":");
  if (separatorIndex === -1) return null;

  const rowId = questionId.slice(0, separatorIndex);
  const questionIndex = Number(questionId.slice(separatorIndex + 1));

  if (!rowId || !Number.isInteger(questionIndex) || questionIndex < 0) {
    return null;
  }

  return { rowId, questionIndex };
};

const buildPrompt = (row: QuestionRow, question: string) => {
  return [
    {
      role: "system",
      content:
        "You are an expert lab exam tutor. Produce accurate, student-friendly solutions for programming and lab exam questions. Keep the answer practical, structured, and directly useful for writing in an exam.",
    },
    {
      role: "user",
      content: `Create a detailed solution for this lab exam question.

Context:
- Semester: ${row.semester ?? "Unknown"}
- Subject: ${row.subject ?? "Unknown"}
- Evaluation: ${row.evaluation ?? "Unknown"}
- Section: ${row.section ?? "Unknown"}
- Question date/year: ${row.year ?? "Unknown"}

Question:
${question}

Format the answer with:
1. A short idea/approach.
2. Step-by-step explanation.
3. Code or commands if the question needs them.
4. Important notes, edge cases, or common mistakes.

Example style:
Approach:
Explain the core concept briefly.

Steps:
1. Do the first required operation.
2. Explain why it is needed.

Solution:
Provide the final code, query, commands, or written answer.

Notes:
Mention assumptions and exam tips only when useful.`,
    },
  ];
};

const getSupabaseClient = () => {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase server environment variables");
  }

  return createClient(supabaseUrl, supabaseKey);
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = parseBody(req.body);

    if (!body.questionId) {
      return res.status(400).json({ error: "Missing questionId" });
    }

    const parsed = parseQuestionId(body.questionId);
    if (!parsed) {
      return res.status(400).json({ error: "Invalid questionId" });
    }

    const supabase = getSupabaseClient();

    const { data: cached, error: cacheError } = await supabase
      .from("ai_solutions")
      .select("solution_text, model, prompt_version")
      .eq("question_id", body.questionId)
      .eq("prompt_version", PROMPT_VERSION)
      .maybeSingle();

    const cacheTableMissing = cacheError?.code === "PGRST205";

    if (cacheError) {
      if (cacheTableMissing) {
        console.warn("Solution cache table is missing; generating without cache.");
      } else {
      console.error("Solution cache read error:", cacheError);
      return res.status(500).json({ error: "Failed to read solution cache" });
      }
    }

    if (cached?.solution_text) {
      return res.status(200).json({
        solution: cached.solution_text,
        cached: true,
        model: cached.model,
        promptVersion: cached.prompt_version,
      });
    }

    const { data: questionRow, error: questionError } = await supabase
      .from("questions")
      .select("id, semester, subject, evaluation, section, year, questions")
      .eq("id", parsed.rowId)
      .single();

    if (questionError || !questionRow) {
      return res.status(404).json({ error: "Question not found" });
    }

    const questions = (questionRow as QuestionRow).questions;
    const question = Array.isArray(questions)
      ? questions[parsed.questionIndex]
      : parsed.questionIndex === 0
        ? questions
        : null;

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing NVIDIA_API_KEY" });
    }

    const model = process.env.NVIDIA_SOLUTION_MODEL ?? DEFAULT_MODEL;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 150000);

    const nvidiaResponse = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: buildPrompt(questionRow as QuestionRow, question),
          max_tokens: 1024,
          temperature: 0.1,
          top_p: 0.7,
          stream: false,
        }),
        signal: controller.signal,
      },
    );

    if (!nvidiaResponse.ok) {
      clearTimeout(timeout);
      const raw = await nvidiaResponse.text();
      console.error("NVIDIA solution error:", nvidiaResponse.status, raw);
      return res.status(502).json({ error: "Failed to generate solution" });
    }

    const data = await nvidiaResponse.json();
    clearTimeout(timeout);
    const solution = data?.choices?.[0]?.message?.content?.trim();

    if (!solution) {
      return res.status(502).json({ error: "NVIDIA returned no solution" });
    }

    const { error: insertError } = cacheTableMissing
      ? { error: null }
      : await supabase.from("ai_solutions").insert({
          question_id: body.questionId,
          question_row_id: parsed.rowId,
          question_index: parsed.questionIndex,
          solution_text: solution,
          model,
          prompt_version: PROMPT_VERSION,
        });

    if (insertError) {
      console.error("Solution cache insert error:", insertError);
    }

    return res.status(200).json({
      solution,
      cached: false,
      model,
      promptVersion: PROMPT_VERSION,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return res.status(504).json({ error: "NVIDIA request timed out" });
    }

    console.error("Solution handler error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

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
  try {
    if (typeof body === "string") {
      return JSON.parse(body);
    }
    return (body ?? {}) as RequestBody;
  } catch {
    throw new Error("Invalid request body");
  }
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
      content: `You are generating answers for college lab examinations.

        Return ONLY what a student would write in the answer sheet.

        Rules:

        - Return only the final answer.
        - If programming code is required, return only the complete code.
        - Do not provide explanations.
        - Do not provide reasoning.
        - Do not provide steps.
        - Do not provide notes.
        - Do not provide complexity analysis.
        - Programming Output Rules:
          - If the answer is a program, return only the complete source code.
          - Use standard code formatting and indentation.
          - Do not include explanations before or after the code.
        - Do not add comments inside code unless the question explicitly asks for them.
        - Do not use markdown code fences.

        Programming Rules:

        - Prefer simple beginner-level solutions.
        - Use the most common college-lab approach.
        - Avoid advanced techniques.
        - Avoid clever optimizations.
        - Avoid design patterns.
        - Avoid abstractions that students normally would not write in exams.
        - Use straightforward procedural code.
        - Use descriptive variable names.
        - Keep code short and easy to understand.
        - For C programs use stdio.h unless additional headers are required.
        - For Java programs use a single class with main().
        - For Python programs use basic constructs only.
        - The output should look like something an average student can write in a lab exam and still receive full marks.

        If the question is unclear, choose the most common academic interpretation and answer directly.

        Return only the final answer.`
    },
    {
      role: "user",
      content: `
        Semester: ${row.semester ?? ""}
        Subject: ${row.subject ?? ""}
        Evaluation: ${row.evaluation ?? ""}
        Section: ${row.section ?? ""}
        Year: ${row.year ?? ""}

        Question:
        ${question}
      `
    }
  ];
};


const getSupabaseClient = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;


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
        // Generating from AI directly without caching
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

    let nvidiaResponse: Response;

    try {
      nvidiaResponse = await fetch(
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
            max_tokens: 2048,
            temperature: 0,
            top_p: 1,
            stream: false,
          }),
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!nvidiaResponse.ok) {
      clearTimeout(timeout);
      const raw = await nvidiaResponse.text();
      console.error("NVIDIA solution error:", nvidiaResponse.status, raw);
      return res.status(502).json({ error: "Failed to generate solution" });
    }

    const data: any = await nvidiaResponse.json();
    clearTimeout(timeout);
    let solution = data?.choices?.[0]?.message?.content?.trim();

    if (solution) {
      solution = solution
        .replace(/^```[\w-]*\n?/, "")
        .replace(/\n?```$/, "")
        .trim();
    }

    if (!solution) {
      return res.status(502).json({ error: "NVIDIA returned no solution" });
    }

    const { error: insertError } = cacheTableMissing
      ? { error: null }
      : await supabase
        .from("ai_solutions")
        .upsert(
          {
            question_id: body.questionId,
            question_row_id: parsed.rowId,
            question_index: parsed.questionIndex,
            solution_text: solution,
            model,
            prompt_version: PROMPT_VERSION,
          },
          {
            onConflict: "question_id,prompt_version",
          }
        );

    if (insertError) {
      return res.status(500).json({
        error: "Cache insert failed",
        details: insertError,
      });
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

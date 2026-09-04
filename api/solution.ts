import { createClient } from "@supabase/supabase-js";

const PROMPT_VERSION = "v1";
const DEFAULT_MODEL = "Qwen/Qwen2.5-Coder-32B-Instruct";

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

  if (separatorIndex === -1) {
    return null;
  }

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

Programming Output Rules:

- If the answer is a program, return only the complete source code.
- Use standard code formatting and indentation.
- Do not include explanations before or after the code.
- Do not add comments inside code unless the question explicitly asks for them.
- Do not use markdown code fences.
- If its a Assembly language program, follow ARM architecture guidelines and return the simplest Assembly code.

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

Return only the final answer.`,
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
`,
    },
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

    // ---------------------------------------------------------
    // CHECK CACHE FIRST
    // ---------------------------------------------------------

    const { data: cached, error: cacheError } = await supabase
      .from("ai_solutions")
      .select("solution_text, model, prompt_version")
      .eq("question_id", body.questionId)
      .eq("prompt_version", PROMPT_VERSION)
      .maybeSingle();

    const cacheTableMissing = cacheError?.code === "PGRST205";

    if (cacheError) {
      if (cacheTableMissing) {
        // no-op
      } else {
        console.error("Solution cache read error:", cacheError);

        return res.status(500).json({
          error: "Failed to read solution cache",
        });
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

    // ---------------------------------------------------------
    // GET QUESTION
    // ---------------------------------------------------------

    const { data: questionRow, error: questionError } = await supabase
      .from("questions")
      .select("id, semester, subject, evaluation, section, year, questions")
      .eq("id", parsed.rowId)
      .single();

    if (questionError || !questionRow) {
      return res.status(404).json({
        error: "Question not found",
      });
    }

    const questions = (questionRow as QuestionRow).questions;

    const question = Array.isArray(questions)
      ? questions[parsed.questionIndex]
      : parsed.questionIndex === 0
        ? questions
        : null;

    if (!question) {
      return res.status(404).json({
        error: "Question not found",
      });
    }

    // ---------------------------------------------------------
    // HUGGING FACE API
    // ---------------------------------------------------------

    const apiKey = process.env.HF_TOKEN;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing HF_TOKEN",
      });
    }

    const model = process.env.HF_SOLUTION_MODEL ?? DEFAULT_MODEL;

    // ---------------------------------------------------------
    // TIMEOUT
    // ---------------------------------------------------------

    const controller = new AbortController();

    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 60000);

    let hfResponse: Response;

    console.log("[solution] calling Hugging Face", {
      model,
      questionId: body.questionId,
    });

    try {
      hfResponse = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },

          body: JSON.stringify({
            model,

            messages: buildPrompt(questionRow as QuestionRow, question),

            // Keep this low because your answers are simple.
            max_tokens: 1024,

            // Low temperature gives more deterministic answers.
            temperature: 0.2,

            // Streaming lets the response start arriving sooner.
            stream: true,
          }),

          signal: controller.signal,
        },
      );
    } catch (fetchError) {
      clearTimeout(timeout);

      console.error("[solution] Hugging Face fetch() threw", fetchError);

      if (timedOut) {
        return res.status(504).json({
          error: "Hugging Face request timed out",
        });
      }

      throw fetchError;
    }

    console.log("[solution] Hugging Face responded", hfResponse.status);

    // ---------------------------------------------------------
    // API ERROR
    // ---------------------------------------------------------

    if (!hfResponse.ok) {
      clearTimeout(timeout);

      const raw = await hfResponse.text();

      console.error("Hugging Face solution error:", hfResponse.status, raw);

      return res.status(502).json({
        error: "Failed to generate solution",
      });
    }

    // ---------------------------------------------------------
    // READ STREAM
    // ---------------------------------------------------------

    let solution = "";
    let chunkCount = 0;

    const reader = hfResponse.body?.getReader();

    const decoder = new TextDecoder();

    let buffer = "";

    try {
      if (reader) {
        while (true) {
          if (timedOut) {
            throw new Error("Stream read timed out");
          }

          const { done, value } = await reader.read();

          if (done) {
            console.log(
              "[solution] stream done, total chunks:",
              chunkCount,
              "chars:",
              solution.length,
            );

            break;
          }

          chunkCount++;

          if (chunkCount % 20 === 0) {
            console.log(
              "[solution] chunk",
              chunkCount,
              "chars so far:",
              solution.length,
            );
          }

          buffer += decoder.decode(value, {
            stream: true,
          });

          const lines = buffer.split("\n");

          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed.startsWith("data:")) {
              continue;
            }

            const payload = trimmed.slice(5).trim();

            if (payload === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(payload);

              const delta = parsed?.choices?.[0]?.delta?.content;

              if (delta) {
                solution += delta;
              }
            } catch {
              // Ignore malformed/incomplete stream chunks.
            }
          }
        }
      }
    } catch (streamError) {
      clearTimeout(timeout);

      if (timedOut) {
        return res.status(504).json({
          error: "Hugging Face stream timed out",
        });
      }

      throw streamError;
    }

    clearTimeout(timeout);

    solution = solution.trim();

    // ---------------------------------------------------------
    // REMOVE MARKDOWN CODE FENCES
    // ---------------------------------------------------------

    if (solution) {
      solution = solution
        .replace(/^```[\w-]*\n?/, "")
        .replace(/\n?```$/, "")
        .trim();
    }

    // ---------------------------------------------------------
    // EMPTY RESPONSE
    // ---------------------------------------------------------

    if (!solution) {
      return res.status(502).json({
        error: "Hugging Face returned no solution",
      });
    }

    // ---------------------------------------------------------
    // SAVE TO CACHE
    // ---------------------------------------------------------

    const { error: insertError } = cacheTableMissing
      ? { error: null }
      : await supabase.from("ai_solutions").upsert(
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
          },
        );

    if (insertError) {
      console.error("Solution cache insert error:", insertError);
    }

    // ---------------------------------------------------------
    // RETURN RESPONSE
    // ---------------------------------------------------------

    return res.status(200).json({
      solution,
      cached: false,
      model,
      promptVersion: PROMPT_VERSION,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return res.status(504).json({
        error: "Hugging Face request timed out",
      });
    }

    console.error("Solution handler error:", error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

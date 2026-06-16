create table if not exists public.ai_solutions (
  id uuid primary key default gen_random_uuid(),
  question_id text not null,
  question_row_id uuid not null references public.questions(id) on delete cascade,
  question_index integer not null check (question_index >= 0),
  solution_text text not null,
  model text not null,
  prompt_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, prompt_version)
);

alter table public.ai_solutions enable row level security;

create policy "Anyone can read AI solutions"
  on public.ai_solutions
  for select
  using (true);

create index if not exists ai_solutions_question_lookup
  on public.ai_solutions (question_id, prompt_version);

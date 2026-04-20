import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, MessageSquarePlus, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "feedback_done";
const WORD_LIMIT = 50;

const countWords = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
const LABELS = ["Terrible", "Bad", "Okay", "Good", "Amazing"];

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function StarRow({
  rating, hovered,
  setRating, setHovered,
}: {
  rating: number; hovered: number;
  setRating: (n: number) => void; setHovered: (n: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((i) => {
          const active = i <= (hovered || rating);
          return (
            <motion.button
              key={i}
              type="button"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHovered(i)}
              onClick={() => setRating(i)}
              className={`
                w-10 h-10 rounded-xl text-xl transition-all duration-150 focus:outline-none
                ${active
                  ? "bg-violet-500/20 text-violet-400 scale-110 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                  : "bg-white/5 text-zinc-600 hover:bg-white/10 hover:text-zinc-400"}
              `}
            >
              ★
            </motion.button>
          );
        })}
      </div>
      <span className={`text-xs font-medium transition-all duration-200 h-4
        ${(hovered || rating) ? "text-violet-400 opacity-100" : "opacity-0"}`}>
        {LABELS[(hovered || rating) - 1] ?? ""}
      </span>
    </div>
  );
}

export default function FeedbackModal() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    setVisible(true); 
    setOpen(false);
  }, []);

  if (!visible) return null;

  const wordCount = countWords(note);
  const overLimit = wordCount > WORD_LIMIT;

  async function handleSubmit() {
    setError("");
    if (!rating) { setError("Please pick a rating first."); return; }
    if (overLimit) { setError(`Keep it under ${WORD_LIMIT} words.`); return; }

    setSubmitting(true);

    const { error: dbErr } = await supabase
      .from("feedback")
      .insert({ rating, note: note.trim() });

    if (dbErr) {
      setError("Something went wrong. Try again?");
      setSubmitting(false);
      return;
    }

    localStorage.setItem(STORAGE_KEY, "true");
    setSubmitted(true);
    setTimeout(() => setVisible(false), 2200);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">

      {/* Floating panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`
              w-[320px] rounded-2xl overflow-hidden
              border border-white/10
              bg-zinc-950/95 backdrop-blur-xl
              shadow-[0_8px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)]
            `}
          >

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
            >

              <div className="h-[2px] w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" />

              <motion.div variants={fadeUp} className="flex items-start justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <Sparkles size={13} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">Share your feedback</p>
                    <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">Helps us improve · 10 seconds</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors mt-0.5"
                >
                  <X size={15} />
                </motion.button>
              </motion.div>

              <motion.div variants={fadeUp} className="px-4 pb-4 space-y-4">

                {submitted ? (
                  <div className="flex flex-col items-center gap-2 py-5 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center mb-1">
                      <Check className="h-6 w-6 text-violet-400" />
                    </div>
                    <p className="font-semibold text-white text-sm">Feedback sent</p>
                    <p className="text-xs text-zinc-500">Thanks for helping us improve.</p>
                  </div>
                ) : (
                  <>
                    <div className="h-px bg-white/5" />

                    <StarRow
                      rating={rating} hovered={hovered}
                      setRating={setRating} setHovered={setHovered}
                    />

                    <div className="space-y-1.5">
                      <Textarea
                        placeholder="Anything you'd like us to know? (optional)"
                        className="resize-none text-xs min-h-[80px] rounded-xl bg-white/[0.04] border-white/10 text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        disabled={submitting}
                      />

                      <div className="flex justify-between items-center">
                        {error
                          ? <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                                <span className="w-1 h-1 rounded-full bg-violet-400" />
                                <p className="font-medium tracking-tight">
                                    {error === "Please pick a rating first."
                                    ? "Select a rating to continue"
                                    : error}
                                </p>
                            </div>
                          : <span />
                        }
                        <p className={`text-[11px] ml-auto ${overLimit ? "text-red-400 font-medium" : "text-zinc-600"}`}>
                          {wordCount}/{WORD_LIMIT}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() =>{ setOpen(false); setError(""); setRating(0); }}
                        className="text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors"
                        disabled={submitting}
                      >
                        Maybe later
                      </button>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          onClick={handleSubmit}
                          disabled={submitting || overLimit}
                          className="h-8 px-4 text-xs font-medium rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border-0 text-white shadow-[0_2px_12px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {submitting ? "Sending..." : "Send feedback"}
                        </Button>
                      </motion.div>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed button  */}
      {!open && !submitted && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setError(""); setOpen(true);}}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-zinc-400 hover:text-white text-xs font-medium transition-all duration-200"
        >
          <MessageSquarePlus size={14} className="text-violet-400" />
          <span>Feedback</span>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
        </motion.button>
      )}
    </div>
  );
}
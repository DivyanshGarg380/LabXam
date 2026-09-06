import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  deleteOldResolvedReports,
  sendReport,
} from "@/supabase/reports";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Report() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const REPORT_COOLDOWN_KEY = "report_cooldown";
  const COOLDOWN_TIME = 2 * 60 * 1000;

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const lastSubmitted = localStorage.getItem(REPORT_COOLDOWN_KEY);

      if (lastSubmitted) {
        const diff = Date.now() - Number(lastSubmitted);
        const remaining = Math.max(0, COOLDOWN_TIME - diff);
        setCooldown(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    deleteOldResolvedReports();
    setLoading(false);
  }, []);

  const handleSubmit = async () => {
    const lastSubmitted = localStorage.getItem(REPORT_COOLDOWN_KEY);

    if (lastSubmitted) {
      const diff = Date.now() - Number(lastSubmitted);

      if (diff < COOLDOWN_TIME) {
        const remaining = Math.ceil((COOLDOWN_TIME - diff) / 1000);
        toast.error(`Please wait ${remaining}s before submitting again`);
        return;
      }
    }

    if (!message.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    if (message.length < 10 || message.length > 500) {
      toast.error("Report should be between 10 and 500 characters");
      return;
    }

    setSubmitting(true);
    const id = await sendReport(message);
    setSubmitting(false);

    if (id) {
      localStorage.setItem(REPORT_COOLDOWN_KEY, Date.now().toString());
      setMessage("");
      toast.success("Report submitted. We'll look into it");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading report page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main Content */}
      <div className="px-4 pt-10 pb-24 sm:pt-12 sm:pb-28 flex flex-col items-center">

        <div className="w-full max-w-xl mb-4">
          <button
            onClick={() => navigate("/", { replace: true })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>

        {/* Header */}
        <div className="w-full max-w-xl text-center mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Report an Issue
          </h1>
          <p className="text-sm text-muted-foreground">
            Found something broken or incorrect? Help us improve LabXam.
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">

          <Textarea
            placeholder="Describe the issue clearly…"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            className="resize-none rounded-xl"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Be as specific as possible</span>
            <span>{message.length}/500</span>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 h-11 rounded-xl"
              onClick={handleSubmit}
              disabled={submitting || cooldown > 0}
            >
              {submitting
                ? "Submitting…"
                : cooldown > 0
                ? `Wait ${cooldown}s`
                : "Submit Report"}
            </Button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border pt-5 pb-5 text-center space-y-1 bg-background">
        <p className="text-sm text-muted-foreground">
          For the students of{" "}
          <span className="font-medium text-foreground">MIT Manipal</span>
        </p>

        <p className="text-xs text-muted-foreground flex flex-wrap justify-center items-center gap-x-1">

          <a
            href="https://github.com/DivyanshGarg380/LabXam"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline whitespace-nowrap"
          >
            Open Source
          </a>

          <span className="whitespace-nowrap">• Built by</span>

          <a
            href="https://github.com/Vidhan-152"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline whitespace-nowrap"
          >
            Vidhan
          </a>

          <span>&</span>

          <a
            href="https://github.com/DivyanshGarg380"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline whitespace-nowrap"
          >
            Divyansh
          </a>

          <span>•</span>

          <Link
            to="/report"
            className="hover:text-foreground transition underline-offset-4 hover:underline whitespace-nowrap"
          >
            Report
          </Link>

        </p>
      </div>
    </div>
  );
}
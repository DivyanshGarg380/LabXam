import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  deleteOldResolvedReports,
  sendReport,
  fetchMyReports,
} from "@/supabase/reports";
import { CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

type Report = {
  id: string;
  message: string;
  resolved: boolean;
  createdAt: Date | null;
};

export default function Report() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    deleteOldResolvedReports();
    loadReports().finally(() => setLoading(false));
  }, []);

  const loadReports = async () => {
    const data = await fetchMyReports();
    setReports(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
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
      setMessage("");
      toast.success("Report submitted. We'll look into it :)");
      await loadReports();
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">

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
            placeholder="Describe the issue clearly… (what happened, where, expected behavior)"
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
              // disabled={submitting}
              disabled
            >
              {submitting ? "Submitting…" : "Feature Coming Soon!"}
            </Button>

            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl"
              onClick={() => navigate("/", { replace: true })}
            >
              Back
            </Button>
          </div>
        </div>

        {/* Reports */}
        {reports.length > 0 && (
          <div className="w-full max-w-xl mt-10 space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-card border border-border rounded-xl p-4 flex items-start gap-3"
              >
                {r.resolved ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                )}

                <div className="flex-1 space-y-1">
                  <p className="text-sm line-clamp-3">{r.message}</p>

                  <div className="flex items-center gap-2 text-xs">
                    {r.createdAt && (
                      <span className="text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-md ${
                        r.resolved
                          ? "bg-green-500/10 text-green-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.resolved ? "Resolved" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border py-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          For the students of{" "}
          <span className="font-medium text-foreground">MIT Manipal</span>
        </p>

        <p className="text-xs text-muted-foreground">
          Built by{" "}
          <a
            href="https://github.com/Vidhan-152"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            Vidhan
          </a>
          {" & "}
          <a
            href="https://github.com/DivyanshGarg380"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            Divyansh
          </a>
          {" • "}
          <Link
            to="/report"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            Report an issue
          </Link>
        </p>
      </div>
    </div>
  );
}

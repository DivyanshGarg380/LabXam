import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  deleteOldResolvedReports,
  sendReport,
  fetchMyReports,
  type Report,
  type ReportStatus,
} from "@/supabase/reports";
import { CheckCircle2, Clock, RefreshCw, ListChecks, Eye, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_META: Record<
  ReportStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  in_review: {
    label: "In Review",
    icon: Eye,
    className: "bg-blue-500/10 text-blue-500",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    className: "bg-green-500/10 text-green-600",
  },
  declined: {
    label: "Declined",
    icon: XCircle,
    className: "bg-red-500/10 text-red-500",
  },
};

export default function Report() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [myReportsOpen, setMyReportsOpen] = useState(false);
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
      <div className="flex-1 px-4 pb-24 sm:pb-28 flex flex-col items-center justify-center">

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
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit Report"}
            </Button>

            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl"
              onClick={() => navigate("/", { replace: true })}
            >
              Back
            </Button>
          </div>

          {reports.length > 0 && (
            <button
              onClick={() => setMyReportsOpen(true)}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition py-1"
            >
              <ListChecks className="h-4 w-4" />
              View my reports
              <span className="px-1.5 py-0.5 rounded-md bg-muted text-xs">
                {reports.length}
              </span>
            </button>
          )}
        </div>
      </div>

      <Dialog open={myReportsOpen} onOpenChange={setMyReportsOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle>My Reports</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {reports.map((r) => {
              const meta = STATUS_META[r.status];
              const StatusIcon = meta.icon;
              return (
                <div
                  key={r.id}
                  className="bg-card border border-border rounded-xl p-4 flex items-start gap-3"
                >
                  <StatusIcon className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />

                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm break-words">{r.message}</p>

                    <div className="flex items-center gap-2 text-xs">
                      {r.createdAt && (
                        <span className="text-muted-foreground">
                          {formatDate(r.createdAt)}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-md ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

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
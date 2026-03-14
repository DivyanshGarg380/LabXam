import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { deleteOldResolvedReports } from "@/firebase/report";

export default function Report() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
        setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    deleteOldResolvedReports();
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    if(message.length < 10 || message.length > 500) {
        toast.error("Rpeort message should be descriptive...")
    } 

    try {
      await addDoc(collection(db, "reports"), {
        message,
        createdAt: serverTimestamp(),
        resolved: false,
      });

      setMessage("");
      toast.success("Report submitted. We'll look into it :)");
    } catch (error) {
      toast.error("Failed to submit report");
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground text-sm">
                Loading report page...
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Report an Issue</h1>
          <p className="text-sm text-muted-foreground">
            Found a bug? Let us know.
          </p>
        </div>

        <Textarea
          placeholder="Describe the issue..."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="flex flex-col gap-3">
            <Button className="w-full h-11" disabled onClick={handleSubmit}>
                Feature coming soon!
            </Button>

            <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => navigate("/", { replace: true })}
            >
                Back to Home
            </Button>

        </div>
      </div>
    </div>
  );
}
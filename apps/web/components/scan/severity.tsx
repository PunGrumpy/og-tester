import { AlertCircle, AlertTriangle, Info } from "lucide-react";

import type { Diagnostic } from "@/hooks/use-scanner-store";

export const getSeverityIcon = (sev: Diagnostic["severity"]) => {
  switch (sev) {
    case "error": {
      return <AlertCircle className="size-4 text-destructive shrink-0" />;
    }
    case "warning": {
      return <AlertTriangle className="size-4 text-warning shrink-0" />;
    }
    default: {
      return <Info className="size-4 text-info shrink-0" />;
    }
  }
};

export const getSeverityBg = (sev: Diagnostic["severity"]) => {
  switch (sev) {
    case "error": {
      return "bg-destructive/5 border-destructive/10";
    }
    case "warning": {
      return "bg-warning/5 border-warning/10";
    }
    default: {
      return "bg-info/5 border-info/10";
    }
  }
};

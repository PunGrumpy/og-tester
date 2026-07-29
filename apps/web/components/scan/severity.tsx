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

/**
 * A tinted rail on one edge instead of a full wash. Stacking five full-bleed
 * severity tints turns the list into four competing pastel blocks; the rail
 * keeps the colour coding while the rows stay on the page background.
 */
export const getSeverityRail = (sev: Diagnostic["severity"]) => {
  switch (sev) {
    case "error": {
      return "before:bg-destructive";
    }
    case "warning": {
      return "before:bg-warning";
    }
    default: {
      return "before:bg-info";
    }
  }
};

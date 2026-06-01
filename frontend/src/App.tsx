import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IntakePage } from "./pages/IntakePage";
import { PlanningPage } from "./pages/PlanningPage";
import { createTrip } from "./lib/api";
import { DESTINATIONS } from "./lib/constants";
import type { TripIntake } from "./types";

const DEFAULT_INTAKE: TripIntake = {
  origin: "London",
  destination: "lisbon",
  destCode: "LIS",
  dateMode: "exact",
  dateLabel: "12–16 June 2026",
  dateExact: "12–16 June 2026",
  dateMonth: "June 2026",
  tripDays: 5,
  travellers: 2,
  budgetGbp: 2500,
  interests: ["food", "history", "architecture"],
};

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") ?? "light";
  });
  const [intake, setIntakeState] = useState<TripIntake>(DEFAULT_INTAKE);
  const [page, setPage] = useState<"intake" | "planning">("intake");
  const [tripId, setTripId] = useState<string | null>(null);
  const [initialMessage, setInitialMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  function setIntake(partial: Partial<TripIntake>) {
    setIntakeState((prev) => {
      const next = { ...prev, ...partial };
      if (partial.destination) {
        const dest = DESTINATIONS.find((d) => d.id === partial.destination);
        if (dest) next.destCode = dest.code;
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (intake.interests.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const { tripId: id } = await createTrip(intake);
      const dest = DESTINATIONS.find((d) => d.id === intake.destination);
      const msg = `Plan my trip to ${dest?.city ?? intake.destination} — ${
        intake.tripDays
      } days, ${intake.travellers} ${
        intake.travellers === 1 ? "person" : "people"
      }, budget £${intake.budgetGbp.toLocaleString()}, dates ${
        intake.dateLabel
      }. Interests: ${intake.interests.join(", ")}.`;
      setTripId(id);
      setInitialMessage(msg);
      setPage("planning");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 24 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: {
      opacity: 0,
      y: -16,
      transition: { duration: 0.3, ease: "easeIn" as const },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {page === "planning" && tripId ? (
        <motion.div
          key="planning"
          className="app"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <PlanningPage
            tripId={tripId}
            intake={intake}
            setIntake={setIntake}
            theme={theme}
            onToggleTheme={() =>
              setTheme((t) => (t === "light" ? "dark" : "light"))
            }
            initialMessage={initialMessage}
          />
        </motion.div>
      ) : (
        <motion.div
          key="intake"
          className="app"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {error && (
            <div
              style={{
                padding: "12px 20px",
                background: "var(--error-container)",
                color: "var(--on-error-container)",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}
          <IntakePage
            state={intake}
            set={setIntake}
            onSubmit={loading ? () => {} : handleSubmit}
            isLoading={loading}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

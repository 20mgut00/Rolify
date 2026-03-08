import TextField from "@mui/material/TextField";
import { useState, useEffect, useRef } from "react";
import { CircleX, Minus, Plus } from "lucide-react";
import Button from "../common/Button";
import { useTranslation } from "react-i18next";

// Infamia:  0–9 marks  → 3 marks per level → nivel 0, -1, -2, -3
// Prestigio: 0–15 marks → 5 marks per level → nivel 0, +1, +2, +3

const NOTORIETY_MAX = 9;
const PRESTIGE_MAX = 15;

// 0-2 → 0,  3-5 → -1,  6-8 → -2,  9 → -3
const marksToNotoriety = (marks: number): number => {
  if (marks <= 2) return 0;
  if (marks <= 5) return -1;
  if (marks <= 8) return -2;
  return -3;
};

// 0-4 → 0,  5-9 → +1,  10-14 → +2,  15 → +3
const marksToPrestige = (marks: number): number => {
  if (marks <= 4) return 0;
  if (marks <= 9) return 1;
  if (marks <= 14) return 2;
  return 3;
};

type FactionItem = {
  id: number;
  name: string;
  notorietyMarks: number; // 0–9  (stored directly in DB)
  prestigeMarks: number;  // 0–15 (stored directly in DB)
};

type ReputationEntry = {
  name: string;
  notoriety: number; // 0 to -3
  prestige: number;  // 0 to +3
};

type ReputationSelectorProps = {
  onChange?: (entries: ReputationEntry[]) => void;
  backgroundAnswers?: Array<{ question: string; answer: string }>;
  initialValues?: ReputationEntry[];
};

export default function ReputationSelector({
  onChange,
  backgroundAnswers,
  initialValues,
}: ReputationSelectorProps) {
  const { t } = useTranslation();
  const onChangeRef = useRef(onChange);
  const hasInitialized = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [factions, setFactions] = useState<FactionItem[]>(
    initialValues && initialValues.length > 0
      ? initialValues.map((rep, idx) => ({
          id: idx,
          name: rep.name,
          notorietyMarks: rep.notoriety,
          prestigeMarks: rep.prestige,
        }))
      : [{ id: 0, name: "", notorietyMarks: 0, prestigeMarks: 0 }]
  );

  // Initialize from initialValues only once (editing mode)
  useEffect(() => {
    if (initialValues && initialValues.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setFactions(
        initialValues.map((rep, idx) => ({
          id: idx,
          name: rep.name,
          notorietyMarks: rep.notoriety,
          prestigeMarks: rep.prestige,
        }))
      );
    }
  }, [initialValues]);

  // Emit changes upstream (skip first render to avoid loop on init)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const seen = new Set<string>();
    const entries: ReputationEntry[] = factions
      .filter((f) => f.name.trim() !== "")
      .filter((f) => {
        const key = f.name.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((f) => ({
        name: f.name.trim(),
        notoriety: f.notorietyMarks,
        prestige: f.prestigeMarks,
      }));

    onChangeRef.current?.(entries);
  }, [factions]);

  const updateFaction = (id: number, updates: Partial<FactionItem>) => {
    setFactions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const isDuplicate = (id: number): boolean => {
    const current = factions.find((f) => f.id === id);
    const name = current?.name.trim().toLowerCase();
    return (
      !!name && factions.some((f) => f.id !== id && f.name.trim().toLowerCase() === name)
    );
  };

  const servedMost = backgroundAnswers?.[3]?.answer?.trim().toLowerCase();
  const specialEnmity = backgroundAnswers?.[4]?.answer?.trim().toLowerCase();

  const handleNameChange = (id: number, newName: string) => {
    const norm = newName.trim().toLowerCase();
    const current = factions.find((f) => f.id === id);
    const updates: Partial<FactionItem> = { name: newName };

    // Auto-apply background bonus marks when name matches (only if not already set)
    if (servedMost && norm === servedMost && !current?.prestigeMarks) {
      updates.prestigeMarks = 2;
    }
    if (specialEnmity && norm === specialEnmity && !current?.notorietyMarks) {
      updates.notorietyMarks = 1;
    }

    updateFaction(id, updates);
  };

  return (
    <div className="space-y-3">
      <Button
        label={t('reputationSelector.addFaction')}
        onClick={() =>
          setFactions((prev) => [
            ...prev,
            { id: Date.now(), name: "", notorietyMarks: 0, prestigeMarks: 0 },
          ])
        }
        disabled={factions.some((f) => !f.name.trim())}
        verticalPadding="py-1"
        horizontalPadding="px-2"
      />

      {factions.map((faction) => {
        const nameNorm = faction.name.trim().toLowerCase();
        const isServedMost = !!servedMost && nameNorm === servedMost;
        const isEnmity = !!specialEnmity && nameNorm === specialEnmity;
        const duplicate = isDuplicate(faction.id);
        const disabled = !faction.name.trim() || duplicate;

        const notorietyLevel = marksToNotoriety(faction.notorietyMarks);
        const prestigeLevel = marksToPrestige(faction.prestigeMarks);

        return (
          <div
            key={faction.id}
            className="border border-accent-gold/30 rounded-lg p-4 bg-primary/10 space-y-3"
          >
            {/* Header: name input + remove button */}
            <div className="flex items-end gap-2">
              <TextField
                variant="standard"
                value={faction.name}
                onChange={(e) => handleNameChange(faction.id, e.target.value)}
                placeholder={t('reputationSelector.factionNamePlaceholder')}
                error={duplicate}
                helperText={duplicate ? t('reputationSelector.duplicateName') : undefined}
                fullWidth
                sx={{
                  "& .MuiInputBase-input": { color: "var(--color-primary-dark)" },
                  "& .MuiInputBase-input::placeholder": {
                    color: "var(--color-primary-dark)",
                    opacity: 0.6,
                  },
                  "& .MuiFormHelperText-root": { color: "#DC143C" },
                }}
                slotProps={{
                  input: {
                    className:
                      "text-primary-dark font-merriweather text-sm border-b-2 border-accent-gold",
                  },
                }}
              />
              <CircleX
                size={20}
                className="text-red-500 cursor-pointer hover:text-red-700 shrink-0 mb-1"
                onClick={() =>
                  setFactions((prev) => prev.filter((f) => f.id !== faction.id))
                }
              />
            </div>

            {/* Background bonus badges */}
            {(isServedMost || isEnmity) && (
              <div className="flex gap-2 flex-wrap">
                {isServedMost && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-green-600/50 text-green-400 bg-green-900/20">
                    {t('reputationSelector.prestigeFromBackground')}
                  </span>
                )}
                {isEnmity && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-red-600/50 text-red-400 bg-red-900/20">
                    {t('reputationSelector.notorietyFromBackground')}
                  </span>
                )}
              </div>
            )}

            {/* Counters row */}
            <div className="flex gap-8">
              {/* Infamia */}
              <div className="flex flex-col items-center gap-1.5 bg-red-900/10 rounded-lg p-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                  {t('characterViewer.notoriety')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateFaction(faction.id, {
                        notorietyMarks: Math.max(0, faction.notorietyMarks - 1),
                      })
                    }
                    disabled={disabled || faction.notorietyMarks <= 0}
                    className="w-7 h-7 flex items-center justify-center rounded border border-red-500 text-red-500
                               hover:bg-red-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span
                    className={`w-8 text-center text-lg font-bold font-merriweather ${
                      faction.notorietyMarks > 0 ? "text-red-500" : "text-primary-dark/40"
                    }`}
                  >
                    {faction.notorietyMarks}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateFaction(faction.id, {
                        notorietyMarks: Math.min(NOTORIETY_MAX, faction.notorietyMarks + 1),
                      })
                    }
                    disabled={disabled || faction.notorietyMarks >= NOTORIETY_MAX}
                    className="w-7 h-7 flex items-center justify-center rounded border border-red-500 text-red-500
                               hover:bg-red-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="text-xs text-red-500/80 font-medium">
                  {notorietyLevel === 0 ? t('reputationSelector.noNotoriety') : `${t('reputationSelector.level')} ${notorietyLevel}`}
                </span>
              </div>

              {/* Divider */}
              <div className="w-px bg-accent-gold/30 self-stretch" />

              {/* Prestigio */}
              <div className="flex flex-col items-center gap-1.5 bg-accent-gold/10 rounded-lg p-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-gold">
                  {t('characterViewer.prestige')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateFaction(faction.id, {
                        prestigeMarks: Math.max(0, faction.prestigeMarks - 1),
                      })
                    }
                    disabled={disabled || faction.prestigeMarks <= 0}
                    className="w-7 h-7 flex items-center justify-center rounded border border-accent-gold text-accent-gold
                               hover:bg-accent-gold/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span
                    className={`w-8 text-center text-lg font-bold font-merriweather ${
                      faction.prestigeMarks > 0 ? "text-accent-gold" : "text-primary-dark/40"
                    }`}
                  >
                    {faction.prestigeMarks}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateFaction(faction.id, {
                        prestigeMarks: Math.min(PRESTIGE_MAX, faction.prestigeMarks + 1),
                      })
                    }
                    disabled={disabled || faction.prestigeMarks >= PRESTIGE_MAX}
                    className="w-7 h-7 flex items-center justify-center rounded border border-accent-gold text-accent-gold
                               hover:bg-accent-gold/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="text-xs text-accent-gold/90 font-medium">
                  {prestigeLevel === 0 ? t('reputationSelector.noPrestige') : `${t('reputationSelector.level')} +${prestigeLevel}`}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

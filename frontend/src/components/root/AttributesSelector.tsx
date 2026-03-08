import { useState, useEffect } from "react";
import Radio from "@mui/material/Radio";
import { useTranslation } from "react-i18next";

interface Attribute {
  name: string;
  value: number;
}

interface AttributesSelectorProps {
  stats?: Array<{ name: string; value: number }>;
  onAttributesSelect?: (attributes: Attribute[]) => void;
  initialValues?: Attribute[];
}

const STAT_ORDER = ['charm', 'cunning', 'finesse', 'luck', 'might'] as const;

export default function AttributesSelector({
  stats = [],
  onAttributesSelect,
  initialValues,
}: AttributesSelectorProps) {
  const { t } = useTranslation();

  const getSelectedStat = () => {
    if (!initialValues?.length || !stats.length) return null;
    for (const init of initialValues) {
      const base = stats.find(s => s.name.toLowerCase() === init.name.toLowerCase());
      if (base && init.value > base.value) return base.name.toLowerCase();
    }
    return null;
  };

  const [selectedStat, setSelectedStat] = useState<string | null>(getSelectedStat);

  // Sync when switching class or loading an existing character
  useEffect(() => {
    setSelectedStat(getSelectedStat());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, stats]);

  const handleChange = (statName: string) => {
    const stat = stats.find(s => s.name.toLowerCase() === statName);
    if (!stat || stat.value + 1 > 2) return;
    const next = selectedStat === statName ? null : statName;
    setSelectedStat(next);
    onAttributesSelect?.(stats.map(s => ({
      name: s.name.charAt(0).toUpperCase() + s.name.slice(1),
      value: s.value + (s.name.toLowerCase() === next ? 1 : 0),
    })));
  };

  const renderStat = (statName: string) => {
    const stat = stats.find(s => s.name.toLowerCase() === statName);
    if (!stat) return null;
    const total = stat.value + (selectedStat === statName ? 1 : 0);
    const isDisabled = stat.value + 1 > 2;
    const label = t(`gameData.stats.${statName}` as never, { defaultValue: stat.name });
    return (
      <div className="flex items-center gap-4 p-3 border-2 border-accent-gold rounded-lg bg-primary-light">
        <Radio
          checked={selectedStat === statName}
          onChange={() => handleChange(statName)}
          disabled={isDisabled}
          size="medium"
        />
        <span className="text-lg text-primary-dark flex-1">{label}</span>
        <span className="text-2xl font-bold text-primary-dark px-4">
          {total > 0 ? '+' : ''}{total}
        </span>
      </div>
    );
  };

  return (
    <div className="text-start">
      {/* Mobile: lista vertical */}
      <div className="md:hidden space-y-2">
        {STAT_ORDER.map(stat => <div key={stat}>{renderStat(stat)}</div>)}
      </div>
      {/* Desktop: disposición en diamante */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        <div className="col-span-2">{renderStat("charm")}</div>
        <div className="col-span-2">{renderStat("cunning")}</div>
        <div className="col-span-2 col-start-2">{renderStat("finesse")}</div>
        <div className="col-span-2">{renderStat("luck")}</div>
        <div className="col-span-2">{renderStat("might")}</div>
      </div>
    </div>
  );
}

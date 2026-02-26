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

export default function AttributesSelector({
  stats = [],
  onAttributesSelect,
  initialValues,
}: AttributesSelectorProps) {
  const { t } = useTranslation();
  // Calculate which stat was selected based on initialValues
  const getInitialSelectedStat = () => {
    if (!initialValues || !stats.length) return null;

    // Find the stat that has a higher value in initialValues than in stats
    for (const initialStat of initialValues) {
      const baseStat = stats.find(s => s.name.toLowerCase() === initialStat.name.toLowerCase());
      if (baseStat && initialStat.value > baseStat.value) {
        return baseStat.name;
      }
    }
    return null;
  };

  const [selectedStat, setSelectedStat] = useState<string | null>(getInitialSelectedStat());

  // Update selected stat when initialValues change (for editing mode)
  useEffect(() => {
    if (initialValues) {
      setSelectedStat(getInitialSelectedStat());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, stats]);

  const handleChange = (statName: string) => {
    const stat = stats.find((s) => s.name === statName);
    if (!stat || stat.value + 1 > 2) return;

    const newSelectedStat = selectedStat === statName ? null : statName;
    setSelectedStat(newSelectedStat);

    const attributesData: Attribute[] = stats.map((s) => ({
      name: s.name.charAt(0).toUpperCase() + s.name.slice(1),
      value: s.value + (newSelectedStat === s.name ? 1 : 0),
    }));
    onAttributesSelect?.(attributesData);
  };

  const renderAttribute = (statName: string) => {
    const stat = stats.find((s) => s.name === statName);
    if (!stat) return null;

    const total = stat.value + (selectedStat === statName ? 1 : 0);
    const isDisabled = stat.value + 1 > 2;
    const sign = total > 0 ? "+" : "";
    const tg = (key: string, fallback: string) => { const r = (t as (k: string) => string)(key); return r === key ? fallback : r; };
    const label = tg(`gameData.stats.${stat.name}`, stat.name.charAt(0).toUpperCase() + stat.name.slice(1));

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
          {sign}
          {total}
        </span>
      </div>
    );
  };

  return (
    <div className="text-start">

      {/* Mobile: vertical list */}
      <div className="md:hidden space-y-2">
        {['charm', 'cunning', 'finesse', 'luck', 'might'].map((stat) => (
          <div key={stat}>{renderAttribute(stat)}</div>
        ))}
      </div>

      {/* Desktop: diamond layout */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        <div className="col-span-2">{renderAttribute("charm")}</div>
        <div className="col-span-2">{renderAttribute("cunning")}</div>
        <div className="col-span-2 col-start-2">
          {renderAttribute("finesse")}
        </div>
        <div className="col-span-2">{renderAttribute("luck")}</div>
        <div className="col-span-2">{renderAttribute("might")}</div>
      </div>
    </div>
  );
}

import TextField from "@mui/material/TextField";
import { useState, useEffect, useRef } from "react";
import RangeSlider from "../common/RangeSlider";
import { CircleX } from "lucide-react";
import Button from "../common/Button";

type SliderItem = {
  id: number;
  label: string;
  min: number;
  max: number;
};

type ReputationEntry = {
  name: string;
  notoriety: number;
  prestige: number;
};

type ReputationSelectorProps = {
  onChange?: (entries: ReputationEntry[]) => void;
  backgroundAnswers?: Array<{ question: string; answer: string }>;
  initialValues?: ReputationEntry[];
};

const reputationMarks = [
  { value: -9, label: "-3" },
  { value: -6, label: "-2" },
  { value: -3, label: "-1" },
  { value: 0, label: "0" },
  { value: 5, label: "1" },
  { value: 10, label: "2" },
  { value: 15, label: "3" },
];

// Convert real value (-3 to +3) to slider value
const toSliderValue = (realValue: number): number => {
  const mapping: Record<number, number> = {
    '-3': -9, '-2': -6, '-1': -3, '0': 0, '1': 5, '2': 10, '3': 15
  };
  return mapping[realValue] ?? 0;
};

// Convert slider value to real value (-3 to +3)
const toRealValue = (sliderValue: number): number => {
  const mapping: Record<number, number> = {
    '-9': -3, '-6': -2, '-3': -1, '0': 0, '5': 1, '10': 2, '15': 3
  };
  return mapping[sliderValue] ?? 0;
};

export default function ReputationSelector({
  onChange,
  backgroundAnswers,
  initialValues,
}: ReputationSelectorProps) {
  const isInitializing = useRef(true);
  const onChangeRef = useRef(onChange);
  const hasInitialized = useRef(false);

  // Keep ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [sliders, setSliders] = useState<SliderItem[]>(
    initialValues && initialValues.length > 0
      ? initialValues.map((rep, idx) => ({
          id: idx,
          label: rep.name,
          min: toSliderValue(rep.notoriety),
          max: toSliderValue(rep.prestige),
        }))
      : [{ id: 0, label: "", min: 0, max: 0 }]
  );

  // Initialize from initialValues only once on mount (for editing mode)
  useEffect(() => {
    if (initialValues && initialValues.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      isInitializing.current = true;
      setSliders(
        initialValues.map((rep, idx) => ({
          id: idx,
          label: rep.name,
          min: toSliderValue(rep.notoriety),
          max: toSliderValue(rep.prestige),
        }))
      );
    }
  }, [initialValues]);

  useEffect(() => {
    // Skip calling onChange during initialization to prevent infinite loop
    if (isInitializing.current) {
      isInitializing.current = false;
      return;
    }

    const servedMost = backgroundAnswers?.[3]?.answer?.trim().toLowerCase();
    const specialEnmity = backgroundAnswers?.[4]?.answer?.trim().toLowerCase();

    const entries: ReputationEntry[] = sliders
      .filter((s) => {
        const trimmedLabel = s.label.trim().toLowerCase();
        if (trimmedLabel === "") return false;

        const isDuplicate = sliders.some(
          (other) =>
            other.id !== s.id &&
            other.label.trim().toLowerCase() === trimmedLabel
        );
        return !isDuplicate;
      })
      .map((s) => {
        const labelNorm = s.label.trim().toLowerCase();
        const adjustedNotoriety =
          specialEnmity && labelNorm === specialEnmity
            ? Math.max(-9, s.min - 1)
            : s.min;
        const adjustedPrestige =
          servedMost && labelNorm === servedMost
            ? Math.min(15, s.max + 2)
            : s.max;
        return {
          name: s.label.trim(),
          notoriety: toRealValue(adjustedNotoriety),
          prestige: toRealValue(adjustedPrestige),
        };
      });
    onChangeRef.current?.(entries);
  }, [sliders, backgroundAnswers]);

  const handleRangeChange = (
    sliderId: number,
    minVal: number,
    maxVal: number
  ) => {
    setSliders((prev) =>
      prev.map((item) =>
        item.id === sliderId ? { ...item, min: minVal, max: maxVal } : item
      )
    );
  };

  const handleLabelChange = (sliderId: number, text: string) => {
    setSliders((prev) =>
      prev.map((item) =>
        item.id === sliderId ? { ...item, label: text } : item
      )
    );
  };

  const isDuplicateLabel = (sliderId: number): boolean => {
    const current = sliders.find((s) => s.id === sliderId);
    const trimmedLabel = current?.label.trim().toLowerCase();
    return (
      trimmedLabel !== "" &&
      sliders.some(
        (s) =>
          s.id !== sliderId && s.label.trim().toLowerCase() === trimmedLabel
      )
    );
  };

  const handleAddSlider = () => {
    setSliders((prev) => [
      ...prev,
      { id: Date.now(), label: "", min: 0, max: 0 },
    ]);
  };

  const handleRemoveSlider = (sliderId: number) => {
    setSliders((prev) => prev.filter((item) => item.id !== sliderId));
  };

  return (
    <div className="space-y-4">
      <Button
        label="Add new faction"
        onClick={handleAddSlider}
        verticalPadding="py-1"
        horizontalPadding="px-2"
      />

      {sliders.map((slider) => (
        <div key={slider.id} className="space-y-2 flex">
          <TextField
            variant="standard"
            value={slider.label}
            onChange={(e) => handleLabelChange(slider.id, e.target.value)}
            placeholder="Etiqueta"
            sx={{
              '& .MuiInputBase-input': { color: '#0F2B3A' },
              '& .MuiInputBase-input::placeholder': {
                color: '#0F2B3A',
                opacity: 1,
              },
            }}
            slotProps={{
              input: {
                className:
                  "text-primary-dark font-merriweather text-sm border-b-2 border-primary-dark mt-5 mr-3",
              },
            }}
          />

          <RangeSlider
            min={reputationMarks[0].value}
            max={reputationMarks[reputationMarks.length - 1].value}
            minValue={slider.min}
            maxValue={slider.max}
            step={1}
            marks={reputationMarks}
            onChange={(minVal: number, maxVal: number) =>
              handleRangeChange(slider.id, minVal, maxVal)
            }
            disabled={!slider.label.trim() || isDuplicateLabel(slider.id)}
          />

          <CircleX
            size={24}
            className="ml-2 text-red-600 cursor-pointer hover:text-red-800"
            onClick={() => handleRemoveSlider(slider.id)}
          />
        </div>
      ))}
    </div>
  );
}

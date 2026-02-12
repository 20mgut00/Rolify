import { useMemo, useCallback } from "react";

type Mark = {
  value: number;
  label?: string | number;
};

type RangeSliderProps = {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  step?: number; // default 0.1
  onChange: (minVal: number, maxVal: number) => void;
  marks?: Mark[]; // if not provided, auto-generates from min..max
  disabled?: boolean;
};

export default function RangeSlider({
  min,
  max,
  minValue,
  maxValue,
  step = 0.1,
  onChange,
  marks,
  disabled = false,
}: RangeSliderProps) {
  const ticks: Mark[] = useMemo(() => {
    if (marks && marks.length) {
      // Auto-generate ALL ticks (with and without labels)
      const arr: Mark[] = [];
      const markStep = Math.max(1, step);
      for (let v = min; v <= max; v += markStep) {
        // Check if this value has a label in marks
        const markWithLabel = marks.find((m) => m.value === v);
        arr.push({ value: v, label: markWithLabel?.label });
      }
      return arr;
    }
    // Auto-generate marks every 1 unit (or every step if larger)
    const arr: Mark[] = [];
    const markStep = Math.max(1, step);
    for (let v = min; v <= max; v += markStep) {
      arr.push({ value: v, label: v });
    }
    return arr;
  }, [marks, min, max, step]);

  const percentForValue = useCallback(
    (v: number) => ((v - min) / (max - min)) * 100,
    [min, max]
  );

  const minPercent = useMemo(
    () => percentForValue(minValue),
    [minValue, percentForValue]
  );
  const maxPercent = useMemo(
    () => percentForValue(maxValue),
    [maxValue, percentForValue]
  );

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newMin = Math.min(Number(e.target.value), maxValue, 0);
    onChange(newMin, maxValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newMax = Math.max(Number(e.target.value), minValue, 0);
    onChange(minValue, newMax);
  };

  return (
    <div
      className="w-full"
      style={{
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <div className="relative h-12 flex items-center">
        {/* Track background */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-primary-light border border-accent-gold/50" />

        {/* Range highlight (between min and max) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-accent-gold/30"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        {/* Min input (lower thumb) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full appearance-none bg-transparent focus:outline-none z-[3]
            [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-0
            [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:h-0
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-gold [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent-gold [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
          style={{
            zIndex: minValue > max - (max - min) / 2 ? 5 : 3,
          }}
        />

        {/* Max input (upper thumb) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full appearance-none bg-transparent focus:outline-none z-[4]
            [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-0
            [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:h-0
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-gold [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent-gold [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
          style={{
            zIndex: maxValue > max - (max - min) / 2 ? 4 : 3,
            transform: "translateY(-16px)",
          }}
        />
      </div>

      {/* Marks/Ticks */}
      <div className="relative mt-0" style={{ height: "40px" }}>
        {ticks.map((mark) => {
          const pct = ((mark.value - min) / (max - min)) * 100;
          return (
            <div
              key={mark.value}
              className="absolute top-0 -translate-x-1/2 text-xs text-primary-dark"
              style={{ left: `${pct}%` }}
            >
              <div className="w-px h-2 bg-accent-gold mx-auto" />
              {mark.label !== undefined && (
                <div className="mt-1 whitespace-nowrap text-xs">
                  {mark.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

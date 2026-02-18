import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import TextField from "@mui/material/TextField";

interface BackgroundAnswer {
  question: string;
  answer: string;
}

interface BackgroundSelectorProps {
  background?: Array<{ name: string; answers: string[] }>;
  onBackgroundSelect?: (background: BackgroundAnswer[]) => void;
  initialValues?: BackgroundAnswer[];
  disabled?: boolean;
}

export default function BackgroundSelector({
  background = [],
  onBackgroundSelect,
  initialValues,
  disabled = false,
}: BackgroundSelectorProps) {
  const { t } = useTranslation();
  const tg = (key: string, fallback: string) => { const r = (t as (k: string) => string)(key); return r === key ? fallback : r; };
  const [answers, setAnswers] = useState<string[]>(
    initialValues
      ? background.map((_, idx) => initialValues[idx]?.answer || "")
      : background.map(() => "")
  );

  // Update answers when initialValues change (for editing mode)
  useEffect(() => {
    if (initialValues) {
      setAnswers(background.map((_, idx) => initialValues[idx]?.answer || ""));
    }
  }, [initialValues, background]);

  const handleRadioChange = (questionIndex: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);

    const backgroundData: BackgroundAnswer[] = background.map((q, idx) => ({
      question: q.name,
      answer: newAnswers[idx] || "",
    }));
    onBackgroundSelect?.(backgroundData);
  };

  const handleTextChange = (questionIndex: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);

    const backgroundData: BackgroundAnswer[] = background.map((q, idx) => ({
      question: q.name,
      answer: newAnswers[idx] || "",
    }));
    onBackgroundSelect?.(backgroundData);
  };

  return (
    <div className="text-start">
      {background.map((question, index) => (
        <div key={question.name} className="mb-4">
          <h1 className="text-lg text-primary-dark mb-1 tracking-wide">
            {tg(`gameData.backgrounds.${question.name}.question`, question.name)}
          </h1>

          {question.answers.length > 0 ? (
            <RadioGroup
              value={answers[index] || ""}
              onChange={(e) => handleRadioChange(index, e.target.value)}
            >
              {question.answers.map((answer) => (
                <FormControlLabel
                  key={answer}
                  value={answer}
                  control={<Radio size="small" disabled={disabled} />}
                  label={tg(`gameData.backgrounds.${question.name}.answers.${answer}`, answer)}
                  disabled={disabled}
                  sx={{
                    opacity: disabled ? 0.6 : 1,
                    '& .MuiFormControlLabel-label.Mui-disabled': {
                      color: 'var(--color-primary-dark)',
                    },
                  }}
                  slotProps={{
                    typography: {
                      className: "text-primary-dark",
                    },
                  }}
                />
              ))}
            </RadioGroup>
          ) : (
            <TextField
              fullWidth
              variant="standard"
              placeholder={tg('gameData.placeholders.enterFactionName', "Enter faction's name")}
              value={answers[index] || ""}
              onChange={(e) => handleTextChange(index, e.target.value)}
              disabled={disabled}
              sx={{
                '& .MuiInputBase-input': {
                  color: 'var(--color-primary-dark)',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'var(--color-primary-dark)',
                  opacity: 1,
                },
                '& .MuiInputBase-root.Mui-disabled': {
                  color: 'var(--color-primary-dark)',
                  opacity: 0.6,
                  WebkitTextFillColor: 'var(--color-primary-dark)',
                },
                '& .MuiInputBase-input.Mui-disabled': {
                  color: 'var(--color-primary-dark)',
                  WebkitTextFillColor: 'var(--color-primary-dark)',
                },
              }}
              slotProps={{
                input: {
                  className:
                    "border-b-2 border-accent-gold",
                },
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

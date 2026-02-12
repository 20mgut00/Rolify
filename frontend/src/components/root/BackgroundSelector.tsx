import { useState, useEffect } from "react";
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
}

export default function BackgroundSelector({
  background = [],
  onBackgroundSelect,
  initialValues,
}: BackgroundSelectorProps) {
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
            {question.name}
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
                  control={<Radio size="small" />}
                  label={answer}
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
              placeholder={`Enter faction's name`}
              value={answers[index] || ""}
              onChange={(e) => handleTextChange(index, e.target.value)}
              sx={{
                '& .MuiInputBase-input': {
                  color: '#0F2B3A',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#0F2B3A',
                  opacity: 1,
                },
              }}
              slotProps={{
                input: {
                  className:
                    "border-b border-primary-dark",
                },
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

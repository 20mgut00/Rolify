import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TextField from "@mui/material/TextField";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { ChevronsDown } from "lucide-react";
import Typography from "@mui/material/Typography";

interface Connection {
  name: string;
  answer: string;
}

interface ConnectionsSelectorProps {
  connections?: Array<{ name: string; description: string }>;
  onConnectionsSelect?: (connections: Connection[]) => void;
  initialValues?: Connection[];
}

export default function ConnectionsSelector({
  connections = [],
  onConnectionsSelect,
  initialValues,
}: ConnectionsSelectorProps) {
  const { t } = useTranslation();
  const tg = (key: string, fallback: string) => { const r = (t as (k: string) => string)(key); return r === key ? fallback : r; };
  const [answers, setAnswers] = useState<string[]>(
    initialValues
      ? connections.map((_, idx) => initialValues[idx]?.answer || "")
      : connections.map(() => "")
  );

  // Update answers when initialValues change (for editing mode)
  useEffect(() => {
    if (initialValues) {
      setAnswers(connections.map((_, idx) => initialValues[idx]?.answer || ""));
    }
  }, [initialValues, connections]);

  const handleChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    const connectionsData: Connection[] = connections.map((c, idx) => ({
      name: c.name,
      answer: newAnswers[idx] || "",
    }));
    onConnectionsSelect?.(connectionsData);
  };

  return (
    <div className="text-start">
      {connections.map((connection, index) => (
        <div key={connection.name} className="mb-4">
          <Accordion
            disableGutters
            className="rounded-lg"
            sx={{
              backgroundColor: 'transparent',
              boxShadow: 'none',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary
              expandIcon={<ChevronsDown className="text-primary-dark" />}
              className="rounded-lg shadow-md"
              sx={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)',
                border: '2px solid rgba(217, 164, 65, 0.3)',
                '&:hover': { backgroundColor: 'var(--color-primary-light)' },
                '& .MuiAccordionSummary-content': { color: 'var(--color-primary-dark)' }
              }}
            >
              <Typography className="text-lg text-primary-dark font-semibold">
                {tg(`gameData.connections.${connection.name}.name`, connection.name)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
              <Typography className="text-sm text-primary-dark opacity-70 mb-2">
                {tg(`gameData.connections.${connection.name}.description`, connection.description)}
              </Typography>
            </AccordionDetails>
          </Accordion>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={tg('gameData.placeholders.enterYourAnswer', 'Enter your answer')}
            value={answers[index] || ""}
            sx={{
              marginTop: 1,
              '& .MuiInputBase-root': {
                backgroundColor: 'var(--color-primary-light)',
              },
              '& .MuiInputBase-input': { color: 'var(--color-primary-dark)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D9A441' },
              '& .MuiInputBase-input::placeholder': {
                color: 'var(--color-primary-dark)',
                opacity: 1,
              },
            }}
            onChange={(e) => handleChange(index, e.target.value)}
            
          />
        </div>
      ))}
    </div>
  );
}

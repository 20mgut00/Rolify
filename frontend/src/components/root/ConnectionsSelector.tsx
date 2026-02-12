import { useState, useEffect } from "react";
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
                backgroundColor: '#F2EDE4',
                color: '#0F2B3A',
                '&:hover': { backgroundColor: '#E8E3DB' },
                '& .MuiAccordionSummary-content': { color: '#0F2B3A' }
              }}
            >
              <Typography className="text-lg text-primary-dark font-semibold">
                {connection.name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'white', color: '#0F2B3A' }}>
              <Typography className="text-sm text-primary-dark opacity-70 mb-2">
                {connection.description}
              </Typography>
            </AccordionDetails>
          </Accordion>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={`Enter your answer`}
            value={answers[index] || ""}
            sx={{
              marginTop: 1,
              '& .MuiInputBase-root': { color: '#0F2B3A' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D9A441' },
              '& .MuiInputBase-input::placeholder': {
                color: '#0F2B3A',
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

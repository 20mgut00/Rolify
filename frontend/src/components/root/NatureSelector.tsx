import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { ChevronsDown } from "lucide-react";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

interface NatureSelectorProps {
  nature?: Array<{ name: string; description: string }>;
  value?: { name: string; description: string };
  onNatureSelect?: (nature: { name: string; description: string }) => void;
}

export default function NatureSelector({
  nature = [],
  value,
  onNatureSelect,
}: NatureSelectorProps) {
  const { t } = useTranslation();
  const tg = (key: string, fallback: string) => { const r = (t as (k: string) => string)(key); return r === key ? fallback : r; };
  const selectedValue = value?.name || nature[0]?.name || "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedName = event.target.value;
    const selectedItem =
      nature.find((n) => n.name === selectedName) ||
      (selectedName ? { name: selectedName, description: "" } : undefined);
    if (selectedItem) onNatureSelect?.(selectedItem);
  };

  if (!nature || nature.length === 0) {
    return <p className="text-sm text-primary-dark/60">No nature options available</p>;
  }

  return (
    <RadioGroup
      className="text-start"
      value={selectedValue}
      onChange={handleChange}
    >
      {nature.map((n) => (
        <Accordion
          key={n.name}
          disableGutters
          className="mb-3 rounded-lg"
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
            <FormControlLabel
              value={n.name}
              control={
                <Radio
                  onChange={(e) => {
                    e.stopPropagation();
                    handleChange(e);
                  }}
                  sx={{ color: 'var(--color-primary-dark)', '&.Mui-checked': { color: '#D9A441' } }}
                />
              }
              label={tg(`gameData.natures.${n.name}.name`, n.name)}
              onClick={(e) => e.stopPropagation()}
              slotProps={{
                typography: {
                  className: "text-xl text-primary-dark font-semibold",
                },
              }}
            />
          </AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
            <Typography className="text-sm text-primary-dark opacity-70">
              {tg(`gameData.natures.${n.name}.description`, n.description)}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </RadioGroup>
  );
}

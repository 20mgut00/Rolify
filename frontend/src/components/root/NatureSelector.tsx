import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { ChevronsDown } from "lucide-react";
import Typography from "@mui/material/Typography";

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
              backgroundColor: '#F2EDE4',
              color: '#0F2B3A',
              '&:hover': { backgroundColor: '#E8E3DB' },
              '& .MuiAccordionSummary-content': { color: '#0F2B3A' }
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
                  sx={{ color: '#0F2B3A', '&.Mui-checked': { color: '#D9A441' } }}
                />
              }
              label={n.name}
              onClick={(e) => e.stopPropagation()}
              slotProps={{
                typography: {
                  className: "text-xl text-primary-dark font-semibold",
                },
              }}
            />
          </AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: 'white', color: '#0F2B3A' }}>
            <Typography className="text-sm text-primary-dark opacity-70">
              {n.description}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </RadioGroup>
  );
}

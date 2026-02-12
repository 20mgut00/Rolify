import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { ChevronsDown } from "lucide-react";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";

interface DriveSelectorProps {
  drives?: Array<{ name: string; description: string }>;
  value?: Array<{ name: string; description: string }>;
  onDrivesSelect?: (
    drives: Array<{ name: string; description: string }>
  ) => void;
}

export default function DriveSelector({
  drives = [],
  value = [],
  onDrivesSelect,
}: DriveSelectorProps) {
  const selectedNames = useMemo(() => value.map((d) => d.name), [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    let newDrives: string[];
    if (selectedNames.includes(value)) {
      newDrives = selectedNames.filter((drive) => drive !== value);
    } else {
      newDrives = [...selectedNames, value];
    }
    const selectedItems = drives.filter((d) => newDrives.includes(d.name));
    onDrivesSelect?.(selectedItems);
  };

  if (!drives || drives.length === 0) {
    return <p className="text-sm text-primary-dark/60">No drive options available</p>;
  }

  return (
    <FormGroup className="text-start">
      {drives.map((d) => {
        const isDisabled =
          selectedNames.length >= 2 && !selectedNames.includes(d.name);
        return (
          <Accordion
            key={d.name}
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
                backgroundColor: isDisabled ? '#E3DBD0' : '#F2EDE4',
                color: '#0F2B3A',
                border: isDisabled ? '1px solid #D1C7B8' : '1px solid transparent',
                '&:hover': {
                  backgroundColor: isDisabled ? '#E3DBD0' : '#E8E3DB',
                },
                '& .MuiAccordionSummary-content': { color: '#0F2B3A' }
              }}
            >
              <FormControlLabel
                value={d.name}
                control={
                  <Checkbox
                    checked={selectedNames.includes(d.name)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleChange(e);
                    }}
                    disabled={isDisabled}
                    sx={{
                      color: '#0F2B3A',
                      '&.Mui-checked': { color: '#D9A441' },
                      '&.Mui-disabled': { color: '#0F2B3A' },
                    }}
                  />
                }
                label={d.name}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.6 : 1,
                  '& .MuiFormControlLabel-label': {
                    color: isDisabled ? '#5B6470' : '#0F2B3A',
                  },
                  '& .MuiFormControlLabel-label.Mui-disabled': {
                    color: '#5B6470',
                  }
                }}
                slotProps={{
                  typography: {
                    className: 'text-xl text-primary-dark font-semibold',
                  },
                }}
              />
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'white', color: '#0F2B3A' }}>
              <Typography className="text-sm text-primary-dark opacity-70">
                {d.description}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </FormGroup>
  );
}

import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { ChevronsDown } from "lucide-react";
import Typography from "@mui/material/Typography";
import { useMemo, useCallback, memo } from "react";

interface DriveSelectorProps {
  drives?: Array<{ name: string; description: string }>;
  value?: Array<{ name: string; description: string }>;
  onDrivesSelect?: (
    drives: Array<{ name: string; description: string }>
  ) => void;
}

function DriveSelector({
  drives = [],
  value = [],
  onDrivesSelect,
}: DriveSelectorProps) {
  const selectedNames = useMemo(() => value.map((d) => d.name), [value]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    let newDrives: string[];
    if (selectedNames.includes(value)) {
      newDrives = selectedNames.filter((drive) => drive !== value);
    } else {
      newDrives = [...selectedNames, value];
    }
    const selectedItems = drives.filter((d) => newDrives.includes(d.name));
    onDrivesSelect?.(selectedItems);
  }, [selectedNames, drives, onDrivesSelect]);

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
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)',
                border: '2px solid rgba(217, 164, 65, 0.3)',
                opacity: isDisabled ? 0.7 : 1,
                '&:hover': {
                  backgroundColor: 'var(--color-primary-light)',
                },
                '& .MuiAccordionSummary-content': { color: 'var(--color-primary-dark)' }
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
                      color: 'var(--color-primary-dark)',
                      '&.Mui-checked': { color: '#D9A441' },
                      '&.Mui-disabled': { color: 'var(--color-primary-dark)' },
                    }}
                  />
                }
                label={d.name}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.6 : 1,
                  '& .MuiFormControlLabel-label': {
                    color: 'var(--color-primary-dark)',
                  },
                  '& .MuiFormControlLabel-label.Mui-disabled': {
                    color: 'var(--color-primary-dark)',
                  }
                }}
                slotProps={{
                  typography: {
                    className: 'text-xl text-primary-dark font-semibold',
                  },
                }}
              />
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
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

export default memo(DriveSelector);

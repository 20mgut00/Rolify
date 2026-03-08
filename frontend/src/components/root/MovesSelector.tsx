import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { ChevronsDown } from "lucide-react";
import Typography from "@mui/material/Typography";
import { useMemo, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";

interface MovesSelectorProps {
  moves: Array<{ name: string; description: string; mandatory?: boolean }>;
  value?: Array<{ name: string; description: string }>;
  onMovesSelect?: (moves: Array<{ name: string; description: string }>) => void;
  maxMoves?: number;
}

function MovesSelector({
  moves = [],
  value = [],
  onMovesSelect,
  maxMoves = 3,
}: MovesSelectorProps) {
  const { t } = useTranslation();
  const tg = (key: string, fallback: string) => {
    const r = t(key as never, { defaultValue: key }) as string;
    return r === key ? fallback : r;
  };

  const mandatoryCount = useMemo(() => moves.filter(m => m.mandatory).length, [moves]);
  const selectableLimit = maxMoves - mandatoryCount;
  const selectedNames = useMemo(() => value.map(m => m.name), [value]);
  const selectedNonMandatoryCount = useMemo(
    () => selectedNames.filter(n => !moves.find(m => m.name === n)?.mandatory).length,
    [selectedNames, moves]
  );

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    const newNames = selectedNames.includes(name)
      ? selectedNames.filter(m => m !== name)
      : [...selectedNames, name];
    onMovesSelect?.(moves.filter(m => newNames.includes(m.name)));
  }, [selectedNames, moves, onMovesSelect]);

  return (
    <FormGroup className="text-start">
      {moves.map((move) => {
        const isMandatory = !!move.mandatory;
        const isDisabled = isMandatory ||
          (selectedNonMandatoryCount >= selectableLimit && !selectedNames.includes(move.name));
        return (
          <Accordion
            key={move.name}
            disableGutters
            className="mb-3 rounded-lg"
            sx={{ backgroundColor: 'transparent', boxShadow: 'none', '&:before': { display: 'none' } }}
          >
            <AccordionSummary
              expandIcon={<ChevronsDown className="text-primary-dark" />}
              className="rounded-lg shadow-md"
              sx={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)',
                border: '2px solid rgba(217, 164, 65, 0.3)',
                opacity: isDisabled ? 0.7 : 1,
                '&:hover': { backgroundColor: 'var(--color-primary-light)' },
                '& .MuiAccordionSummary-content': { color: 'var(--color-primary-dark)' },
              }}
            >
              <FormControlLabel
                value={move.name}
                control={
                  <Checkbox
                    checked={isMandatory || selectedNames.includes(move.name)}
                    onChange={(e) => { e.stopPropagation(); handleChange(e); }}
                    disabled={isDisabled}
                    sx={{
                      color: 'var(--color-primary-dark)',
                      '&.Mui-checked': { color: isMandatory ? '#8B6914' : '#D9A441' },
                      '&.Mui-disabled': { color: 'var(--color-primary-dark)' },
                    }}
                  />
                }
                label={
                  <span className="flex items-center gap-2">
                    {tg(`gameData.moves.${move.name}.name`, move.name)}
                    {isMandatory && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-800/30 text-amber-900 dark:text-amber-200 border border-amber-700/40">
                        {tg('characterFormFields.mandatory', 'obligatorio')}
                      </span>
                    )}
                  </span>
                }
                onClick={(e) => e.stopPropagation()}
                sx={{
                  cursor: isMandatory ? 'default' : isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled && !isMandatory ? 0.6 : 1,
                  '& .MuiFormControlLabel-label': { color: 'var(--color-primary-dark)' },
                  '& .MuiFormControlLabel-label.Mui-disabled': { color: 'var(--color-primary-dark)' },
                }}
                slotProps={{ typography: { className: 'text-lg text-primary-dark font-semibold' } }}
              />
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
              <Typography className="text-sm text-primary-dark opacity-70 ml-1">
                {tg(`gameData.moves.${move.name}.description`, move.description)}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </FormGroup>
  );
}

export default memo(MovesSelector);

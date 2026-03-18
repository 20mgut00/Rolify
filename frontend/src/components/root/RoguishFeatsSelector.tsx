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

interface RoguishFeatsSelectorProps {
  roguishFeats?: {
    remaining: number;
    feats: Array<{ name: string; description: string; selected: boolean }>;
  };
  value?: Array<{ name: string; description: string }>;
  onFeatsSelect?: (feats: Array<{ name: string; description: string }>) => void;
}

function RoguishFeatsSelector({
  roguishFeats,
  value = [],
  onFeatsSelect,
}: RoguishFeatsSelectorProps) {
  const { t } = useTranslation();
  const tg = (key: string, fallback: string) => { const r = (t as (k: string) => string)(key); return r === key ? fallback : r; };
  const selectedNames = useMemo(() => value.map((f) => f.name), [value]);

  const preSelectedCount =
    roguishFeats?.feats.filter((f) => f.selected).length || 0;
  const maxSelections = preSelectedCount + (roguishFeats?.remaining || 0);

  // Feats pre-seleccionados en el template estan bloqueados: el jugador no puede deseleccionarlos
  const lockedFeats = useMemo(
    () =>
      roguishFeats?.feats.filter((f) => f.selected).map((f) => f.name) || [],
    [roguishFeats?.feats]
  );

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;

    if (lockedFeats.includes(name) && selectedNames.includes(name)) {
      return;
    }

    let newFeats: string[];
    if (selectedNames.includes(name)) {
      newFeats = selectedNames.filter((feat) => feat !== name);
    } else {
      newFeats = [...selectedNames, name];
    }
    const selectedItems =
      roguishFeats?.feats.filter((f) => newFeats.includes(f.name)) || [];
    onFeatsSelect?.(selectedItems);
  }, [selectedNames, lockedFeats, roguishFeats?.feats, onFeatsSelect]);

  if (!roguishFeats || !roguishFeats.feats || roguishFeats.feats.length === 0) {
    return <p className="text-sm text-primary-dark/60">{t('characterFormFields.noRoguishFeats')}</p>;
  }

  return (
    <div>
      <FormGroup className="text-start">
        {roguishFeats.feats.map((feat) => {
          const isLocked = lockedFeats.includes(feat.name);
          const isDisabled =
            isLocked ||
            (selectedNames.length >= maxSelections &&
              !selectedNames.includes(feat.name));

          return (
            <Accordion
              key={feat.name}
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
                  value={feat.name}
                  control={
                    <Checkbox
                      checked={selectedNames.includes(feat.name)}
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
                  label={tg(`gameData.roguishFeats.${feat.name}.name`, feat.name)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.6 : 1,
                    '& .MuiFormControlLabel-label': {
                      color: 'var(--color-primary-dark)',
                    },
                    '& .MuiFormControlLabel-label.Mui-disabled': {
                      color: 'var(--color-primary-dark)',
                    },
                  }}
                  slotProps={{
                    typography: {
                      className: 'text-lg text-primary-dark font-semibold',
                    },
                  }}
                />
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
                <Typography className="text-sm text-primary-dark opacity-70 ml-1">
                  {tg(`gameData.roguishFeats.${feat.name}.description`, feat.description)}
                </Typography>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </FormGroup>
    </div>
  );
}

export default memo(RoguishFeatsSelector);

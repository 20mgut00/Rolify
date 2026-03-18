import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { ChevronsDown } from "lucide-react";
import { useMemo, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";

interface WeaponSkillsSelectorProps {
  weaponSkills?: {
    remaining: number;
    skills: Array<{ name: string; description: string; selected: boolean }>;
  };
  value?: Array<{ name: string; description: string }>;
  onSkillsSelect?: (
    skills: Array<{ name: string; description: string }>
  ) => void;
}

function WeaponSkillsSelector({
  weaponSkills,
  value = [],
  onSkillsSelect,
}: WeaponSkillsSelectorProps) {
  const { t } = useTranslation();
  const tg = (key: string, fallback: string) => { const r = (t as (k: string) => string)(key); return r === key ? fallback : r; };
  const selectedNames = useMemo(() => value.map((s) => s.name), [value]);

  const maxSelections = weaponSkills?.remaining || 0;

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    let newSkills: string[];
    if (selectedNames.includes(name)) {
      newSkills = selectedNames.filter((skill) => skill !== name);
    } else {
      newSkills = [...selectedNames, name];
    }
    const selectedItems =
      weaponSkills?.skills.filter((s) => newSkills.includes(s.name)) || [];
    onSkillsSelect?.(selectedItems);
  }, [selectedNames, weaponSkills?.skills, onSkillsSelect]);

  if (
    !weaponSkills ||
    !weaponSkills.skills ||
    weaponSkills.skills.length === 0
  ) {
    return <p className="text-sm text-primary-dark/60">{t('characterFormFields.noWeaponSkills')}</p>;
  }

  return (
    <div>
      <FormGroup className="text-start">
        {weaponSkills.skills.map((skill) => {
          // selected=true en el template significa "disponible para elegir", NO "ya seleccionado"
          const isNotSelectable = !skill.selected;
          const isChecked = selectedNames.includes(skill.name);
          const isDisabled =
            isNotSelectable ||
            (selectedNames.length >= maxSelections && !isChecked);

          return (
            <Accordion
              key={skill.name}
              disableGutters
              className="mb-3 rounded-lg"
              sx={{
                backgroundColor: 'transparent',
                boxShadow: 'none',
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                className="rounded-lg shadow-md"
                expandIcon={<ChevronsDown className="text-primary-dark" />}
                sx={{
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary-dark)',
                  border: isNotSelectable
                    ? '2px dashed rgba(217, 164, 65, 0.4)'
                    : '2px solid rgba(217, 164, 65, 0.3)',
                  opacity: isDisabled ? 0.7 : 1,
                  '&:hover': {
                    backgroundColor: 'var(--color-primary-light)',
                  },
                  '& .MuiAccordionSummary-content': { color: 'var(--color-primary-dark)' }
                }}
              >
                <FormControlLabel
                  value={skill.name}
                  control={
                    <Checkbox
                      checked={isChecked}
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
                  label={tg(`gameData.weaponSkills.${skill.name}.name`, skill.name)}
                  onClick={(e) => e.stopPropagation()}
                  slotProps={{
                    typography: {
                      className: 'text-lg text-primary-dark font-semibold',
                    },
                  }}
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
                />
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
                <Typography className="text-sm text-primary-dark opacity-70 ml-1">
                  {tg(`gameData.weaponSkills.${skill.name}.description`, skill.description)}
                </Typography>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </FormGroup>
    </div>
  );
}

export default memo(WeaponSkillsSelector);

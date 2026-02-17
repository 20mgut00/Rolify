import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { ChevronsDown } from "lucide-react";
import { useMemo, useCallback, memo } from "react";

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
  // selectedNames: Cachea la lista de nombres de skills seleccionados por el usuario
  // Solo recalcula si value cambia (el array de objetos del padre)
  const selectedNames = useMemo(() => value.map((s) => s.name), [value]);

  // maxSelections: Número máximo de skills que pueden seleccionarse
  // Viene del backend como "remaining" (espacio disponible para nuevas selecciones)
  const maxSelections = weaponSkills?.remaining || 0;

  // handleChange: Controlador para seleccionar/deseleccionar skills
  // Patrón: toggle (hacer click alterna el estado)
  // Limitación: no puedes seleccionar más skills que el máximo permitido
  // Memoizado para evitar re-creación en cada render
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    let newSkills: string[];
    if (selectedNames.includes(name)) {
      // Deseleccionar: remover del array
      newSkills = selectedNames.filter((skill) => skill !== name);
    } else {
      // Seleccionar: añadir al array (solo si no alcanzas el máximo)
      newSkills = [...selectedNames, name];
    }
    // Obtener los objetos completos (name + description) de los nuevos skills seleccionados
    const selectedItems =
      weaponSkills?.skills.filter((s) => newSkills.includes(s.name)) || [];
    onSkillsSelect?.(selectedItems);
  }, [selectedNames, weaponSkills?.skills, onSkillsSelect]);

  if (
    !weaponSkills ||
    !weaponSkills.skills ||
    weaponSkills.skills.length === 0
  ) {
    return <p className="text-sm text-primary-dark/60">No weapon skills available</p>;
  }

  return (
    <div>
      <FormGroup className="text-start">
        {/* Componente controlado: renderiza un Accordion por cada skill disponible en el catálogo */}
        {weaponSkills.skills.map((skill) => {
          // isNotSelectable: Skills que NO vienen desde la base de datos (selected: false)
          // Estas NUNCA pueden seleccionarse
          const isNotSelectable = !skill.selected;

          // isChecked: Verifica si esta skill está en selectedNames (usuario o Gemini la seleccionó)
          const isChecked = selectedNames.includes(skill.name);

          // isDisabled: Deshabilita el checkbox si:
          // 1. La skill NO es seleccionable (selected: false), O
          // 2. Ya llegaste al máximo de selecciones permitidas Y esta skill no está seleccionada
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
                      // checked: Marca si está en selectedNames (seleccionado por el usuario)
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
                  label={skill.name}
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
              {/* AccordionDetails: Muestra la descripción del skill */}
              <AccordionDetails sx={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
                <Typography className="text-sm text-primary-dark opacity-70 ml-1">
                  {skill.description}
                </Typography>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </FormGroup>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(WeaponSkillsSelector);

import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { ChevronsDown } from "lucide-react";
import { useMemo } from "react";

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

export default function WeaponSkillsSelector({
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
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  };

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
          // isAvailable: Verifica si la skill está marcada como disponible en el backend (skill.selected)
          // Solo muestra/habilita las skills que el backend indicó como disponibles
          const isAvailable = skill.selected;
          const isUnavailable = !isAvailable;

          // isChecked: Verifica si esta skill está en selectedNames (usuario la seleccionó)
          const isChecked = selectedNames.includes(skill.name);

          // isDisabled: Deshabilita el checkbox si:
          // 1. La skill no está disponible (skill.selected === false), O
          // 2. Ya llegaste al máximo de selecciones permitidas Y esta skill no está seleccionada
          const isDisabled =
            !isAvailable ||
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
                  backgroundColor: isUnavailable
                    ? '#EFE7DC'
                    : isDisabled
                    ? '#E3DBD0'
                    : '#F2EDE4',
                  color: '#0F2B3A',
                  border: isUnavailable
                    ? '1px dashed #C7B59F'
                    : isDisabled
                    ? '1px solid #D1C7B8'
                    : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: isUnavailable
                      ? '#EFE7DC'
                      : isDisabled
                      ? '#E3DBD0'
                      : '#E8E3DB',
                  },
                  '& .MuiAccordionSummary-content': { color: '#0F2B3A' }
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
                        color: '#0F2B3A',
                        '&.Mui-checked': { color: '#D9A441' },
                        '&.Mui-disabled': { color: isUnavailable ? '#6B4E2E' : '#0F2B3A' },
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
                      color: isUnavailable
                        ? '#6B4E2E'
                        : isDisabled
                        ? '#5B6470'
                        : '#0F2B3A',
                    },
                    '& .MuiFormControlLabel-label.Mui-disabled': {
                      color: isUnavailable ? '#6B4E2E' : '#5B6470',
                    },
                  }}
                />
              </AccordionSummary>
              {/* AccordionDetails: Muestra la descripción del skill */}
              <AccordionDetails sx={{ backgroundColor: 'white', color: '#0F2B3A' }}>
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

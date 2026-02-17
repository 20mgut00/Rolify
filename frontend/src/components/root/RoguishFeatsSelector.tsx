import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { ChevronsDown } from "lucide-react";
import Typography from "@mui/material/Typography";
import { useMemo, useCallback, memo } from "react";

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
  // selectedNames: Cachea la lista de nombres de feats seleccionados por el usuario
  // Solo recalcula si value cambia (el array de objetos del padre)
  const selectedNames = useMemo(() => value.map((f) => f.name), [value]);

  // Cálculo de límites:
  // - preSelectedCount: Feats que ya estaban seleccionados en el backend (no pueden desseleccionarse)
  // - maxSelections: Total de feats que puedes tener (pre-seleccionados + espacio disponible)
  const preSelectedCount =
    roguishFeats?.feats.filter((f) => f.selected).length || 0;
  const maxSelections = preSelectedCount + (roguishFeats?.remaining || 0);

  // lockedFeats: Lista de nombres de feats que están "bloqueados" (pre-seleccionados del backend)
  // El usuario NO puede deseleccionar estos items
  // useMemo evita recalcular si roguishFeats.feats no cambia
  const lockedFeats = useMemo(
    () =>
      roguishFeats?.feats.filter((f) => f.selected).map((f) => f.name) || [],
    [roguishFeats?.feats]
  );

  // handleChange: Controlador para seleccionar/deseleccionar feats
  // Lógica especial: Bloquea intentos de deseleccionar feats bloqueados
  // Si el usuario intenta deseleccionar un feat bloqueado, ignora el evento
  // Memoizado para evitar re-creación en cada render
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;

    // Bloquear: Si es un feat bloqueado Y está seleccionado, rechazar cambio
    if (lockedFeats.includes(name) && selectedNames.includes(name)) {
      return;
    }

    let newFeats: string[];
    if (selectedNames.includes(name)) {
      // Deseleccionar: remover del array
      newFeats = selectedNames.filter((feat) => feat !== name);
    } else {
      // Seleccionar: añadir al array
      newFeats = [...selectedNames, name];
    }
    // Obtener los objetos completos (name + description) de los nuevos feats seleccionados
    const selectedItems =
      roguishFeats?.feats.filter((f) => newFeats.includes(f.name)) || [];
    onFeatsSelect?.(selectedItems);
  }, [selectedNames, lockedFeats, roguishFeats?.feats, onFeatsSelect]);

  if (!roguishFeats || !roguishFeats.feats || roguishFeats.feats.length === 0) {
    return <p className="text-sm text-primary-dark/60">No roguish feats available</p>;
  }

  return (
    <div>
      <FormGroup className="text-start">
        {/* Componente controlado: renderiza un Accordion por cada feat disponible en el catálogo */}
        {roguishFeats.feats.map((feat) => {
          // isLocked: Verifica si este feat está pre-seleccionado (bloqueado del backend)
          const isLocked = lockedFeats.includes(feat.name);

          // isDisabled: Deshabilita el checkbox si:
          // 1. El feat está bloqueado (pre-seleccionado del backend), O
          // 2. Ya llegamos al máximo de selecciones permitidas Y este feat no está seleccionado
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
                      // checked: Marca si está en selectedNames (seleccionado por el usuario o pre-seleccionado)
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
                  label={feat.name}
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
              {/* AccordionDetails: Muestra la descripción del feat */}
              <AccordionDetails sx={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
                <Typography className="text-sm text-primary-dark opacity-70 ml-1">
                  {feat.description}
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
export default memo(RoguishFeatsSelector);

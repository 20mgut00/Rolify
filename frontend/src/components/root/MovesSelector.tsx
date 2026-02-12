import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { ChevronsDown } from "lucide-react";
import Typography from "@mui/material/Typography";
import { useMemo, useCallback, memo } from "react";

interface MovesSelectorProps {
  moves: Array<{ name: string; description: string }>;
  value?: Array<{ name: string; description: string }>;
  onMovesSelect?: (moves: Array<{ name: string; description: string }>) => void;
}

function MovesSelector({
  moves = [],
  value = [],
  onMovesSelect,
}: MovesSelectorProps) {
  // useMemo: Cachea la lista de nombres de moves seleccionados
  // Evita recalcular cada render si value no cambia
  // Solo se recalcula si el array value cambia (por referencia)
  const selectedNames = useMemo(() => value.map((m) => m.name), [value]);

  // handleChange: Controlador de cambios para los checkboxes
  // Lógica: Si el move está en selectedNames, lo desselecciona; si no, lo añade
  // Esto es un patrón de "toggle": hacer click alterna el estado
  // Limitación: máximo 3 moves (deshabilitados los checkboxes que harían exceder este número)
  // Memoizado para evitar re-creación en cada render
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    let newMoves: string[];
    if (selectedNames.includes(name)) {
      // Desseleccionar: eliminar del array
      newMoves = selectedNames.filter((move) => move !== name);
    } else {
      // Seleccionar: añadir al array
      newMoves = [...selectedNames, name];
    }
    // Obtener los objetos completos (name + description) de los nuevos moves seleccionados
    const selectedItems = moves.filter((m) => newMoves.includes(m.name));
    // Notificar al padre (RootSheet) sobre los cambios
    onMovesSelect?.(selectedItems);
  }, [selectedNames, moves, onMovesSelect]);

  return (
    <FormGroup className="text-start">
      {/* Componente controlado: recibe moves (catálogo) y value (seleccionados) del padre */}
      {/* Renderiza un Accordion por cada move disponible en el catálogo */}
      {moves.map((move) => {
        // isDisabled: Deshabilita el checkbox si ya hay 3 moves seleccionados
        // y este move no está entre los seleccionados
        // Permite deseleccionar o intercambiar moves, pero no añadir más de 3
        const isDisabled =
          selectedNames.length >= 3 && !selectedNames.includes(move.name);
        return (
          <Accordion
            key={move.name}
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
                value={move.name}
                control={
                  <Checkbox
                    // checked: Marca el checkbox si el move está en selectedNames
                    checked={selectedNames.includes(move.name)}
                    onChange={(e) => {
                      e.stopPropagation(); // Prevenir que abra/cierre el Accordion
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
                label={move.name}
                onClick={(e) => e.stopPropagation()}
                  sx={{
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.6 : 1,
                  '& .MuiFormControlLabel-label': {
                    color: isDisabled ? '#5B6470' : '#0F2B3A',
                  },
                  '& .MuiFormControlLabel-label.Mui-disabled': {
                    color: '#5B6470',
                  },
                  }}
                slotProps={{
                  typography: {
                      className: 'text-lg text-primary-dark font-semibold',
                  },
                }}
              />
            </AccordionSummary>
            {/* AccordionDetails: Muestra la descripción del move */}
            <AccordionDetails sx={{ backgroundColor: 'white', color: '#0F2B3A' }}>
              <Typography className="text-sm text-primary-dark opacity-70 ml-1">
                {move.description}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </FormGroup>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(MovesSelector);

# Ejemplo: Personaje "Bicho"

Este archivo muestra cómo tu documento MongoDB se mapea a TypeScript.

## 📄 Documento MongoDB Original

```json
{
  "_id": {
    "$oid": "696e17982083591b5b9a2561"
  },
  "idUsuario": "696e13d736da9d077952ac39",
  "system": "Root",
  "className": "Adventurer",
  "name": "Bicho",
  "species": "Buho",
  "details": "Marron",
  "demeanor": "Tranquilo",
  "avatarImage": "data:image/png;base64,",
  "nature": {
    "name": "Peacemaker",
    "description": "Clear your exhaustion track when you resolve a dangerous conflict nonviolently."
  },
  "drives": [
    {
      "name": "Ambition",
      "description": "Advance when you increase your Reputation with any faction."
    },
    {
      "name": "Clean Paws",
      "description": "Advance when you accomplish an illicit, criminal goal while maintaining a believable veneer of innocence."
    }
  ],
  "background": [
    {
      "question": "Where do you call home?",
      "answer": "A clearing."
    },
    {
      "question": "Why are you a vagabond?",
      "answer": "I want to help the Woodland"
    },
    {
      "question": "Whom have you left behind?",
      "answer": "My mentor"
    },
    {
      "question": "Which faction have you served the most?",
      "answer": "Lobos"
    },
    {
      "question": "With which faction have you earned a special enmity?",
      "answer": ""
    }
  ],
  "connections": [],
  "stats": [
    {
      "name": "Charm",
      "value": 2
    },
    {
      "name": "Cunning",
      "value": 1
    },
    {
      "name": "Finesse",
      "value": 1
    },
    {
      "name": "Luck",
      "value": 0
    },
    {
      "name": "Might",
      "value": -1
    }
  ],
  "reputations": [
    {
      "name": "Lobos",
      "notoriety": 0,
      "prestige": 6
    }
  ],
  "moves": [
    {
      "name": "Subduing Strikes",
      "description": "When you aim to subdue an enemy quickly and nonlethally, you can engage in melee with Cunning instead of Might. You cannot choose to inflict serious harm if you do."
    },
    {
      "name": "Talon on the Pulse",
      "description": "When you gather information about the goings-on in a clearing, roll with Cunning. On a 10+, ask 3. On a 7-9, ask 2: Who holds power in this clearing? Who is the local dissident? What are the denizens afraid of? What do the denizens hope for? What opportunities exist for enterprising vagabonds? On a miss, your questions tip off someone dangerous."
    },
    {
      "name": "Orator",
      "description": "When you give a speech to interested denizens of a clearing, say what you are motivating them to do and roll with Charm. On a hit, they will move to do it as they see fit. On a 10+, choose 2. On a 7-9, choose 1: They don't try to take your intent too far; They don't disband at the first sign of real resistance; They don't demand you stand at their head and lead. On a miss, they twist your message in unpredictable ways."
    }
  ],
  "roguishFeats": [
    {
      "name": "Counterfeit",
      "description": "Copying, forgery, fakery."
    },
    {
      "name": "Sleight of Hand",
      "description": "Palming, switching, ditching, flourishes."
    }
  ],
  "weaponSkills": [
    {
      "name": "Improvise a Weapon",
      "description": "When you make a weapon out of improvised materials around you, roll with Cunning. On a hit, you make a weapon; the GM will tell you its range tag and at least one other beneficial tag based on the materials you used. On a 7–9, the weapon also has a weakness tag."
    }
  ],
  "equipment": "Cosas",
  "_class": "com.project.rolify.domain.Character"
}
```

## 🔄 Después de `fromCharacterDB()` - Formato UI

```typescript
const character: Character = {
  id: "696e17982083591b5b9a2561",
  userId: "696e13d736da9d077952ac39",
  system: "Root",
  className: "Adventurer",
  name: "Bicho",
  species: "Buho",
  details: "Marron",
  demeanor: "Tranquilo",
  avatarImage: "data:image/png;base64,",

  // ⚠️ nature: objeto → array con selected
  nature: [
    {
      name: "Peacemaker",
      description: "Clear your exhaustion track when you resolve a dangerous conflict nonviolently.",
      selected: true
    }
  ],

  // ⚠️ drives: agrega campo selected
  drives: [
    {
      name: "Ambition",
      description: "Advance when you increase your Reputation with any faction.",
      selected: true
    },
    {
      name: "Clean Paws",
      description: "Advance when you accomplish an illicit, criminal goal while maintaining a believable veneer of innocence.",
      selected: true
    }
  ],

  background: [
    {
      question: "Where do you call home?",
      answer: "A clearing."
    },
    {
      question: "Why are you a vagabond?",
      answer: "I want to help the Woodland"
    },
    {
      question: "Whom have you left behind?",
      answer: "My mentor"
    },
    {
      question: "Which faction have you served the most?",
      answer: "Lobos"
    },
    {
      question: "With which faction have you earned a special enmity?",
      answer: ""
    }
  ],

  connections: [],

  stats: [
    { name: "Charm", value: 2 },
    { name: "Cunning", value: 1 },
    { name: "Finesse", value: 1 },
    { name: "Luck", value: 0 },
    { name: "Might", value: -1 }
  ],

  // ⚠️ reputations: array → objeto Record
  reputation: {
    factions: {
      "Lobos": {
        notoriety: 0,
        prestige: 6
      }
    }
  },

  // ⚠️ moves: agrega campo selected
  moves: [
    {
      name: "Subduing Strikes",
      description: "When you aim to subdue an enemy quickly and nonlethally...",
      selected: true
    },
    {
      name: "Talon on the Pulse",
      description: "When you gather information about the goings-on in a clearing...",
      selected: true
    },
    {
      name: "Orator",
      description: "When you give a speech to interested denizens of a clearing...",
      selected: true
    }
  ],

  // ⚠️ roguishFeats: array → objeto con remaining
  roguishFeats: {
    remaining: 0,
    feats: [
      {
        name: "Counterfeit",
        description: "Copying, forgery, fakery.",
        selected: true
      },
      {
        name: "Sleight of Hand",
        description: "Palming, switching, ditching, flourishes.",
        selected: true
      }
    ]
  },

  // ⚠️ weaponSkills: array → objeto con remaining
  weaponSkills: {
    remaining: 0,
    skills: [
      {
        name: "Improvise a Weapon",
        description: "When you make a weapon out of improvised materials...",
        selected: true
      }
    ]
  },

  // ⚠️ equipment: string → objeto (o mantiene string si no es JSON)
  equipment: {
    startingValue: 0,
    carrying: 0,
    burdened: 0,
    max: 0,
    items: []
  }
  // Nota: Si "Cosas" no es JSON válido, se usa objeto por defecto
};
```

## 🔄 Proceso Inverso - UI → MongoDB

Si tuvieras este personaje en el frontend y quisieras guardarlo:

```typescript
import { characterAPI } from '@/services/api';

// Trabajas con formato UI en tu componente
const bichoUI: Character = {
  name: "Bicho",
  nature: [{ name: "Peacemaker", description: "...", selected: true }],
  drives: [
    { name: "Ambition", description: "...", selected: true },
    { name: "Clean Paws", description: "...", selected: false }  // No seleccionado
  ],
  equipment: {
    items: [{ name: "Espada", value: 5, wear: 0 }],
    carrying: 5,
    // ...
  },
  // ...
};

// Guardar (conversión automática)
const saved = await characterAPI.create(bichoUI);

// El backend recibe:
{
  "nature": { "name": "Peacemaker", "description": "..." },  // Objeto único
  "drives": [
    { "name": "Ambition", "description": "..." }  // Solo los selected: true
  ],
  "equipment": "{\"items\":[{\"name\":\"Espada\",\"value\":5,\"wear\":0}],\"carrying\":5,...}",
  // ...
}
```

## 📊 Comparación Visual

```
MongoDB (CharacterDB)          →  fromCharacterDB()  →  UI (Character)
─────────────────────────────────────────────────────────────────────

nature: {                      →                      →  nature: [{
  name: "X",                                              name: "X",
  description: "Y"                                        description: "Y",
}                                                         selected: true
                                                        }]

drives: [{                     →                      →  drives: [{
  name: "A",                                              name: "A",
  description: "B"                                        description: "B",
}]                                                        selected: true
                                                        }]

reputations: [{                →                      →  reputation: {
  name: "Lobos",                                          factions: {
  prestige: 6,                                              "Lobos": {
  notoriety: 0                                                prestige: 6,
}]                                                            notoriety: 0
                                                              }
                                                            }
                                                          }

equipment: "Cosas"             →                      →  equipment: {
                                                            startingValue: 0,
                                                            items: [],
                                                            ...
                                                          }

_id: "696e1798..."             →                      →  id: "696e1798..."
idUsuario: "696e13d7..."       →                      →  userId: "696e13d7..."
```

## ✅ Conclusión

Tu estructura MongoDB funciona perfectamente con el sistema. La conversión es:

1. **Automática** - No necesitas hacer nada especial
2. **Bidireccional** - De MongoDB a UI y viceversa
3. **Segura** - Maneja errores y valores por defecto
4. **Transparente** - Trabajas siempre con `Character` en componentes

¡Todo listo para usar! 🎉

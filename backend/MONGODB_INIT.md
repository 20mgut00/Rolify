# MongoDB Initialization Script

Este script debe ejecutarse para poblar la base de datos con las plantillas de clases de Root.

## Opción 1: Usando MongoDB Compass

1. Conecta a tu cluster de MongoDB Atlas
2. Selecciona la base de datos `rpg-characters`
3. Crea la colección `class_templates`
4. Importa los documentos JSON de abajo

## Opción 2: Usando mongosh

```bash
mongosh "mongodb+srv://your-connection-string"

use rpg-characters

db.class_templates.insertMany([
  // Documentos aquí
])
```

## Plantillas de Clases

### Adventurer

```json
{
  "system": "Root",
  "className": "Adventurer",
  "description": "You are a peaceful, diplomatic vagabond, making allies from those you aid, perhaps toppling greater powers by forging strong bonds with others.",
  "background": [
    {
      "name": "Where do you call home?",
      "answers": [
        "A clearing",
        "The forest",
        "A place far from here"
      ]
    },
    {
      "name": "Why are you a vagabond?",
      "answers": [
        "I want to help the Woodland",
        "I want to explore the Woodland",
        "I believe the current factions should be overturned",
        "I must keep a promise to a loved one",
        "I want freedom from society's constraints"
      ]
    },
    {
      "name": "Whom have you left behind?",
      "answers": [
        "My mentor",
        "My family",
        "My loved one",
        "My student",
        "My greatest ally"
      ]
    },
    {
      "name": "Which faction have you served the most?",
      "answers": []
    },
    {
      "name": "With which faction have you earned a special enmity?",
      "answers": []
    }
  ],
  "nature": [
    {
      "name": "Extrovert",
      "description": "Clear your exhaustion track when you share a moment of real warmth, friendship, or enjoyment with someone."
    },
    {
      "name": "Peacemaker",
      "description": "Clear your exhaustion track when you resolve a dangerous conflict nonviolently."
    }
  ],
  "drives": [
    {
      "name": "Ambition",
      "description": "Advance when you increase your reputation with any faction."
    },
    {
      "name": "Clean Paws",
      "description": "Advance when you accomplish an illicit, criminal goal while maintaining a believable veneer of innocence."
    },
    {
      "name": "Principles",
      "description": "Advance when you express or embody your moral principles at great cost to yourself or your allies."
    },
    {
      "name": "Justice",
      "description": "Advance when you achieve justice for someone wronged by a powerful, wealthy, or high-status individual."
    }
  ],
  "connections": [
    {
      "name": "Partner",
      "description": "When you fill in this connection, you each mark 2-prestige with the faction you helped, and mark 2-notoriety with the faction you harmed. During play, if you are spotted together, then any prestige or notoriety gains with those factions are doubled for the two of you."
    },
    {
      "name": "Friend",
      "description": "When you help them, you can mark 2-exhaustion to give a +2, instead of 1-exhaustion for a +1."
    }
  ],
  "moves": [
    {
      "name": "Sterling Reputation",
      "description": "Whenever you mark any amount of prestige with a faction, mark one additional prestige. When you mark any amount of notoriety with a faction, you can instead clear an equivalent amount of marked prestige."
    },
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
    },
    {
      "name": "Well-Read",
      "description": "Take +1 Cunning (max +3)."
    },
    {
      "name": "Fast Friends",
      "description": "When you try to befriend an NPC you've just met by matching their personality, body language, and desires, mark exhaustion and roll with Cunning. On a hit, they'll look upon you favorably—ask them any one non-compromising question and they'll answer truthfully, or request a simple favor and they'll do it for you. On a 10+, they really like you—they'll share a valuable secret or grant you a serious favor instead. On a miss, you read them totally wrong, and their displeasure costs you."
    }
  ],
  "weaponSkills": {
    "remaining": 1,
    "skills": [
      {
        "name": "Cleave",
        "description": "When you cleave armored foes at close range, mark exhaustion and roll with Might. On a hit, you smash through their defenses and equipment; inflict 3-wear. On a 7–9, you overextend your weapon or yourself: mark wear or end up in a bad spot, your choice.",
        "selected": false
      },
      {
        "name": "Confuse Senses",
        "description": "When you throw something to confuse an opponent's senses at close or intimate range, roll with Finesse. On a hit, you've thrown them off balance, blinded them, deafened them, or confused them, and given yourself an opportunity. On a 10+, they have to take some time to get their bearings and restore their senses before they can act clearly again. On a 7–9, you have just a few moments.",
        "selected": false
      },
      {
        "name": "Disarm",
        "description": "When you target an opponent's weapon with your strikes at close range, roll with Finesse. On a hit, they have to mark 2-exhaustion or lose their weapon—it's well out of reach. On a 10+, they have to mark 3-exhaustion instead of 2.",
        "selected": true
      },
      {
        "name": "Harry",
        "description": "When you harry a group of enemies at far range, mark wear and roll with Cunning. On a 10+, both. On a 7–9, choose 1: inflict 2-morale harm; they are pinned or blocked.",
        "selected": false
      },
      {
        "name": "Improvise",
        "description": "When you make a weapon out of improvised materials around you, roll with Cunning. On a hit, you make a weapon; the GM will tell you its range tag and at least one other beneficial tag based on the materials you used. On a 7–9, the weapon also has a weakness tag.",
        "selected": false
      },
      {
        "name": "Parry",
        "description": "When you try to parry the attacks of an enemy at close range, mark exhaustion and roll with Finesse. On a hit, you consume their attention. On a 10+, all 3. On a 7–9, pick 1: you inflict morale or exhaustion harm (GM's choice); you disarm your opponent—their weapon is out of hand, but in reach; you don't suffer any harm.",
        "selected": false
      },
      {
        "name": "Quick Shot",
        "description": "When you fire a snap shot at an enemy at close range, roll with Luck. On a hit, inflict injury. On a 7–9, choose 1. On a 10+, choose 2: you don't mark wear; you don't mark exhaustion; you move quickly and change your position (and, if you choose, range); you keep your target at bay—they don't move.",
        "selected": false
      },
      {
        "name": "Storm a Group",
        "description": "When you storm a group of foes in melee, mark exhaustion and roll with Might. On a hit, trade harm. On a 10+, choose 2. On a 7–9, choose 1: you show them up—you inflict 2-morale harm; you keep them off-balance and confused—you inflict 2-exhaustion; you avoid their blows to the best of your ability—you suffer little (-1) harm; you use them against each other—mark exhaustion again and they inflict their harm against themselves.",
        "selected": false
      },
      {
        "name": "Trick Shot",
        "description": "When you fire a clever shot designed to take advantage of the environment at any range, mark wear and roll with Finesse. On a 7–9, choose 2. On a 10+, choose 3: your shot lands in any target of your choice within range, even if it's behind cover or hidden (inflicting injury or wear if appropriate); your shot strikes a second available target of your choice; your shot cuts something, breaks something, or knocks something over—your choice; your shot distracts an opponent and provides an opportunity.",
        "selected": false
      },
      {
        "name": "Vicious Strike",
        "description": "When you viciously strike an opponent where they are weak at intimate or close range, mark exhaustion and roll with Might. On a hit, they suffer serious (+1) harm and cannot mark wear on their armor to block it. On a 10+, you get away with the strike. On a 7–9, they score a blow against you as well.",
        "selected": false
      }
    ]
  },
  "roguishFeats": {
    "remaining": 0,
    "feats": [
      {
        "name": "Acrobatics",
        "description": "Adeptly climbing, vaulting, jumping.",
        "selected": false
      },
      {
        "name": "Blindside",
        "description": "Backstab, murder, sneak attack, sucker punch.",
        "selected": false
      },
      {
        "name": "Counterfeit",
        "description": "Copying, forgery, fakery.",
        "selected": false
      },
      {
        "name": "Disable Device",
        "description": "Disarming traps, turning off mechanisms.",
        "selected": false
      },
      {
        "name": "Hide",
        "description": "Disappear from view, remain hidden.",
        "selected": false
      },
      {
        "name": "Pick Lock",
        "description": "Open a locked door, chest, etc.",
        "selected": false
      },
      {
        "name": "Pickpocket",
        "description": "Subtly steal from a pocket.",
        "selected": false
      },
      {
        "name": "Sleight of Hand",
        "description": "Palming, switching, ditching, flourishes.",
        "selected": false
      },
      {
        "name": "Sneak",
        "description": "Get into or out of places without being seen.",
        "selected": false
      }
    ]
  },
  "stats": [
    {
      "name": "charm",
      "value": 0
    },
    {
      "name": "cunning",
      "value": 0
    },
    {
      "name": "finesse",
      "value": 0
    },
    {
      "name": "luck",
      "value": 0
    },
    {
      "name": "might",
      "value": 0
    }
  ],
  "maxDrives": 2,
  "maxMoves": 3,
  "maxNature": 2
}
```

## Nota

Para añadir más clases (Arbiter, Ranger, Scoundrel, Thief, Tinker, Vagrant, etc.):

1. Copia la estructura anterior
2. Modifica los campos específicos de cada clase
3. Inserta en la colección `class_templates`

Los datos proporcionados de Arbiter también se pueden agregar de la misma manera.

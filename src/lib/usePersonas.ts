import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  BUILT_IN_PERSONAS,
  DEFAULT_PERSONA_ID,
  type Persona,
} from './personas';

const PERSONAS_KEY = 'edgechat-personas';
const ACTIVE_PERSONA_KEY = 'edgechat-active-persona';

function loadCustomPersonas(): Persona[] {
  try {
    const stored = localStorage.getItem(PERSONAS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Persona[];
  } catch {
    return [];
  }
}

function saveCustomPersonas(personas: Persona[]): void {
  try {
    localStorage.setItem(PERSONAS_KEY, JSON.stringify(personas));
  } catch {
    // localStorage might be unavailable
  }
}

function loadActivePersonaId(): string {
  try {
    return localStorage.getItem(ACTIVE_PERSONA_KEY) ?? DEFAULT_PERSONA_ID;
  } catch {
    return DEFAULT_PERSONA_ID;
  }
}

function saveActivePersonaId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PERSONA_KEY, id);
  } catch {
    // localStorage might be unavailable
  }
}

/**
 * Hook for managing personas — built-in presets + user-created custom ones.
 *
 * Active persona is persisted to localStorage so it survives refresh.
 * Custom personas are also persisted to localStorage.
 */
export function usePersonas() {
  const [customPersonas, setCustomPersonas] = useState<Persona[]>(
    loadCustomPersonas,
  );
  const [activePersonaId, setActivePersonaIdState] = useState<string>(
    loadActivePersonaId,
  );

  const allPersonas = [...BUILT_IN_PERSONAS, ...customPersonas];

  const activePersona =
    allPersonas.find((p) => p.id === activePersonaId) ?? BUILT_IN_PERSONAS[0];

  const setActivePersona = useCallback((id: string) => {
    setActivePersonaIdState(id);
    saveActivePersonaId(id);
  }, []);

  const addPersona = useCallback(
    (name: string, icon: string, systemPrompt: string): Persona => {
      const newPersona: Persona = {
        id: uuidv4(),
        name: name.trim() || 'Custom Persona',
        icon: icon || '🤖',
        systemPrompt: systemPrompt.trim(),
        isBuiltIn: false,
      };
      setCustomPersonas((prev) => {
        const updated = [...prev, newPersona];
        saveCustomPersonas(updated);
        return updated;
      });
      return newPersona;
    },
    [],
  );

  const updatePersona = useCallback(
    (id: string, updates: Partial<Pick<Persona, 'name' | 'icon' | 'systemPrompt'>>) => {
      setCustomPersonas((prev) => {
        const updated = prev.map((p) =>
          p.id === id ? { ...p, ...updates } : p,
        );
        saveCustomPersonas(updated);
        return updated;
      });
    },
    [],
  );

  const deletePersona = useCallback(
    (id: string) => {
      // Can only delete custom personas
      setCustomPersonas((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        saveCustomPersonas(updated);
        return updated;
      });
      // If the deleted persona was active, fall back to default
      setActivePersonaIdState((current) => {
        if (current === id) {
          saveActivePersonaId(DEFAULT_PERSONA_ID);
          return DEFAULT_PERSONA_ID;
        }
        return current;
      });
    },
    [],
  );

  return {
    personas: allPersonas,
    activePersona,
    setActivePersona,
    addPersona,
    updatePersona,
    deletePersona,
  };
}

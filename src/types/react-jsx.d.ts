// Compatibilidad: permitir `playsInline` en elementos <audio>
// Algunos navegadores/atributos pueden usar `playsInline` en medios;
// TypeScript/React no lo incluye por defecto para audio en algunas versiones,
// así que ampliamos la interfaz para evitar el error de tipo.
import * as React from 'react';

declare module 'react' {
  interface AudioHTMLAttributes<T> extends React.HTMLAttributes<T> {
    playsInline?: boolean;
  }
}

# Caso de Estudio 1: Aprendizaje de Representaciones Acústicas

Presentación web local e interactiva sobre la agrupación y reconstrucción de sonido mediante Deep Clustering, basada en el caso Spanish-2Mix.

**Autor:** Milton Alejandro Villarroel Garvizu  
**Extensión:** 39 diapositivas, aproximadamente 45–50 minutos

## Uso

Abre `index.html` directamente en Chrome o Edge. No requiere Internet, instalación ni compilación.

También puede ejecutarse mediante un servidor local opcional:

```powershell
python -m http.server 8000
```

Después abre `http://localhost:8000/presentacion-deep-clustering/`.

## Controles

- `→`, `PageDown` o espacio: avanzar.
- `←` o `PageUp`: retroceder.
- `Home`: primera diapositiva.
- `End`: última diapositiva.
- `F`: activar o salir de pantalla completa.
- `T` o el botón de sol/luna: alternar entre fondo claro y oscuro. La elección queda guardada en el navegador.
- Gestos horizontales: navegación en pantallas táctiles.
- Dentro del visor: `+` acerca, `−` aleja y `0` restablece el zoom.
- Con una imagen ampliada, arrastra con ratón, lápiz o dedo para recorrerla.

La URL usa el identificador estable de cada diapositiva, por ejemplo `#slide-reshape` o `#slide-sisdr-math`, por lo que se puede enlazar directamente a cualquier sección.

## Demostraciones

- Laboratorio de escucha con mezcla, fuentes reales y fuentes estimadas.
- Comparador de espectrogramas entre referencia y estimación.
- Explorador de umbrales de coincidencia del 55 %, 60 % y 65 %.
- Ampliación de diagramas y gráficos mediante clic.
- Visor con seis niveles de zoom, hasta 400 %, y desplazamiento por barras o mediante arrastre sobre imágenes ampliadas.
- Transformaciones animadas y repetibles para STFT, padding, etiquetas, BLSTM, reshape, flatten, pérdida, rearmado y SI-SDR.
- Explicación de la transición SDR → SI-SDR, la mejora respecto de la mezcla y el porcentaje de bins correctos.
- Dataset sintético con Qwen3-TTS, semillas reproducibles, estructura del proyecto y SNR controlada.

## Compatibilidad y accesibilidad

- Funciona sin dependencias externas y sin solicitudes de red.
- Navegación completa por teclado.
- Foco visible, etiquetas accesibles y textos alternativos.
- Respeta `prefers-reduced-motion`.
- Tema claro y oscuro con contraste legible y preferencia persistente.
- Escala tipográfica ampliada para proyección, con cuerpos y leyendas de 11–12 px y títulos adaptativos de gran formato.
- Matrices, tablas y celdas con paletas diferenciadas y contraste específico para cada tema.
- Hoja de impresión 16:9 para exportar a PDF desde el navegador.

## Estructura

```text
presentacion-deep-clustering/
├── index.html
├── README.md
├── css/
│   ├── styles.css
│   └── print.css
├── js/
│   ├── data.js
│   └── presentation.js
└── assets/
    ├── audio/
    └── img/
```

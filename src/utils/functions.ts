// utils/functions.ts

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "ENE",
      "FEB",
      "MAR",
      "ABR",
      "MAY",
      "JUN",
      "JUL",
      "AGO",
      "SEP",
      "OCT",
      "NOV",
      "DIC",
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  };
  
  export const wrapText = (
    doc: any, // Puedes usar tipo jsPDF si lo prefieres
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number
  ) => {
    doc.setFontSize(fontSize);
  
    // Dividir el texto en palabras
    const words = text.split(" ");
    let line = "";
    const lines = [];
    const lineHeight = fontSize * 0.3; // Ajusta este valor según necesites
    const maxLines = 3;
    
    // Construir las líneas
    for (let i = 0; i < words.length; i++) {
      const testLine = line + (line ? " " : "") + words[i];
      const testWidth = doc.getTextWidth(testLine);
  
      if (testWidth > maxWidth) {
        // Si ya tenemos 2 líneas completas y estamos por agregar la tercera
        if (lines.length === maxLines - 1) {
          // Agregar puntos suspensivos a la última línea si es necesario
          const lastLine = line + "...";
          if (doc.getTextWidth(lastLine) > maxWidth) {
            // Si los puntos suspensivos hacen que exceda el ancho, recortar más
            let trimmedLine = line;
            while (doc.getTextWidth(trimmedLine + "...") > maxWidth) {
              trimmedLine = trimmedLine.slice(0, -1);
            }
            lines.push(trimmedLine + "...");
          } else {
            lines.push(lastLine);
          }
          break;
        }
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
  
      // Si es la última palabra
      if (i === words.length - 1) {
        if (lines.length < maxLines) {
          lines.push(line);
        }
      }
    }
  
    // Si no hay líneas (texto muy corto), agregar la única línea
    if (lines.length === 0 && line !== "") {
      lines.push(line);
    }
  
    // Limitar a máximo 3 líneas
    const finalLines = lines.slice(0, maxLines);
  
    // Dibujar las líneas
    finalLines.forEach((line, i) => {
      doc.text(line, x, y + i * lineHeight);
    });
  
    return finalLines.length * lineHeight;
  };
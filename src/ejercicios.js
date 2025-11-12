// ============================================
// EDITOR DE IMÁGENES CON ÁLGEBRA MATRICIAL
// ============================================
// Nombre del estudiante: Carlos Alfonso Llanes
// Fecha: 12/11/2025
 // Grupo: C

const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

// Importar funciones auxiliares (puedes usarlas)
const {
  crearMatrizVacia,
  validarMatriz,
  obtenerDimensiones,
  limitarValorColor,
  crearPixel,
  copiarMatriz,
  asegurarDirectorio
} = require('./utilidades');

// Importar operaciones matriciales (puedes usarlas)
const {
  sumarMatrices,
  restarMatrices,
  multiplicarPorEscalar,
  multiplicarMatrices,
  transponerMatriz
} = require('./matriz');

// ============================================
// SECCIÓN 1: FUNDAMENTOS (20 puntos)
// Conversión entre imágenes y matrices
// ============================================

/**
 * Ejercicio 1.1: Cargar imagen PNG y convertir a matriz de píxeles (5 puntos)
 * 
 * Una imagen es una matriz donde cada elemento es un pixel con valores RGBA.
 * Debes leer el archivo PNG y crear una matriz donde:
 * - Cada fila representa una fila de píxeles de la imagen
 * - Cada elemento es un objeto: {r: 0-255, g: 0-255, b: 0-255, a: 0-255}
 * 
 * @param {string} rutaImagen - Ruta del archivo PNG
 * @returns {Array<Array<Object>>} - Matriz de píxeles
 * 
 * Pistas:
 * - Usa PNG.sync.read() para leer la imagen
 * - png.width y png.height te dan las dimensiones
 * - png.data es un Buffer con formato [R,G,B,A, R,G,B,A, ...]
 * - El índice en el buffer para el pixel (x,y) es: idx = (width * y + x) * 4
 * 
 * @example
 * const matriz = imagenAMatriz('imagenes/entrada/test_pequeña.png');
 * // matriz[0][0] = {r: 0, g: 0, b: 128, a: 255}
 */
function imagenAMatriz(rutaImagen) {
  // Leer el archivo PNG
  const buffer = fs.readFileSync(rutaImagen);
  const png = PNG.sync.read(buffer);
  
  // Crear la matriz vacía
  const matriz = [];
  
  // Recorrer cada fila (y) y cada columna (x)
  for (let y = 0; y < png.height; y++) {
    const fila = [];
    for (let x = 0; x < png.width; x++) {
      // Calcular el índice en el buffer
      const idx = (png.width * y + x) * 4; // o usar << 2 equivalente a * 4
      
      // Extraer los valores RGBA
      const pixel = {
        r: png.data[idx],
        g: png.data[idx + 1],
        b: png.data[idx + 2],
        a: png.data[idx + 3]
      };
      
      fila.push(pixel);
    }
    matriz.push(fila);
  }
  
  // Retornar la matriz
  return matriz;
}

/** 
 * Ejercicio 1.2: Convertir matriz de píxeles a imagen PNG (5 puntos)
 * 
 * Proceso inverso: tomar una matriz de píxeles y guardarla como PNG.
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles {r,g,b,a}
 * @param {string} rutaSalida - Ruta donde guardar el PNG
 * 
 * Pistas:
 * - Usa new PNG({width, height}) para crear la imagen
 * - Recorre la matriz y llena png.data con los valores
 * - Usa PNG.sync.write(png) para generar el buffer
 * - Usa fs.writeFileSync() para guardar el archivo 
 * 
 * @example
 * const matriz = imagenAMatriz('entrada.png');
 * matrizAImagen(matriz, 'imagenes/salida/copia.png');
 */
function matrizAImagen(matriz, rutaSalida) {
  // Validar que la matriz no esté vacía
  validarMatriz(matriz);
  
  // Obtener las dimensiones de la matriz (filas y columnas)
  const dims = obtenerDimensiones(matriz);
  
  // Crear un nuevo objeto PNG con las dimensiones obtenidas
  const png = new PNG({
    width: dims.columnas,
    height: dims.filas
  });
  
  // Llenar el buffer png.data recorriendo cada pixel de la matriz
  for (let y = 0; y < dims.filas; y++) {
    for (let x = 0; x < dims.columnas; x++) {
      // Calcular el índice en el buffer (mismo cálculo que en imagenAMatriz)
      const idx = (dims.columnas * y + x) * 4;
      const pixel = matriz[y][x];
      
      // Asignar cada componente RGBA al buffer, limitando valores entre 0-255
      png.data[idx] = limitarValorColor(pixel.r);
      png.data[idx + 1] = limitarValorColor(pixel.g);
      png.data[idx + 2] = limitarValorColor(pixel.b);
      png.data[idx + 3] = limitarValorColor(pixel.a);
    }
  }
  
  // Asegurar que el directorio de salida existe
  asegurarDirectorio(path.dirname(rutaSalida));
  
  // Convertir el PNG a buffer y guardarlo en el archivo
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(rutaSalida, buffer);
}

/**
 * Ejercicio 1.3: Obtener un canal específico de color (5 puntos)
 * 
 * Extrae solo un canal (R, G, o B) de la imagen y crea una imagen en escala de grises
 * donde ese canal es el valor de gris.
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @param {string} canal - 'r', 'g', o 'b'
 * @returns {Array<Array<Object>>} - Matriz con solo ese canal
 * 
 * @example
 * const matriz = imagenAMatriz('imagen.png');
 * const soloRojo = obtenerCanal(matriz, 'r');
 * // Si un pixel era {r:200, g:100, b:50, a:255}
 * // Ahora será {r:200, g:200, b:200, a:255} (gris)
 */
function obtenerCanal(matriz, canal) {
  // Primero checo que me hayan pasado un canal válido (r, g o b)
  if (!['r', 'g', 'b'].includes(canal)) {
    throw new Error("El canal debe ser 'r', 'g', o 'b'");
  }
  
  // Copio la matriz para no modificar la original
  const resultado = copiarMatriz(matriz);
  
  // Recorro cada pixel de la imagen
  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      // Agarro solo el valor del canal que me pidieron (ej: si es 'r', solo el rojo)
      const valor = matriz[i][j][canal];
      
      // Hago que los tres canales RGB tengan el mismo valor
      // Esto crea un gris porque cuando R=G=B obtienes un tono gris
      resultado[i][j] = {
        r: valor,
        g: valor,
        b: valor,
        a: matriz[i][j].a  // La transparencia la dejo igual
      };
    }
  }
  
  return resultado;
}

/**
 * Ejercicio 1.4: Obtener dimensiones de una imagen (5 puntos)
 * 
 * @param {string} rutaImagen - Ruta del archivo PNG
 * @returns {Object} - {ancho, alto, totalPixeles}
 * 
 * @example
 * const dims = obtenerDimensionesImagen('test.png');
 * // {ancho: 100, alto: 100, totalPixeles: 10000}
 */
function obtenerDimensionesImagen(rutaImagen) {
  // Leo el archivo PNG (solo necesito el header, no todos los pixeles)
  const buffer = fs.readFileSync(rutaImagen);
  const png = PNG.sync.read(buffer);
  
  // Agarro el ancho y alto directamente del PNG
  const ancho = png.width;
  const alto = png.height;
  
  // Calculo cuántos pixeles hay en total (ancho x alto)
  const totalPixeles = ancho * alto;
  
  // Regreso un objeto con toda la info
  return { 
    ancho: ancho, 
    alto: alto, 
    totalPixeles: totalPixeles 
  };
}

// ============================================
// SECCIÓN 2: OPERACIONES BÁSICAS (25 puntos)
// Aplicar álgebra matricial a píxeles
// ============================================

/**
 * Ejercicio 2.1: Ajustar brillo (8 puntos)
 * 
 * El brillo se ajusta multiplicando cada canal RGB por un factor.
 * Esto es una MULTIPLICACIÓN ESCALAR aplicada a cada canal.
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @param {number} factor - Factor de brillo (0.5 = más oscuro, 2.0 = más claro)
 * @returns {Array<Array<Object>>} - Matriz con brillo ajustado
 * 
 * Concepto matemático:
 * Si factor = 1.5, entonces:
 * R_nuevo = R_original * 1.5
 * G_nuevo = G_original * 1.5
 * B_nuevo = B_original * 1.5
 * 
 * @example
 * const brillante = ajustarBrillo(matriz, 1.5); // 50% más claro
 * const oscuro = ajustarBrillo(matriz, 0.5);    // 50% más oscuro
 */
function ajustarBrillo(matriz, factor) {
  // Copio la matriz para no romper la original
  const resultado = copiarMatriz(matriz);
  
  // Recorro cada pixel de la imagen
  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      // Multiplico cada color (R, G, B) por el factor de brillo
      // Si factor es 1.5, cada color se hace 1.5 veces más brillante
      // Si factor es 0.5, cada color se hace más oscuro (la mitad)
      resultado[i][j].r = limitarValorColor(matriz[i][j].r * factor);
      resultado[i][j].g = limitarValorColor(matriz[i][j].g * factor);
      resultado[i][j].b = limitarValorColor(matriz[i][j].b * factor);
      // El alpha (transparencia) NO se toca, sino se vería raro
    }
  }
  
  return resultado;
}

/**
 * Ejercicio 2.2: Invertir colores (8 puntos)
 * 
 * Invierte los colores usando la operación: nuevo = 255 - original
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @returns {Array<Array<Object>>} - Matriz con colores invertidos
 * 
 * Concepto matemático:
 * R_nuevo = 255 - R_original
 * G_nuevo = 255 - G_original
 * B_nuevo = 255 - B_original
 * 
 * @example
 * const negativo = invertirColores(matriz);
 * // Blanco (255,255,255) → Negro (0,0,0)
 * // Rojo (255,0,0) → Cian (0,255,255)
 */
function invertirColores(matriz) {
  // Copio la matriz para no tocar la original
  const resultado = copiarMatriz(matriz);
  
  // Recorro cada pixel
  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      // La magia está en restarle a 255 cada color
      // Si un color era muy alto (claro), ahora será bajo (oscuro) y viceversa
      // 255 - 255 = 0 (blanco se vuelve negro)
      // 255 - 0 = 255 (negro se vuelve blanco)
      // 255 - 200 = 55 (un color claro se vuelve oscuro)
      resultado[i][j].r = limitarValorColor(255 - matriz[i][j].r);
      resultado[i][j].g = limitarValorColor(255 - matriz[i][j].g);
      resultado[i][j].b = limitarValorColor(255 - matriz[i][j].b);
      // El alpha no se invierte, queremos mantener la transparencia igual
    }
  }
  
  return resultado;
}

/**
 * Ejercicio 2.3: Convertir a escala de grises (9 puntos)
 * 
 * Convierte la imagen a escala de grises usando el promedio ponderado:
 * Gris = 0.299*R + 0.587*G + 0.114*B
 * 
 * Estos pesos reflejan la sensibilidad del ojo humano a cada color.
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @returns {Array<Array<Object>>} - Matriz en escala de grises
 * 
 * @example
 * const grises = convertirEscalaGrises(matriz);
 */
function convertirEscalaGrises(matriz) {
  // Copio la matriz original para no modificarla
  const resultado = copiarMatriz(matriz);
  
  // Recorro cada pixel de la imagen
  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      // Aquí está la fórmula mágica del ojo humano
      // Nuestros ojos son MÁS sensibles al verde (0.587), luego al rojo (0.299)
      // y MENOS sensibles al azul (0.114)
      // Por eso no es un simple promedio (R+G+B)/3, sino estos pesos especiales
      const gris = 0.299 * matriz[i][j].r + 
                   0.587 * matriz[i][j].g + 
                   0.114 * matriz[i][j].b;
      
      // Pongo el mismo valor de gris en los tres canales RGB
      // Cuando R=G=B el cerebro lo percibe como gris
      resultado[i][j] = {
        r: limitarValorColor(gris),
        g: limitarValorColor(gris),
        b: limitarValorColor(gris),
        a: matriz[i][j].a  // La transparencia no cambia
      };
    }
  }
  
  return resultado;
}

// ============================================
// SECCIÓN 3: TRANSFORMACIONES GEOMÉTRICAS (30 puntos)
// Aplicar operaciones matriciales para transformar
// ============================================

/**
 * Ejercicio 3.1: Voltear horizontal (espejo) (10 puntos)
 * 
 * Voltea la imagen horizontalmente (efecto espejo).
 * Cada fila se invierte: [1,2,3] → [3,2,1]
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @returns {Array<Array<Object>>} - Matriz volteada horizontalmente
 * 
 * Concepto matemático:
 * pixel[i][j] → pixel[i][ancho - 1 - j]
 * 
 * @example
 * const espejo = voltearHorizontal(matriz);
 */
function voltearHorizontal(matriz) {
  // Creo una matriz nueva para guardar el resultado
  const resultado = [];
  
  // Recorro cada fila de la imagen
  for (let i = 0; i < matriz.length; i++) {
    // Aquí está el truco: uso .reverse() para invertir cada fila
    // .slice() primero hace una copia de la fila para no modificar la original
    // Es como tomar [pixel1, pixel2, pixel3] y voltearlo a [pixel3, pixel2, pixel1]
    // Así lo que estaba a la izquierda ahora está a la derecha (efecto espejo)
    const filaVolteada = matriz[i].slice().reverse();
    resultado.push(filaVolteada);
  }
  
  return resultado;
}

/**
 * Ejercicio 3.2: Voltear vertical (10 puntos)
 * 
 * Voltea la imagen verticalmente (de arriba hacia abajo).
 * El orden de las filas se invierte.
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @returns {Array<Array<Object>>} - Matriz volteada verticalmente
 * 
 * Concepto matemático:
 * pixel[i][j] → pixel[alto - 1 - i][j]
 * 
 * @example
 * const invertido = voltearVertical(matriz);
 */
function voltearVertical(matriz) {
  // Este es más simple que el horizontal
  // Aquí no toco las filas individualmente, solo cambio su ORDEN
  // Es como tomar todo el stack de filas y voltearlo de arriba a abajo
  
  // .slice() hace una copia de la matriz completa (no modifica la original)
  // .reverse() voltea el orden de las filas
  // La primera fila ahora es la última, y la última es la primera
  // Es como voltear una foto de cabeza
  return matriz.slice().reverse();
}

/**
 * Ejercicio 3.3: Rotar 90 grados en sentido horario (10 puntos)
 * 
 * Rota la imagen 90° en sentido horario.
 * Esto se logra con: TRANSPONER + VOLTEAR HORIZONTAL
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @returns {Array<Array<Object>>} - Matriz rotada 90°
 * 
 * Concepto matemático:
 * 1. Transponer: pixel[i][j] → pixel[j][i]
 * 2. Voltear horizontal: invertir cada fila
 * 
 * Puedes usar transponerMatriz() de matriz.js (¡pero cuidado! trabaja con números, 
 * no con objetos pixel)
 * 
 * @example
 * const rotada = rotar90Grados(matriz);
 */
function rotar90Grados(matriz) {
  // PASO 1: TRANSPONER la matriz
  // Transponer significa intercambiar filas por columnas
  // Lo que estaba en posición [i][j] ahora va a [j][i]
  // Básicamente "giras" la matriz en diagonal
  
  const filas = matriz.length;
  const columnas = matriz[0].length;
  
  // Creo una matriz nueva con dimensiones intercambiadas
  // Si era 3x5 (3 filas, 5 columnas), ahora será 5x3
  const transpuesta = [];
  for (let j = 0; j < columnas; j++) {
    const nuevaFila = [];
    for (let i = 0; i < filas; i++) {
      // Aquí está la magia: intercambio i y j
      // Lo que estaba en matriz[i][j] ahora va a transpuesta[j][i]
      nuevaFila.push(matriz[i][j]);
    }
    transpuesta.push(nuevaFila);
  }
  
  // PASO 2: VOLTEAR HORIZONTAL
  // Ahora uso la función que ya hicimos antes
  // Esto completa la rotación de 90 grados
  return voltearHorizontal(transpuesta);
}

// ============================================
// SECCIÓN 4: FILTROS AVANZADOS (25 puntos)
// Operaciones más complejas
// ============================================

/**
 * Ejercicio 4.1: Mezclar dos imágenes (8 puntos)
 * 
 * Mezcla dos imágenes usando un factor de mezcla.
 * resultado = imagen1 * (1 - factor) + imagen2 * factor
 * 
 * Esto es una COMBINACIÓN LINEAL de matrices.
 * 
 * @param {Array<Array<Object>>} matriz1 - Primera imagen
 * @param {Array<Array<Object>>} matriz2 - Segunda imagen
 * @param {number} factor - Factor de mezcla (0.0 a 1.0)
 *                          0.0 = solo imagen1
 *                          0.5 = 50% de cada una
 *                          1.0 = solo imagen2
 * @returns {Array<Array<Object>>} - Imagen mezclada
 * 
 * @example
 * const mezcla = mezclarImagenes(imagen1, imagen2, 0.5); // 50/50
 */
function mezclarImagenes(matriz1, matriz2, factor) {
  // Primero checo que las dos imágenes tengan el mismo tamaño
  // No puedes mezclar una foto de 100x100 con una de 200x300
  const dims1 = obtenerDimensiones(matriz1);
  const dims2 = obtenerDimensiones(matriz2);
  
  if (dims1.filas !== dims2.filas || dims1.columnas !== dims2.columnas) {
    throw new Error('Las imágenes deben tener el mismo tamaño');
  }
  
  // Creo la matriz resultado
  const resultado = copiarMatriz(matriz1);
  
  // Recorro cada pixel de ambas imágenes
  for (let i = 0; i < dims1.filas; i++) {
    for (let j = 0; j < dims1.columnas; j++) {
      // Aquí está la fórmula mágica de mezcla:
      // Cada color = (color1 × peso1) + (color2 × peso2)
      // donde peso1 = (1 - factor) y peso2 = factor
      
      // Si factor = 0.3:
      //   peso1 = 0.7 (70% de imagen1)
      //   peso2 = 0.3 (30% de imagen2)
      
      // Si factor = 0.5:
      //   peso1 = 0.5 (50% de imagen1)
      //   peso2 = 0.5 (50% de imagen2)
      
      resultado[i][j].r = limitarValorColor(
        matriz1[i][j].r * (1 - factor) + matriz2[i][j].r * factor
      );
      resultado[i][j].g = limitarValorColor(
        matriz1[i][j].g * (1 - factor) + matriz2[i][j].g * factor
      );
      resultado[i][j].b = limitarValorColor(
        matriz1[i][j].b * (1 - factor) + matriz2[i][j].b * factor
      );
      resultado[i][j].a = limitarValorColor(
        matriz1[i][j].a * (1 - factor) + matriz2[i][j].a * factor
      );
    }
  }
  
  return resultado;
}

/**
 * Ejercicio 4.2: Filtro Sepia (9 puntos)
 * 
 * Aplica el efecto sepia (tono vintage/antiguo).
 * Usa la siguiente transformación matricial:
 * 
 * R_nuevo = 0.393*R + 0.769*G + 0.189*B
 * G_nuevo = 0.349*R + 0.686*G + 0.168*B
 * B_nuevo = 0.272*R + 0.534*G + 0.131*B
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @returns {Array<Array<Object>>} - Imagen con efecto sepia
 * 
 * @example
 * const vintage = aplicarSepia(matriz);
 */
function aplicarSepia(matriz) {
  // Copio la matriz para no tocar la original
  const resultado = copiarMatriz(matriz);
  
  // Recorro cada pixel
  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      // Guardo los valores originales porque los voy a necesitar para calcular los 3 canales
      const r_original = matriz[i][j].r;
      const g_original = matriz[i][j].g;
      const b_original = matriz[i][j].b;
      
      // Aplico la transformación sepia - cada nuevo color es una mezcla de los 3 originales
      // Estas fórmulas crean ese tono marrón-amarillento de las fotos antiguas
      // Los números vienen de estudios sobre cómo lucían las fotos en blanco y negro teñidas
      
      // Calculo el nuevo rojo (mucho verde original le da calidez)
      const nuevoR = 0.393 * r_original + 0.769 * g_original + 0.189 * b_original;
      
      // Calculo el nuevo verde (balanceado entre los 3)
      const nuevoG = 0.349 * r_original + 0.686 * g_original + 0.168 * b_original;
      
      // Calculo el nuevo azul (menos azul para dar ese tono café/amarillo)
      const nuevoB = 0.272 * r_original + 0.534 * g_original + 0.131 * b_original;
      
      // Asigno los nuevos valores, limitándolos entre 0-255
      resultado[i][j].r = limitarValorColor(nuevoR);
      resultado[i][j].g = limitarValorColor(nuevoG);
      resultado[i][j].b = limitarValorColor(nuevoB);
      // El alpha no cambia
    }
  }
  
  return resultado;
}

/**
 * Ejercicio 4.3: Detectar bordes (simplificado) (8 puntos)
 * 
 * Detecta bordes comparando cada pixel con sus vecinos.
 * Si la diferencia es grande, hay un borde.
 * 
 * Este es un operador Sobel simplificado.
 * 
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @param {number} umbral - Umbral de detección (0-255), default: 50
 * @returns {Array<Array<Object>>} - Imagen de bordes (blanco y negro)
 * 
 * Algoritmo simplificado:
 * 1. Convertir a escala de grises
 * 2. Para cada pixel, calcular diferencia con vecinos
 * 3. Si diferencia > umbral, es borde (blanco), sino negro
 * 
 * @example
 * const bordes = detectarBordes(matriz, 50);
 */
function detectarBordes(matriz, umbral = 50) {
  // PASO 1: Convertir a escala de grises primero
  // Los bordes se detectan mejor en imágenes grises porque solo nos importa
  // la INTENSIDAD de luz, no el color
  const grises = convertirEscalaGrises(matriz);
  
  const filas = grises.length;
  const columnas = grises[0].length;
  
  // PASO 2: Crear matriz resultado (inicialmente todo negro)
  const resultado = [];
  for (let i = 0; i < filas; i++) {
    const fila = [];
    for (let j = 0; j < columnas; j++) {
      fila.push({ r: 0, g: 0, b: 0, a: 255 }); // Negro
    }
    resultado.push(fila);
  }
  
  // PASO 3: Recorrer cada pixel (excepto los del borde de la imagen)
  // Empiezo en 1 y termino en filas-1 porque necesito comparar con vecinos
  // Si empezara en 0, no tendría vecino de arriba, y me daría error
  for (let i = 1; i < filas - 1; i++) {
    for (let j = 1; j < columnas - 1; j++) {
      
      // OPERADOR SOBEL SIMPLIFICADO
      // El operador Sobel detecta cambios bruscos de intensidad
      // Compara el pixel actual con sus 8 vecinos
      
      // Calculo diferencia HORIZONTAL (izquierda vs derecha)
      // Si hay mucha diferencia entre izquierda y derecha, hay un borde vertical
      const gx = 
        // Columna derecha (suma de 3 pixeles de la derecha)
        grises[i-1][j+1].r + grises[i][j+1].r + grises[i+1][j+1].r -
        // Columna izquierda (resta de 3 pixeles de la izquierda)
        (grises[i-1][j-1].r + grises[i][j-1].r + grises[i+1][j-1].r);
      
      // Calculo diferencia VERTICAL (arriba vs abajo)
      // Si hay mucha diferencia entre arriba y abajo, hay un borde horizontal
      const gy = 
        // Fila de abajo (suma de 3 pixeles de abajo)
        grises[i+1][j-1].r + grises[i+1][j].r + grises[i+1][j+1].r -
        // Fila de arriba (resta de 3 pixeles de arriba)
        (grises[i-1][j-1].r + grises[i-1][j].r + grises[i-1][j+1].r);
      
      // Calculo la MAGNITUD del gradiente usando Pitágoras
      // Es como calcular la hipotenusa: √(gx² + gy²)
      // Esto me dice QUÉ TAN FUERTE es el borde
      const magnitud = Math.sqrt(gx * gx + gy * gy);
      
      // Si la magnitud es mayor que el umbral, HAY UN BORDE
      // Entonces pinto el pixel de BLANCO, sino lo dejo NEGRO
      if (magnitud > umbral) {
        resultado[i][j] = { r: 255, g: 255, b: 255, a: 255 }; // Blanco = borde
      }
      // Si no supera el umbral, ya está negro por default
    }
  }
  
  return resultado;
}

// ============================================
// NO MODIFICAR - Exportación de funciones
// ============================================
module.exports = {
  // Sección 1: Fundamentos
  imagenAMatriz,
  matrizAImagen,
  obtenerCanal,
  obtenerDimensionesImagen,
  
  // Sección 2: Operaciones Básicas
  ajustarBrillo,
  invertirColores,
  convertirEscalaGrises,
  
  // Sección 3: Transformaciones
  voltearHorizontal,
  voltearVertical,
  rotar90Grados,
  
  // Sección 4: Filtros Avanzados
  mezclarImagenes,
  aplicarSepia,
  detectarBordes
};

var SIGNOS = [
  // SALUDOS
  {g:"HOLA",cat:"saludos",icon:"👋",cm:"Mano abierta (5)",loc:"Espacio neutro frontal",mov:"Abrir y cerrar mano",op:"Frente",cnm:"Sonrisa, cabeza ladeada",def:"Saludo inicial, equivalente a hola o buenos días.",video:"saludos/hola.mp4"},
  {g:"ADIÓS",cat:"saludos",icon:"👋",cm:"Mano abierta (5)",loc:"Altura del hombro",mov:"Agitar la mano lateralmente",op:"Frente",cnm:"Sonrisa leve",def:"Despedida, equivalente a adiós o hasta luego.",video:"saludos/adios.mp4"},
  {g:"BUENOS DÍAS",cat:"saludos",icon:"🌅",cm:"Mano abierta (5) ambas",loc:"Rostro→pecho",mov:"Descender juntas",op:"Cuerpo",cnm:"Sonrisa, inclinación cabeza",def:"Saludo matutino.",video:"saludos/buenosdias.mp4"},
  {g:"GRACIAS",cat:"saludos",icon:"🙏",cm:"Mano plana",loc:"Barbilla→frente",mov:"Desde barbilla hacia adelante",op:"Arriba",cnm:"Inclinación cabeza",def:"Agradecimiento.",video:"saludos/gracias.mp4"},
  {g:"POR FAVOR",cat:"saludos",icon:"🤲",cm:"Mano plana sobre pecho",loc:"Pecho",mov:"Movimiento circular",op:"Cuerpo",cnm:"Cabeza ladeada",def:"Petición cortés.",video:"saludos/porfavor.mp4"},
  {g:"PERDÓN",cat:"saludos",icon:"🙇",cm:"Puño",loc:"Pecho",mov:"Golpe suave en el pecho",op:"Cuerpo",cnm:"Cabeza baja",def:"Disculpa.",video:""},
  {g:"SÍ",cat:"saludos",icon:"👍",cm:"Puño",loc:"Espacio neutro",mov:"Asentir con el puño",op:"Frente",cnm:"Cabeza asintiendo",def:"Afirmación.",video:""},
  {g:"NO",cat:"saludos",icon:"👎",cm:"Índice y medio",loc:"Espacio neutro",mov:"Movimiento lateral",op:"Frente",cnm:"Cabeza negando",def:"Negación.",video:""},

  // FAMILIA
  {g:"MADRE",cat:"familia",icon:"👩",cm:"Mano abierta",loc:"Mejilla",mov:"Acariciar mejilla",op:"Cuerpo",cnm:"Sonrisa",def:"Madre.",video:"familia/madre.mp4"},
  {g:"PADRE",cat:"familia",icon:"👨",cm:"Mano abierta",loc:"Frente",mov:"Tocar frente",op:"Cuerpo",cnm:"",def:"Padre.",video:"familia/padre.mp4"},
  {g:"HIJO",cat:"familia",icon:"👦",cm:"Mano en cuenco",loc:"Pecho",mov:"Movimiento descendente",op:"Cuerpo",cnm:"",def:"Hijo o hija.",video:""},
  {g:"HERMANO",cat:"familia",icon:"👫",cm:"Mano en V",loc:"Pecho",mov:"Movimiento lateral",op:"Cuerpo",cnm:"",def:"Hermano.",video:""},
  {g:"ABUELO",cat:"familia",icon:"👴",cm:"Puño",loc:"Barbilla",mov:"Movimiento hacia abajo",op:"Cuerpo",cnm:"",def:"Abuelo.",video:""},
  {g:"BEBÉ",cat:"familia",icon:"👶",cm:"Brazos meciendo",loc:"Ante pecho",mov:"Mecer",op:"Arriba",cnm:"Sonrisa",def:"Bebé recién nacido.",video:""},
  {g:"FAMILIA",cat:"familia",icon:"👨‍👩‍👧",cm:"Ambas manos abiertas",loc:"Frente al pecho",mov:"Círculo con ambas manos",op:"Cuerpo",cnm:"",def:"Familia.",video:""},

  // COMIDA
  {g:"COMER",cat:"comida",icon:"🍽️",cm:"Mano en pinza",loc:"Boca",mov:"Pinza hacia la boca",op:"Cuerpo",cnm:"",def:"Comer, alimentarse.",video:"comida/comer.mp4"},
  {g:"BEBER",cat:"comida",icon:"🥤",cm:"Mano en cuenco",loc:"Boca",mov:"Cuenco hacia la boca",op:"Arriba",cnm:"",def:"Beber.",video:""},
  {g:"AGUA",cat:"comida",icon:"💧",cm:"Mano en W",loc:"Boca",mov:"Tocar la boca",op:"Cuerpo",cnm:"",def:"Agua.",video:"comida/agua.mp4"},
  {g:"ARROZ",cat:"comida",icon:"🍚",cm:"Pinza",loc:"Boca",mov:"Llevar a boca repetidamente",op:"Cuerpo",cnm:"",def:"Arroz.",video:""},
  {g:"PAN",cat:"comida",icon:"🍞",cm:"Mano extendida",loc:"Espacio neutro",mov:"Sostener trozo de pan",op:"Arriba",cnm:"",def:"Pan.",video:""},
  {g:"CARNE",cat:"comida",icon:"🥩",cm:"Mano como desgarrar",loc:"Boca",mov:"Movimiento de desgarrar con dientes",op:"Cuerpo",cnm:"",def:"Carne.",video:""},
  {g:"PLÁTANO",cat:"comida",icon:"🍌",cm:"Puño",loc:"Espacio neutro",mov:"Movimiento de pelar",op:"Frente",cnm:"",def:"Plátano, banana.",video:""},

  // VERBOS
  {g:"IR",cat:"verbos",icon:"🚶",cm:"Mano plana",loc:"Espacio neutro",mov:"Hacia adelante",op:"Frente",cnm:"",def:"Ir, desplazarse.",video:"verbos/ir.mp4"},
  {g:"VENIR",cat:"verbos",icon:"🚶‍♂️",cm:"Mano plana",loc:"Espacio neutro",mov:"Hacia el cuerpo",op:"Cuerpo",cnm:"",def:"Venir.",video:""},
  {g:"DORMIR",cat:"verbos",icon:"😴",cm:"Mano plana",loc:"Mejilla",mov:"Apoyar cabeza",op:"Cuerpo",cnm:"Ojos cerrados",def:"Dormir.",video:"verbos/dormir.mp4"},
  {g:"LEER",cat:"verbos",icon:"📖",cm:"Mano abierta",loc:"Frente a ojos",mov:"Lateral como lectura",op:"Frente",cnm:"",def:"Leer.",video:""},
  {g:"ESCRIBIR",cat:"verbos",icon:"✍️",cm:"Pinza",loc:"Espacio neutro",mov:"Escribir en el aire",op:"Frente",cnm:"",def:"Escribir.",video:""},
  {g:"VER",cat:"verbos",icon:"👀",cm:"Mano en V desde ojos",loc:"Ojos",mov:"Hacia adelante",op:"Frente",cnm:"",def:"Ver, mirar.",video:""},
  {g:"HABLAR",cat:"verbos",icon:"🗣️",cm:"Mano cerca boca",loc:"Boca",mov:"Ondulante hacia afuera",op:"Frente",cnm:"",def:"Hablar, comunicarse.",video:""},

  // TIEMPO
  {g:"HOY",cat:"tiempo",icon:"📅",cm:"Mano plana",loc:"Pecho",mov:"Tocar el pecho",op:"Cuerpo",cnm:"",def:"Hoy.",video:""},
  {g:"AYER",cat:"tiempo",icon:"⏪",cm:"Pulgar",loc:"Hombro",mov:"Hacia atrás sobre el hombro",op:"Atrás",cnm:"",def:"Ayer.",video:"tiempo/ayer.mp4"},
  {g:"MAÑANA",cat:"tiempo",icon:"⏩",cm:"Brazo extendido",loc:"Espacio neutro",mov:"Hacia adelante",op:"Frente",cnm:"",def:"Mañana.",video:"tiempo/manana.mp4"},
  {g:"DÍA",cat:"tiempo",icon:"☀️",cm:"Brazo señalando",loc:"Arriba",mov:"Señalar al cielo",op:"Arriba",cnm:"",def:"Día.",video:""},
  {g:"NOCHE",cat:"tiempo",icon:"🌙",cm:"Manos como cortinas",loc:"Frente a ojos",mov:"Cerrarse sobre ojos",op:"Cuerpo",cnm:"Ojos cerrados",def:"Noche.",video:""},

  // COLORES
  {g:"ROJO",cat:"colores",icon:"🔴",cm:"Índice",loc:"Labio inferior",mov:"Tocar el labio",op:"Cuerpo",cnm:"",def:"Color rojo.",video:""},
  {g:"AZUL",cat:"colores",icon:"🔵",cm:"Mano temblorosa",loc:"Altura hombro",mov:"Temblor",op:"Frente",cnm:"",def:"Color azul.",video:""},
  {g:"VERDE",cat:"colores",icon:"🟢",cm:"Mano ondulante",loc:"Desde el pecho",mov:"Ondulante hacia afuera",op:"Frente",cnm:"",def:"Color verde.",video:""},
  {g:"NEGRO",cat:"colores",icon:"⚫",cm:"Índice",loc:"Frente",mov:"Deslizar por la frente",op:"Cuerpo",cnm:"",def:"Color negro.",video:""},
  {g:"BLANCO",cat:"colores",icon:"⚪",cm:"Mano abierta",loc:"Pecho",mov:"Hacia afuera",op:"Frente",cnm:"",def:"Color blanco.",video:""},

  // NÚMEROS
  {g:"UNO",cat:"numeros",icon:"1️⃣",cm:"Índice extendido",loc:"Espacio neutro",mov:"Estático",op:"Frente",cnm:"",def:"Número 1.",video:""},
  {g:"DOS",cat:"numeros",icon:"2️⃣",cm:"Índice y medio",loc:"Espacio neutro",mov:"Estático",op:"Frente",cnm:"",def:"Número 2.",video:""},
  {g:"TRES",cat:"numeros",icon:"3️⃣",cm:"Índice, medio, anular",loc:"Espacio neutro",mov:"Estático",op:"Frente",cnm:"",def:"Número 3.",video:""},
  {g:"CUATRO",cat:"numeros",icon:"4️⃣",cm:"4 dedos extendidos",loc:"Espacio neutro",mov:"Estático",op:"Frente",cnm:"",def:"Número 4.",video:""},
  {g:"CINCO",cat:"numeros",icon:"5️⃣",cm:"Mano abierta completa",loc:"Espacio neutro",mov:"Estático",op:"Frente",cnm:"",def:"Número 5.",video:""},

  // LUGARES
  {g:"CASA",cat:"lugares",icon:"🏠",cm:"Ambas manos planas",loc:"Frente al pecho",mov:"Formar techo triangular",op:"Cuerpo",cnm:"",def:"Casa, hogar.",video:""},
  {g:"ESCUELA",cat:"lugares",icon:"🏫",cm:"Pinza escribiendo",loc:"Espacio neutro",mov:"Escribir + Casa",op:"Frente",cnm:"",def:"Escuela.",video:""},
  {g:"IGLESIA",cat:"lugares",icon:"⛪",cm:"Manos juntas",loc:"Frente pecho",mov:"Manos en oración",op:"Cuerpo",cnm:"",def:"Iglesia.",video:""},
  {g:"HOSPITAL",cat:"lugares",icon:"🏥",cm:"Cruz en el brazo",loc:"Brazo",mov:"Dibujar cruz",op:"Cuerpo",cnm:"",def:"Hospital.",video:""},
  {g:"MERCADO",cat:"lugares",icon:"🛒",cm:"Manos abiertas",loc:"Espacio neutro",mov:"Intercambiar",op:"Frente",cnm:"",def:"Mercado.",video:""}
];

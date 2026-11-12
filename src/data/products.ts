import type { DeliveryOptions, Product } from '../types'

const DAY = 86_400_000
const ago = (days: number) => Date.now() - days * DAY

const both = (cost: number, zones: string): DeliveryOptions => ({
  pickup: true,
  shipping: true,
  shippingCost: cost,
  shippingZones: zones,
})
const pickupOnly: DeliveryOptions = { pickup: true, shipping: false, shippingCost: 0, shippingZones: '' }
const shipOnly = (cost: number, zones: string): DeliveryOptions => ({
  pickup: false,
  shipping: true,
  shippingCost: cost,
  shippingZones: zones,
})

/**
 * Fotos reales de Wikimedia Commons (licencias libres), elegidas por tema para cada regalo.
 * Se enlazan por nombre de archivo; {w} lo completa <ProductImage /> según el tamaño que necesita cada pantalla.
 * Créditos y enlaces a cada foto: PHOTO_CREDITS.md. Para fotos propias usa rutas locales: '/images/mi-foto.jpg'.
 */
const commons = (...files: string[]): string[] =>
  files.map((f) => `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width={w}`)

type Seed = Omit<Product, 'active' | 'createdAt'> & { days: number }

const seeds: Seed[] = [
  // ───────── Floristería Primavera (s1)
  {
    id: 'p1', sellerId: 's1', title: 'Ramo de girasoles', price: 120, images: commons('Sunflower_macro_wide.jpg', 'Sunflowers_helianthus_annuus.jpg', 'Sunflower_Field.jpg'), tone: ['#FFE08A', '#F5B83D'],
    description: 'Siete girasoles frescos con follaje verde y envoltura kraft. Alegría pura para cualquier ocasión.',
    holidays: ['primavera', 'dia-de-la-madre', 'cumpleanios'], categoryId: 'flores', stock: 12, sold: 86,
    audience: { gender: 'mujer', ages: ['joven', 'adulto', 'mayor'], interests: ['flores', 'plantas'] },
    delivery: both(15, 'Santa Cruz: Centro, Equipetrol y Zona Norte'), days: 90,
  },
  {
    id: 'p2', sellerId: 's1', title: 'Docena de rosas rojas', price: 180, images: commons('BEAUTIFUL_RED_ROSES.jpg', 'Red_rose.jpg', 'Close-up_shot_of_roses_in_2008.jpg'), tone: ['#FF9AA8', '#D6334F'],
    description: 'Doce rosas ecuatorianas de tallo largo, con baby’s breath y lazo de satén. Incluye tarjeta.',
    holidays: ['san-valentin', 'aniversario', 'dia-de-la-madre'], categoryId: 'flores', stock: 20, sold: 143,
    audience: { gender: 'mujer', ages: ['joven', 'adulto', 'mayor'], interests: ['flores'] },
    delivery: both(15, 'Santa Cruz: Centro, Equipetrol y Zona Norte'), days: 120,
  },
  {
    id: 'p3', sellerId: 's1', title: 'Arreglo de tulipanes amarillos', price: 95, images: commons('Yellow_fringed_tulip.jpg', 'Yellow_Tulips_(5718716847).jpg', 'Tulipani_gialli.JPG'), tone: ['#FFF0A8', '#F2C94C'],
    description: 'Tulipanes amarillos en caja de cartón decorada. El detalle perfecto para recibir la primavera.',
    holidays: ['primavera', 'cumpleanios'], categoryId: 'flores', stock: 9, sold: 41,
    audience: { gender: 'mujer', ages: ['joven', 'adulto', 'mayor'], interests: ['flores'] },
    delivery: both(15, 'Santa Cruz: Centro y Equipetrol'), days: 30,
  },
  {
    id: 'p4', sellerId: 's1', title: 'Caja de flores secas', price: 85, images: commons('Bouquet_of_white,_pink_and_yellow_flowers.jpg', 'Helichrysum_italicum.jpg'), tone: ['#F3DCC2', '#C9A27A'],
    description: 'Arreglo de flores preservadas que dura meses. Viene en caja de madera con tapa transparente.',
    holidays: ['dia-de-la-madre', 'aniversario', 'cumpleanios'], categoryId: 'flores', stock: 15, sold: 27,
    audience: { gender: 'mujer', ages: ['joven', 'adulto', 'mayor'], interests: ['flores', 'decoracion'] },
    delivery: both(15, 'Santa Cruz: Centro y Equipetrol'), days: 45,
  },
  {
    id: 'p5', sellerId: 's1', title: 'Mini suculenta con mensaje', price: 25, images: commons('A_small_potted_cactus.jpg', 'Echeveria,_Suculenta.jpg', 'Echeveria_derenbergii_-_JBM.jpg'), tone: ['#CDEBD0', '#7DBE88'],
    description: 'Suculenta en macetita de cerámica con una tarjeta pequeña para escribir tu mensaje.',
    holidays: ['navidad', 'dia-del-padre', 'cumpleanios'], categoryId: 'detalles', stock: 40, sold: 112,
    audience: { gender: 'todos', ages: ['joven', 'adulto', 'mayor'], interests: ['plantas', 'decoracion'] },
    delivery: both(10, 'Santa Cruz: Centro y Equipetrol'), days: 150,
  },

  // ───────── Detalles Lucía (s2)
  {
    id: 'p6', sellerId: 's2', title: 'Amigurumi personalizado', price: 90, images: commons('Crochet-amigurumi_equipment.jpg', 'Felt_monkey.jpg', 'Steiff_Teddy_Bear.jpg'), tone: ['#F3D2B3', '#D49A6A'],
    description: 'Muñeco tejido a crochet de 18 cm. Elige animal, color y bordado de nombre. Listo en 5 días.',
    holidays: ['cumpleanios', 'navidad', 'dia-de-la-madre'], categoryId: 'manualidades', stock: 6, sold: 58,
    audience: { gender: 'todos', ages: ['nino', 'joven'], interests: ['manualidades', 'juegos'] },
    delivery: both(20, 'Cochabamba: toda la ciudad'), days: 80,
  },
  {
    id: 'p7', sellerId: 's2', title: 'Tarjeta pop-up 3D', price: 35, images: commons('Handwritten_birthday_card.JPG', 'Greeting_card_Christmas_Victorian_1885.jpg'), tone: ['#FFD3DC', '#F28BA0'],
    description: 'Tarjeta artesanal que “florece” al abrirla. Escribimos tu mensaje con caligrafía a mano.',
    holidays: ['san-valentin', 'dia-de-la-madre', 'dia-del-padre', 'aniversario'], categoryId: 'detalles', stock: 30, sold: 97,
    audience: { gender: 'todos', ages: ['nino', 'joven', 'adulto', 'mayor'], interests: ['manualidades', 'recuerdos'] },
    delivery: both(10, 'Cochabamba: toda la ciudad'), days: 100,
  },
  {
    id: 'p8', sellerId: 's2', title: 'Pulsera tejida con inicial', price: 20, images: commons('Friendship_Bracelets.jpg', 'Friendship_Bracelet_Four_Classical_Element.jpg', 'Tying_friendship_bracelet.jpg'), tone: ['#E3D4FF', '#A98BE8'],
    description: 'Pulsera de hilo encerado con la inicial en cuentas. Ajustable, disponible en 8 colores.',
    holidays: ['cumpleanios', 'san-valentin', 'primavera'], categoryId: 'detalles', stock: 50, sold: 134,
    audience: { gender: 'todos', ages: ['nino', 'joven'], interests: ['moda', 'manualidades'] },
    delivery: both(8, 'Cochabamba: toda la ciudad'), days: 140,
  },
  {
    id: 'p9', sellerId: 's2', title: 'Cuadro bordado de flores', price: 140, images: commons('Laisy_Daisy_stitch_embroidery.jpg', 'Embroidery.jpeg'), tone: ['#FFE4CF', '#F0A870'],
    description: 'Bordado a mano sobre bastidor de 20 cm. Un regalo decorativo que se queda para siempre.',
    holidays: ['dia-de-la-madre', 'aniversario', 'cumpleanios'], categoryId: 'manualidades', stock: 4, sold: 19,
    audience: { gender: 'mujer', ages: ['adulto', 'mayor'], interests: ['manualidades', 'decoracion', 'flores'] },
    delivery: pickupOnly, days: 25,
  },
  {
    id: 'p10', sellerId: 's2', title: 'Vela aromática artesanal', price: 45, images: commons('Byredo_1996_scented_candle.jpg', 'Burning_candle_on_black_background.jpg', 'Candle-flame-no-reflection.jpg'), tone: ['#FFE9C2', '#E8B96A'],
    description: 'Vela de soya con aroma a vainilla, lavanda o canela. Dura más de 30 horas.',
    holidays: ['navidad', 'anio-nuevo', 'dia-de-la-madre', 'aniversario'], categoryId: 'detalles', stock: 35, sold: 76,
    audience: { gender: 'todos', ages: ['joven', 'adulto', 'mayor'], interests: ['bienestar', 'decoracion'] },
    delivery: both(10, 'Cochabamba: toda la ciudad'), days: 110,
  },

  // ───────── Garage Hot Wheels (s3)
  {
    id: 'p11', sellerId: 's3', title: 'Ramo de 12 Hot Wheels', price: 150, images: commons('Hot_wheels.jpg', 'Hot_Wheels_Custom_Camaro.jpg'), tone: ['#FFB38A', '#E8532F'],
    description: 'Doce autitos surtidos armados como ramo, con papel de regalo y lazo. El hit de los cumpleaños.',
    holidays: ['cumpleanios', 'dia-del-padre', 'navidad'], categoryId: 'juguetes', stock: 14, sold: 102,
    audience: { gender: 'todos', ages: ['nino', 'joven', 'adulto'], interests: ['autos', 'juegos'] },
    delivery: both(25, 'La Paz: Zona Sur y Centro'), days: 130,
  },
  {
    id: 'p12', sellerId: 's3', title: 'Hot Wheels edición especial', price: 40, images: commons('Hot_Wheels_-_Chevrolet_Impala_1964.JPG', 'Hot_Wheels_Modellauto.jpg'), tone: ['#BFD9FF', '#4F86E8'],
    description: 'Un auto coleccionable en blíster original, ideal como detalle pequeño para un fanático.',
    holidays: ['cumpleanios', 'navidad', 'dia-del-padre'], categoryId: 'juguetes', stock: 60, sold: 188,
    audience: { gender: 'todos', ages: ['nino', 'joven', 'adulto'], interests: ['autos', 'juegos'] },
    delivery: both(15, 'La Paz: Zona Sur y Centro'), days: 160,
  },
  {
    id: 'p13', sellerId: 's3', title: 'Pista + 5 autitos', price: 130, images: commons('Dinky_toys_cars_and_pack.jpg', 'Hot_wheels.jpg'), tone: ['#FFDC9E', '#F2A33A'],
    description: 'Pista flexible de 3 metros con cinco autitos. Viene en caja de regalo lista para sorprender.',
    holidays: ['cumpleanios', 'navidad'], categoryId: 'juguetes', stock: 10, sold: 44,
    audience: { gender: 'todos', ages: ['nino'], interests: ['autos', 'juegos'] },
    delivery: both(25, 'La Paz: Zona Sur y Centro'), days: 60,
  },
  {
    id: 'p14', sellerId: 's3', title: 'Caja sorpresa del coleccionista', price: 220, images: commons('Dinky_toys_cars_and_pack.jpg', 'Hot_Wheels_Modellauto.jpg'), tone: ['#D6C5FF', '#7C5CE0'],
    description: 'Seis Hot Wheels premium (incluye un posible “Treasure Hunt”) en caja numerada.',
    holidays: ['cumpleanios', 'dia-del-padre', 'navidad'], categoryId: 'cajas', stock: 5, sold: 23,
    audience: { gender: 'todos', ages: ['joven', 'adulto'], interests: ['autos', 'juegos'] },
    delivery: pickupOnly, days: 20,
  },

  // ───────── Dulce Tentación (s4)
  {
    id: 'p15', sellerId: 's4', title: 'Caja de bombones x16', price: 80, images: commons('Lauenstein_chocolate_pralines.jpg', 'Lindt_Pralines_Classic.jpg', 'Box_of_Valentine_Chocolates.JPG'), tone: ['#E8C2A8', '#8A4B33'],
    description: 'Dieciséis bombones artesanales rellenos de dulce de leche, maracuyá y café.',
    holidays: ['san-valentin', 'dia-de-la-madre', 'aniversario', 'navidad'], categoryId: 'dulces', stock: 25, sold: 121,
    audience: { gender: 'todos', ages: ['joven', 'adulto', 'mayor'], interests: ['dulces'] },
    delivery: both(15, 'Santa Cruz: Centro y Zona Norte'), days: 100,
  },
  {
    id: 'p16', sellerId: 's4', title: 'Mini torta de cumpleaños', price: 70, images: commons('Birthday_cake_with_6_candles.JPG', 'Birthday_cake.jpg', 'Italy_-_birthday_cake_with_candles_3.jpg'), tone: ['#FFD6E8', '#F08BB8'],
    description: 'Torta de 15 cm para 6 personas con vela y mensaje. Elige sabor: chocolate, vainilla o tres leches.',
    holidays: ['cumpleanios'], categoryId: 'dulces', stock: 8, sold: 69,
    audience: { gender: 'todos', ages: ['nino', 'joven', 'adulto', 'mayor'], interests: ['dulces'] },
    delivery: both(15, 'Santa Cruz: Centro y Zona Norte'), days: 85,
  },
  {
    id: 'p17', sellerId: 's4', title: 'Desayuno sorpresa para dos', price: 110, images: commons('Continental_Breakfast.jpg', 'Morning-breakfast-croissant_(24244330501).jpg', 'Morning-breakfast-orange-juice_(23699976063).jpg'), tone: ['#FFE6B8', '#E8A850'],
    description: 'Croissants, jugo natural, frutas, yogurt y un globo con mensaje. Entrega entre 7 y 9 a.m.',
    holidays: ['dia-de-la-madre', 'dia-del-padre', 'cumpleanios', 'aniversario', 'san-valentin'], categoryId: 'cajas', stock: 10, sold: 93,
    audience: { gender: 'todos', ages: ['joven', 'adulto', 'mayor'], interests: ['dulces', 'cafe'] },
    delivery: shipOnly(20, 'Santa Cruz: Centro, Equipetrol y Zona Norte'), days: 70,
  },
  {
    id: 'p18', sellerId: 's4', title: 'Panetón artesanal', price: 55, images: commons('Whole_panettone.jpg', 'Panettone_-_Nicolettone_2017_-_IMG_7079_(31379967150).jpg'), tone: ['#F5DDB0', '#D49B4A'],
    description: 'Panetón esponjoso con frutas confitadas y pasas, horneado el mismo día de la entrega.',
    holidays: ['navidad', 'anio-nuevo'], categoryId: 'dulces', stock: 40, sold: 210,
    audience: { gender: 'todos', ages: ['nino', 'joven', 'adulto', 'mayor'], interests: ['dulces'] },
    delivery: both(15, 'Santa Cruz: Centro y Zona Norte'), days: 200,
  },
  {
    id: 'p19', sellerId: 's4', title: 'Galletas decoradas navideñas x12', price: 60, images: commons('Gingerbread_Cookies_on_Table.jpg', 'Christmas_Cookies_Plateful.JPG'), tone: ['#FFD0C2', '#E8654F'],
    description: 'Doce galletas de mantequilla con glaseado real: renos, estrellas, árboles y bastones.',
    holidays: ['navidad'], categoryId: 'dulces', stock: 30, sold: 74,
    audience: { gender: 'todos', ages: ['nino', 'joven', 'adulto', 'mayor'], interests: ['dulces'] },
    delivery: both(15, 'Santa Cruz: Centro y Zona Norte'), days: 35,
  },
  {
    id: 'p20', sellerId: 's4', title: 'Kit Año Nuevo con 12 uvas', price: 45, images: commons('BUNCH_WINE_GRAPES_green_and_purple_close_up_(48986226768).jpg', 'Bunch_of_grapes_going_through_veraison_in_Okanagan.jpg'), tone: ['#D9C2F2', '#8A5CC2'],
    description: 'Doce uvas en cajita individual, gorro, bengalas de mano y tarjeta con deseos para el año.',
    holidays: ['anio-nuevo'], categoryId: 'cajas', stock: 45, sold: 88,
    audience: { gender: 'todos', ages: ['joven', 'adulto', 'mayor'], interests: ['dulces'] },
    delivery: both(15, 'Santa Cruz: Centro y Zona Norte'), days: 15,
  },

  // ───────── Taller Mi Rincón (s5)
  {
    id: 'p21', sellerId: 's5', title: 'Taza personalizada con foto', price: 45, images: commons('Used_coffee_mug_(4356081928).jpg', 'Vintage_VICTOR_Coffee_Mug.jpg', 'Coffee_mug_-_Flickr_-_Stiller_Beobachter.jpg'), tone: ['#CFE3F2', '#6FA3CC'],
    description: 'Taza de cerámica de 11 oz con tu foto y mensaje. Apta para microondas y lavavajillas.',
    holidays: ['dia-del-padre', 'dia-de-la-madre', 'cumpleanios', 'aniversario'], categoryId: 'personalizados', stock: 60, sold: 175,
    audience: { gender: 'todos', ages: ['joven', 'adulto', 'mayor'], interests: ['cafe', 'recuerdos'] },
    delivery: both(20, 'Sucre: Centro y alrededores'), days: 170,
  },
  {
    id: 'p22', sellerId: 's5', title: 'Billetera de cuero grabada', price: 120, images: commons('Aarong_leather_wallet.jpg', 'Wallet.jpg', 'Crocodile_wallets.jpg'), tone: ['#E3C9AC', '#9B6A3F'],
    description: 'Billetera de cuero genuino con nombre grabado a láser. Ideal para papá.',
    holidays: ['dia-del-padre', 'cumpleanios', 'navidad'], categoryId: 'personalizados', stock: 18, sold: 52,
    audience: { gender: 'hombre', ages: ['joven', 'adulto', 'mayor'], interests: ['moda'] },
    delivery: both(20, 'Sucre: Centro y alrededores'), days: 95,
  },
  {
    id: 'p23', sellerId: 's5', title: 'Cuadro de madera con fecha especial', price: 95, images: commons('Lasergrav.jpg', 'Lasergravieren.JPG'), tone: ['#EBD5B8', '#B98A55'],
    description: 'Madera grabada con la fecha, nombres y una frase. Medidas: 20 x 25 cm.',
    holidays: ['aniversario', 'san-valentin', 'dia-de-la-madre'], categoryId: 'personalizados', stock: 12, sold: 38,
    audience: { gender: 'todos', ages: ['joven', 'adulto', 'mayor'], interests: ['recuerdos', 'decoracion'] },
    delivery: both(20, 'Sucre: Centro y alrededores'), days: 55,
  },
  {
    id: 'p24', sellerId: 's5', title: 'Llavero grabado', price: 18, images: commons('Keychain.jpg', 'Key_chain.jpg', 'Eiffel_Tower_Keychain.jpg'), tone: ['#D8E6D0', '#86B070'],
    description: 'Llavero de madera o acrílico con grabado láser. Elige nombre, inicial o ícono.',
    holidays: ['dia-del-padre', 'cumpleanios', 'san-valentin'], categoryId: 'detalles', stock: 80, sold: 240,
    audience: { gender: 'todos', ages: ['joven', 'adulto', 'mayor'], interests: ['moda', 'recuerdos'] },
    delivery: both(8, 'Sucre: Centro y alrededores'), days: 180,
  },
  {
    id: 'p25', sellerId: 's5', title: 'Álbum de recuerdos hecho a mano', price: 130, images: commons('Fotoalbum_(leeg),_RP-F-F01178.jpg'), tone: ['#F2D2D9', '#C97A8B'],
    description: 'Álbum scrapbook con 20 páginas decoradas. Nos envías las fotos y lo armamos por ti.',
    holidays: ['aniversario', 'dia-de-la-madre', 'cumpleanios'], categoryId: 'manualidades', stock: 5, sold: 17,
    audience: { gender: 'todos', ages: ['joven', 'adulto', 'mayor'], interests: ['recuerdos', 'manualidades'] },
    delivery: pickupOnly, days: 40,
  },

  // ───────── Canastas Don Pepe (s6)
  {
    id: 'p26', sellerId: 's6', title: 'Canasta de desayuno para papá', price: 190, images: commons('HK_Lunar_New_Year_Fruit_Gift_Basket.JPG', 'Palm_Frond_Basket.jpg'), tone: ['#F4DBA0', '#C99A3F'],
    description: 'Café de altura, pan artesanal, mermelada, queso y una taza. Todo en canasta de mimbre.',
    holidays: ['dia-del-padre', 'cumpleanios'], categoryId: 'cajas', stock: 9, sold: 31,
    audience: { gender: 'hombre', ages: ['adulto', 'mayor'], interests: ['cafe', 'dulces'] },
    delivery: both(25, 'Tarija: Centro y barrios cercanos'), days: 50,
  },
  {
    id: 'p27', sellerId: 's6', title: 'Kit café del papá', price: 150, images: commons('Roasted_coffee_beans.jpg', 'French_press.jpg', 'Bodum_French_Press.jpg'), tone: ['#D9BBA0', '#7A4E34'],
    description: 'Café tostado de 250 g, prensa francesa, galletas y tarjeta. Para el que no vive sin su café.',
    holidays: ['dia-del-padre', 'navidad', 'cumpleanios'], categoryId: 'cajas', stock: 14, sold: 46,
    audience: { gender: 'hombre', ages: ['adulto', 'mayor'], interests: ['cafe'] },
    delivery: both(25, 'Tarija: Centro y barrios cercanos'), days: 65,
  },
  {
    id: 'p28', sellerId: 's6', title: 'Canasta navideña completa', price: 210, images: commons('Christmas_Tree_and_Presents.jpg', 'Christmas_Cookies_Plateful.JPG', 'Whole_panettone.jpg'), tone: ['#FFC2B8', '#D6483A'],
    description: 'Panetón, chocolate caliente, turrones, galletas y un adorno. Viene con moño dorado.',
    holidays: ['navidad', 'anio-nuevo'], categoryId: 'cajas', stock: 20, sold: 64,
    audience: { gender: 'todos', ages: ['adulto', 'mayor'], interests: ['dulces', 'cafe'] },
    delivery: both(25, 'Tarija: Centro y barrios cercanos'), days: 28,
  },
  {
    id: 'p29', sellerId: 's6', title: 'Caja “Spa en casa” para mamá', price: 175, images: commons('Lush_bath_bombs.jpg', 'Byredo_1996_scented_candle.jpg'), tone: ['#D6EEF0', '#7FC2C9'],
    description: 'Sales de baño, vela, mascarilla, crema de manos y té de hierbas. Un momento solo para ella.',
    holidays: ['dia-de-la-madre', 'cumpleanios', 'aniversario'], categoryId: 'cajas', stock: 11, sold: 29,
    audience: { gender: 'mujer', ages: ['joven', 'adulto', 'mayor'], interests: ['bienestar'] },
    delivery: both(25, 'Tarija: Centro y barrios cercanos'), days: 48,
  },
  {
    id: 'p30', sellerId: 's6', title: 'Kit de herramientas mini', price: 160, images: commons('Hand-tool_set_with_bits_and_accessories_arranged_on_a_white_surface..jpg', 'Woodworking_Hand_Tools.jpg', 'Caja_de_Herramientas.jpg'), tone: ['#BFD6EE', '#5C8FC2'],
    description: 'Set de 20 piezas en maletín compacto, para el papá que arregla todo en casa.',
    holidays: ['dia-del-padre', 'navidad'], categoryId: 'cajas', stock: 8, sold: 22,
    audience: { gender: 'hombre', ages: ['adulto', 'mayor'], interests: ['herramientas'] },
    delivery: pickupOnly, days: 33,
  },
]

export const PRODUCTS: Product[] = seeds.map(({ days, ...p }) => ({
  ...p,
  active: true,
  createdAt: ago(days),
}))

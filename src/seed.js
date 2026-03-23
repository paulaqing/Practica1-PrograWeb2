require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');
const Product = require('./models/Product');

const coffeeShopProducts = [
  {
    name: "Café Espresso",
    description: "Café intenso y aromático preparado en máquina express.",
    price: 1.50,
    stock: 50,
    image: ""
  },
  {
    name: "Café Latte",
    description: "Espresso con abundante leche caliente y una fina capa de espuma.",
    price: 2.20,
    stock: 40,
    image: ""
  },
  {
    name: "Cappuccino Clásico",
    description: "Partes iguales de espresso, leche caliente y espuma de leche.",
    price: 2.50,
    stock: 35,
    image: ""
  },
  {
    name: "Galleta con Chips de Chocolate",
    description: "Galleta horneada en casa, crujiente por fuera y suave por dentro con chips de chocolate belga.",
    price: 1.80,
    stock: 25,
    image: ""
  },
  {
    name: "Croissant de Mantequilla",
    description: "Cruasán tradicional francés, hojaldrado y con un intenso sabor a mantequilla.",
    price: 1.60,
    stock: 30,
    image: ""
  },
  {
    name: "Croissant de Chocolate",
    description: "Cruasán relleno de crema de cacao y avellanas.",
    price: 2.00,
    stock: 20,
    image: ""
  },
  {
    name: "Batido de Fresa Natural",
    description: "Batido refrescante hecho con fresas frescas, helado de vainilla y leche.",
    price: 3.50,
    stock: 15,
    image: ""
  },
  {
    name: "Frappuccino de Caramelo",
    description: "Bebida fría de café licuado con hielo, leche y sirope de caramelo, coronado con nata montada.",
    price: 3.80,
    stock: 20,
    image: ""
  },
  {
    name: "Crepe Nutella y Plátano",
    description: "Crepe dulce rellena de auténtica Nutella y rodajas de plátano fresco.",
    price: 4.50,
    stock: 12,
    image: ""
  },
  {
    name: "Tarta de Zanahoria (Porción)",
    description: "Porción de bizcocho esponjoso de zanahoria con frosting de queso crema.",
    price: 3.20,
    stock: 10,
    image: ""
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Conectado a MongoDB");

    await Product.deleteMany({});
    console.log("Productos antiguos eliminados");

    await Product.insertMany(coffeeShopProducts);
    console.log("Nuevos productos de cafetería añadidos");

    process.exit(0);
  } catch (err) {
    console.error("Error en la BD:", err);
    process.exit(1);
  }
}

seed();

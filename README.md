# Práctica Frontend Svelte 5

> Aplicación frontend de comercio electrónico construida con Vite, Svelte 5, y Vanilla CSS consumiendo una API REST backend.

Esta aplicación cumple estrictamente con la rúbrica de la asignatura, implementando un frontend completo interactivo que gestiona estado global, autenticación, roles y enrutamiento SPA.

## 📋 Tabla de Contenidos

- [Requisitos Mínimos Cumplidos](#requisitos-mínimos-cumplidos-5-puntos)
- [Uso de Svelte 5 (Runas)](#uso-de-svelte-5-runas-3-puntos)
- [Funcionalidades Avanzadas](#funcionalidades-avanzadas-2-puntos)
- [Consumo de API Backend](#consumo-de-api-backend)
- [Instalación y Configuración](#instalación-y-configuración)

---

## 🟢 Requisitos Mínimos Cumplidos (5 Puntos)

- **Estructura del Proyecto:** Creado con Vite + Svelte 5, estructurado modularmente en las carpetas `components/`, `pages/`, `store/` y `services/`.
- **Autenticación Básica (JWT):** Gestión completa del login en `Login.svelte`. El enrutador (`App.svelte`) está protegido de forma global, bloqueando accesos a rutas/vistas privadas (como administración o carrito) si no se detecta la sesión. Evita renders privados.
- **Consumo de API de productos:** CRUD completo sobre el inventario vía `fetch`.
  - Listado público en el panel principal mostrando información clave (incluyendo badges de activo).
  - Componente detallado individual (vía `ProductDetailModal`).
  - Formulario Reactivo (`ProductForm`) para gestionar creaciones y ampliaciones al stock.
  - Edición y borrado supeditado a controles de roles (sólo accesible para administradores).
- **Navegación tipo SPA:** Enrutador de vista única gestionado puramente desde el cliente (`state` de `currentPath`). Pantallas principales independientes: Login, Catálogo, Administración de Usuarios, Carrito, Pedidos, Chat. En las barras `.navbar` se resalta visualmente la pestaña actual.
- **Estilos y UX Básicos:** Fuerte trabajo en UI/UX sin apoyarse en frameworks externos. Empleo de propiedades CSS *Vanilla*, modo Glassmorphism, animaciones fade-in, y total compatiblidad móvil mediante CSS responsivo adaptativo que no rompe en ningún ancho.

---

## 🟢 Uso de Svelte 5 (Runas) (+3 Puntos)

El proyecto abandona totalmente la API clásica de Svelte para explotar el diseño moderno que rigen las **Runas**. Explicación del sistema de cada runa:

### `$state()`

El cerebro mutable local o global en todos los bloques visuales está encapsulado en estados vivos:

- **`authStore.svelte.js`** / **`cartStore.svelte.js`**: Estado global que nutre a toda la app mediante variables mutables exportadas (credenciales de usuarios, productos añadidos).
- Componentes como `Products.svelte`, `AdminUsers.svelte` manejan sus variables internas para cargar o pausar los bloques DOM (`loading`, `error`, `paginatedProducts`).
- Formularios (`ProductForm.svelte`) gestionan inputs tipados directamente unidos a variables mutables evitando referencias nativas del DOM obsoletas.

### `$derived()`

Empleo exhaustivo de reevaluación optimizada en bloques donde no queremos re-disparos forzosos:

- **Filtros Avanzados (`Products.svelte`)**: La variable `filteredProducts` es un simple derivado `$derived(...)` cruzado por las barreras combinadas del `query` de búsqueda, los techos `minPrice` y `maxPrice`. Esto permite tener paginación frontend inmediata dividiendo en arrays más pequeños mediante el derivado secundario `paginatedProducts`.
- **Cabeceras Inteligentes (`Navbar.svelte`)**: Escucha el store del carrito computando estáticamente la cantidad extraída o si el rol interactuando amerita mostrar links VIP.

### `$effect()`

Sincronización a eventos e intercepciones nativas de la web en lugares críticos:

- **Protección de Enrutador (`App.svelte`)**: Se reevalúa constantemente la sesión. Si se pierde el token de forma imprevista, dispara una redirección forzada al `Login`.
- **Gestión Visual del Estilo Clásico/Oscuro**: Efecto persistente montado directamente con Svelte monitorizando para inyectar/retirar del tag raíz del HTML la clase `.light-theme`.
- **Refresh de Datos (`Products.svelte`)**: Evento que detecta si el privilegio general de `activeRole` cambia abruptamente recargando las llamadas de red para bajar privilegios limpios del catálogo. Reposiciona `currentPage` a `1` si hay cambios en los inputs buscadores reactivos.

### `$props()` y Callbacks

El proyecto está completamente segmentado por props recibidos estáticamente. Toda acción inferior del DOM se levanta mediante llamadas a padres controladas, abandonando eventos personalizados (`createEventDispatcher`).
Ejemplo clásico en el listado de guardado dentro de `ProductForm.svelte` interceptando `let { product, onCancel, onSave } = $props()` o los potentes avisos de eliminaciones con dependencias superiores `onDelete` encadenadas hasta las rutas superiores en `ProductCard.svelte`.

---

## 🟢 Funcionalidades Avanzadas (+2 Puntos)

Entre las mejoras opcionales implementadas brillan estas expansiones de extrema eficacia:

1. **Gestión de Roles Centralizada VIP (`AdminUsers.svelte`):** Construida una zona administrativa `/admin/users` validable solo frente a tokens con marca "admin". Lista a todos los consumidores registrados en la BD asíncronamente, capacita crear usuarios rápidos localmente, expulsarlos, y una comboBox interactiva para intercambiar privilegios e invertir los roles si procede.
2. **Persistencia Web (Storage Session):** Construcción automatizada del sistema Autenticación integrándose en el `localStorage`. El store global `authStore.svelte.js` es inicializado desde disco con hydration en la runa por lo que el JWT resiste re-aberturas del navegador (`F5`). Limpia cachés cuando el usuario desencadena un retiro (`logout`).
3. **Escalado de Búsqueda Multiparamétrica Local:** Combinación de filtros reactivos triplicados en pantalla (Búsqueda textual dinámica sumando Rango Bottom Numérico, sumando Rango Top). El proyecto renderiza arrays de resultados mediante cálculos puramente controlados limitando las salidas inmundas de memoria en las llamadas.
4. **Validaciones en Frontend (Manejo Agresivo de Formularios):** Formularios fortificados del lado usuario interponiendo JS antes que al backend (`ProductForm.svelte`, validaciones de price y stock mínimos > 0, exclusiones de strings falsos). Los botones interactivos de envíos HTTP asumen clase bloqueadora en línea (`disabled={loading}`) cambiando su capa de texto por "Cargando..." evadiendo envíos masivos erróneos.
5. **Máxima Eficacia Interfaces / Reportes de Error Completos UX:**
   - **Sistema Toast Global Compartido**: Librería propia manual implementada en `ToastStore.svelte.js`. Errores del Backend/Frontend, acciones ilegales, roles caídos o notificaciones HTTP de creación en verde/rojo levantan notificaciones elegantes colorizadas apartando los `window.alert()` de forma definitiva de todo aviso genérico.
   - Peticiones seguras con diálogos nativos `window.confirm()` para corroborar caídas irreversibles (Borrado crítico de productos).
   - Animaciones y Loaders radiales en los listados suspendiendo y atenuando el grid cuando se interfectan re-cargas lentas de servidor.

---

## 🔌 Consumo de API Backend

La arquitectura se interconecta consumiendo nativamente la red de NodeJS designada por la rúbrica.

| Recurso | Endpoints REST Invocados | Interacción y Roles de Lógica |
|-------------|----------------------------|-----------------|
| **Identidad** | POST `/auth/register`<br>POST `/auth/login` | El formulario `Login.svelte` levanta la conexión capturando JSON con error, emitiendo JWT. Las cuentas nuevas obligan alta simple como "user". |
| **Productos** | GET `/api/products`<br>POST `/api/products`<br>PUT `/api/products/:id`<br>DELETE `/api/products/:id` | Los menús se construyen para consumir esta URL nativa (Listados públicos de lectura). Todo DELETE, PUT O POST requiere Token con **`admin`** en sus envíos. Sube ficheros de producto via *FormData* de Javascript con soporte Multi-part. |
| **Usuarios**| GET `/api/users`<br>DELETE `/api/users/:id`<br>PUT `/api/users/:id/role` | Accesados únicamente y renderizados temporalmente desde localizador privado del Panel de Administración con cabeceras estrictas **`admin`**. Responde con Listas de todos los consumidores de DB base. |
| **Transacciones**| POST `/api/orders`<br>GET `/api/orders/my-orders` | **`admin`** maneja globalmente los JSON con estatus terminados, mientras **`user`** recupera pedidos personales. |

---

## 🚀 Instalación y Configuración

1. **Clonar este repositorio** y asegurar que el servidor backend (puerto usual de node en 3000) dictaminado subyace paralelo encendido con instancias en MongoDB.
2. Inyectarse sobre la carpeta de Frontend para instalar requerimientos Javascript:

   ```bash
   npm install
   ```

3. Levantar nuestro compilador web Vite en entorno interactivo dev-server:

   ```bash
   npm run dev
   ```

4. Navegador abrirá automáticamente sobre la ruta provista (`http://localhost:5173`).

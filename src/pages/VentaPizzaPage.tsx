// src/pages/VentaPizzasPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Importamos funciones y tipos de servicios
import { 
    processPizzaSale, 
    getRecetas, 
    getStockForPizzas, 
    createReceta, 
    updateReceta, 
    deleteReceta, 
    RecetaPizza, 
    StockItem, 
    VentaItem,
    RecetaPayload, 
    RecetaIngrediente 
} from '../services/pizzaService';
// Importamos íconos necesarios
import { Pizza, ShoppingCart, Loader2, Minus, Plus, Edit, Trash2, Info, PlusCircle, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- TIPOS LOCALES ---
interface CartItem {
    receta: RecetaPizza;
    quantity: number;
    totalPrice: number;
}

// Estado para la gestión del formulario de recetas
interface RecetaFormState {
    id_receta?: number; // Para edición
    nombre: string;
    tamano: 'Mediana' | 'Grande';
    precio: string; 
    ingredientes: RecetaIngrediente[]; // Lista temporal para el formulario
}

// Tipo para el input del formulario de ingredientes
interface TempIngredienteInput {
    id_producto: string;
    cantidad_uso: string;
    producto_nombre: string; 
}


const VentaPizzasPage: React.FC = () => {
    // Estados principales de datos
    const [recetas, setRecetas] = useState<RecetaPizza[]>([]);
    const [stock, setStock] = useState<StockItem[]>([]); 
    const [cart, setCart] = useState<CartItem[]>([]);

    // Estados de UI y Notificaciones
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false); 
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // --- ESTADOS PARA GESTIÓN DE RECETAS (CRUD) ---
    const [mostrarFormularioReceta, setMostrarFormularioReceta] = useState(false);
    const [recetaAEditar, setRecetaAEditar] = useState<RecetaPizza | null>(null);
    const [mostrarDetallesModal, setMostrarDetallesModal] = useState<RecetaPizza | null>(null);
    
    // Estado para el ingrediente temporal que se añade al formulario
    const [tempIngrediente, setTempIngrediente] = useState<TempIngredienteInput>({
        id_producto: '',
        cantidad_uso: '',
        producto_nombre: ''
    });


    // Estado inicial del formulario de Receta
    const initialFormState: RecetaFormState = {
        nombre: '',
        tamano: 'Mediana',
        precio: '',
        ingredientes: [],
    };
    const [recetaFormData, setRecetaFormData] = useState<RecetaFormState>(initialFormState);


    // --- LÓGICA DE CARGA DE DATOS ---

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [recetasRes, stockRes] = await Promise.all([getRecetas(), getStockForPizzas()]);

            if (recetasRes.success && recetasRes.data) {
                setRecetas(recetasRes.data);
            } else {
                throw new Error(recetasRes.message || "Fallo al cargar recetas.");
            }

            if (stockRes.success && stockRes.data) {
                setStock(stockRes.data);
            } else {
                throw new Error(stockRes.message || "Fallo al cargar stock.");
            }
        } catch (err: unknown) {
            console.error("Error cargando datos:", err);
            setError(`Error al cargar datos: ${(err as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- MANEJO DE FORMULARIO DE RECETAS (CRUD) ---

    const handleCloseRecetaForm = () => {
        setMostrarFormularioReceta(false);
        setRecetaAEditar(null);
        setRecetaFormData(initialFormState);
        setTempIngrediente({ id_producto: '', cantidad_uso: '', producto_nombre: '' });
    };

    const handleOpenCreateReceta = () => {
        handleCloseRecetaForm(); // Resetear antes de abrir
        setMostrarFormularioReceta(true);
        setError(null);
    };

    const handleOpenEditReceta = (receta: RecetaPizza) => {
        setRecetaAEditar(receta);
        // Pre-llenar el formulario con los datos de la receta
        setRecetaFormData({
            id_receta: receta.id_receta,
            nombre: receta.nombre,
            tamano: receta.tamano,
            precio: receta.precio.toFixed(2),
            ingredientes: receta.ingredientes || [],
        });
        setMostrarFormularioReceta(true);
        setError(null);
    };
    
    const handleSaveReceta = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) return;

        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        
        // Validación mínima de ingredientes
        if (recetaFormData.ingredientes.length === 0) {
            setError("La receta debe tener al menos un ingrediente.");
            setIsSaving(false);
            return;
        }

        // 1. Mapear datos a la estructura del Payload (RecetaPayload)
        const payload: RecetaPayload = {
            nombre: recetaFormData.nombre,
            tamano: recetaFormData.tamano,
            precio: parseFloat(recetaFormData.precio),
            // Mapear solo los campos que necesita la API
            ingredientes: recetaFormData.ingredientes.map(ing => ({
                id_producto: ing.id_producto,
                cantidad_uso: ing.cantidad_uso,
            })),
        };

        let result;
        if (recetaAEditar && recetaFormData.id_receta) {
            // Edición (PUT)
            payload.id_receta = recetaFormData.id_receta;
            result = await updateReceta(payload);
        } else {
            // Creación (POST)
            result = await createReceta(payload);
        }

        if (result.success) {
            setSuccessMessage(result.message);
            handleCloseRecetaForm(); 
            await loadData(); // Recargar datos
        } else {
            setError(result.message);
        }
        
        setIsSaving(false);
    };

    const handleDeleteReceta = async (receta: RecetaPizza) => {
        if (!window.confirm(`¿Está seguro de ELIMINAR PERMANENTEMENTE la receta ${receta.nombre} (${receta.tamano})?`)) return;
        
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const result = await deleteReceta(receta.id_receta);

        if (result.success) {
            setSuccessMessage(result.message);
            await loadData(); // Recargar datos
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const handleRecetaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRecetaFormData(prev => ({
            ...prev,
            [name]: value
        } as RecetaFormState));
    };

    // --- MANEJO DE INGREDIENTES EN EL FORMULARIO ---
    
    const handleTempIngredienteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let nombre = tempIngrediente.producto_nombre;
        
        if (name === 'id_producto') {
            const selectedProduct = stock.find(item => item.id === Number(value));
            nombre = selectedProduct ? selectedProduct.producto : '';
        }

        setTempIngrediente(prev => ({
            ...prev,
            [name]: value,
            producto_nombre: nombre
        }));
    };

    const handleAddIngrediente = () => {
        const id_producto = Number(tempIngrediente.id_producto);
        const cantidad_uso = Number(tempIngrediente.cantidad_uso);
        
        if (!id_producto || !cantidad_uso || cantidad_uso <= 0) {
            setError("Por favor, selecciona un ingrediente y define una cantidad válida.");
            return;
        }

        const product = stock.find(item => item.id === id_producto);
        const unidad_medida = product ? product.especificacion : 'unidades';

        const alreadyExists = recetaFormData.ingredientes.some(ing => ing.id_producto === id_producto);
        if (alreadyExists) {
            setError("Ese ingrediente ya fue añadido a la receta. Edita su cantidad si es necesario.");
            return;
        }

        const newIngrediente: RecetaIngrediente = {
            id_producto,
            cantidad_uso,
            producto_nombre: tempIngrediente.producto_nombre || 'Desconocido',
            unidad_medida,
        };

        setRecetaFormData(prev => ({
            ...prev,
            ingredientes: [...prev.ingredientes, newIngrediente]
        }));
        setTempIngrediente({ id_producto: '', cantidad_uso: '', producto_nombre: '' });
        setError(null);
    };
    
    const handleRemoveIngrediente = (id_producto: number) => {
        setRecetaFormData(prev => ({
            ...prev,
            ingredientes: prev.ingredientes.filter(ing => ing.id_producto !== id_producto)
        }));
    };


    // --- LÓGICA DE CARRITO Y STOCK ---

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.totalPrice, 0), [cart]);
    
    const checkStockSufficiency = useCallback((receta: RecetaPizza, currentCart: CartItem[]): { isSufficient: boolean, missingIngredient?: string } => {
        const combinedUsage: { [id: number]: number } = {};
        currentCart.forEach(item => {
            item.receta.ingredientes.forEach(ing => {
                combinedUsage[ing.id_producto] = (combinedUsage[ing.id_producto] || 0) + (ing.cantidad_uso * item.quantity);
            });
        });
        for (const recipeIng of receta.ingredientes) {
            const id_producto = recipeIng.id_producto;
            const availableStock = stock.find(i => i.id === id_producto)?.items || 0;
            const totalRequired = (combinedUsage[id_producto] || 0);
            if (availableStock < totalRequired) {
                return { isSufficient: false, missingIngredient: recipeIng.producto_nombre };
            }
        }
        return { isSufficient: true };
    }, [stock]);

    const addToCart = (receta: RecetaPizza) => {
        const existingItemIndex = cart.findIndex(item => item.receta.id_receta === receta.id_receta);

        let newCart: CartItem[];
        let newQuantity = 1;
        
        if (existingItemIndex > -1) {
            newCart = [...cart];
            newQuantity = newCart[existingItemIndex].quantity + 1;
            newCart[existingItemIndex] = { ...newCart[existingItemIndex], quantity: newQuantity, totalPrice: newQuantity * receta.precio };
        } else {
            const newItem: CartItem = { receta: receta, quantity: 1, totalPrice: receta.precio };
            newCart = [...cart, newItem];
        }

        const stockCheck = checkStockSufficiency(receta, newCart);
        
        if (!stockCheck.isSufficient) {
            setError(`ERROR: Stock insuficiente de ${stockCheck.missingIngredient} para añadir esta pizza.`);
            return;
        }

        setCart(newCart);
        setSuccessMessage(`${receta.nombre} (${receta.tamano}) añadido (x${newQuantity}).`);
        setError(null);
    };

    const updateCartItemQuantity = (index: number, delta: 1 | -1) => {
        const newCart = [...cart];
        const currentItem = newCart[index];
        const newQuantity = currentItem.quantity + delta;

        if (newQuantity < 1) {
            newCart.splice(index, 1);
            setCart(newCart);
            return;
        }

        const simulatedCart = newCart.map((item, i) => 
            i === index ? { ...item, quantity: newQuantity } : item
        );
        
        const stockCheck = checkStockSufficiency(currentItem.receta, simulatedCart);
        
        if (delta > 0 && !stockCheck.isSufficient) {
            setError(`ERROR: Stock insuficiente de ${stockCheck.missingIngredient} para añadir más.`);
            return;
        }

        currentItem.quantity = newQuantity;
        currentItem.totalPrice = newQuantity * currentItem.receta.precio;
        setCart(newCart);
        setError(null);
    };
    
    const handleProcessSale = async () => {
        if (cart.length === 0 || loading) return;
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const itemsToSend: VentaItem[] = cart.map(item => ({
            id_receta: item.receta.id_receta,
            quantity: item.quantity,
            price: item.receta.precio,
        }));
        
        const result = await processPizzaSale(itemsToSend);

        if (result.success) {
            setCart([]); 
            setSuccessMessage(result.message);
            await loadData(); 
        } else {
            setError(result.message);
        }
        
        setLoading(false);
    };


    // Agrupar recetas por nombre base
    const pizzasByName = useMemo(() => {
        return recetas.reduce((acc, current) => {
            const baseName = current.nombre;
            if (!acc[baseName]) acc[baseName] = [];
            acc[baseName].push(current);
            return acc;
        }, {} as Record<string, RecetaPizza[]>);
    }, [recetas]);
    
    // Función para obtener el estado de stock
    const getStockStatus = (id_producto: number): 'verde' | 'rojo' => {
        const item = stock.find(i => i.id === id_producto);
        if (item && item.items <= 5) return 'rojo'; 
        return 'verde';
    };


 return (
  <div className="p-6 md:p-8 bg-gray-100 min-h-screen">
   <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-300">
    <h1 className="text-3xl font-bold text-gray-800">Venta Rápida de Pizzas</h1>
    
    <div className="flex space-x-3">
        {/* --- BOTÓN PARA GENERAR NUEVAS PIZZAS --- */}
        <button 
            onClick={handleOpenCreateReceta}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center"
        >
            <PlusCircle className="w-5 h-5 mr-2" />
            Nueva Pizza
        </button>
        {/* --- FIN BOTÓN NUEVAS PIZZAS --- */}

        <Link to="/">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out">
                Volver a Inicio
            </button>
        </Link>
    </div>
   </div>

   {/* Mensajes de estado */}
    {loading && !cart.length && <div className="p-4 text-center text-blue-500"><Loader2 className="animate-spin inline mr-2" /> Cargando recetas y stock...</div>}
    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
    {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{successMessage}</div>}


   <div className="flex flex-col lg:flex-row gap-8">
    {/* COLUMNA 1: MENÚ DE PIZZAS */}
    <div className="lg:w-3/5 space-y-6">
     <h2 className="text-2xl font-semibold text-gray-800">Menú Disponible</h2>
     
     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Object.entries(pizzasByName).map(([baseName, pizzas]) => (
       <div key={baseName} className="bg-white shadow-lg rounded-xl p-4 flex flex-col justify-between border">
        <div className="text-center mb-4">
         {/* Icono de Pizza para el Grupo */}
         <Pizza className="w-12 h-12 mx-auto text-indigo-500 mb-2" />
         <h3 className="text-xl font-bold text-gray-900">{baseName}</h3>
        </div>
        
        <div className="space-y-4">
         {pizzas.map(receta => {
            const isStockCritical = receta.ingredientes.some(ing => getStockStatus(ing.id_producto) === 'rojo');
            
            return (
                <div key={receta.id_receta} className={`flex flex-col p-3 rounded-lg border ${isStockCritical ? 'border-red-400 bg-red-50' : 'bg-gray-50'}`}>
                    
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-700">{receta.tamano}</span>
                            <span className={`text-sm ${isStockCritical ? 'text-red-600' : 'text-gray-500'}`}>
                                ${receta.precio.toFixed(2)} {isStockCritical && '(Stock Bajo!)'}
                            </span>
                        </div>
                         {/* Botón Ordenar Rápido (Ordena, el primer botón de los 4 conceptuales) */}
                        <button 
                            onClick={() => addToCart(receta)} 
                            className={`py-1 px-3 text-sm font-semibold rounded-lg transition-all duration-200 
                                ${isStockCritical 
                                    ? '!bg-red-500 hover:!bg-red-600 text-white' 
                                    : '!bg-green-600 hover:!bg-green-700 text-white'}`}
                            disabled={loading}
                        >
                            Ordenar
                        </button>
                    </div>

                    {/* --- 3 BOTONES DE GESTIÓN RESTANTES --- */}
                    <div className="grid grid-cols-3 gap-1 border-t pt-2 mt-1">
                        
                        {/* Detalle */}
                        <button 
                            title="Ver Detalles"
                            onClick={() => setMostrarDetallesModal(receta)}
                            className="flex items-center justify-center text-xs py-1 px-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                        >
                            <Info className="w-4 h-4" /> Detalles
                        </button>
                        
                        {/* Editar */}
                        <button 
                            title="Editar Receta"
                            onClick={() => handleOpenEditReceta(receta)}
                            className="flex items-center justify-center text-xs py-1 px-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md transition-colors"
                        >
                            <Edit className="w-4 h-4" /> Editar
                        </button>
                        
                        {/* Eliminar */}
                        <button 
                            title="Eliminar Receta"
                            onClick={() => handleDeleteReceta(receta)}
                            className="flex items-center justify-center text-xs py-1 px-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                            disabled={loading}
                        >
                            <Trash2 className="w-4 h-4" /> Eliminar
                        </button>

                    </div>
                    {/* --- FIN 3 BOTONES DE GESTIÓN --- */}
                </div>
            );
         })}
        </div>
       </div>
      ))}
     </div>
    </div>

    {/* COLUMNA 2: CARRITO Y CHECKOUT */}
    <div className="lg:w-2/5 space-y-6">
     <h2 className="text-2xl font-semibold text-gray-800">Carrito de Venta ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h2>
     
     <div className="bg-white shadow-lg rounded-xl p-4 h-[75vh] flex flex-col">
      {/* Lista de Items */}
      <div className="flex-grow space-y-3 overflow-y-auto pr-2">
       {cart.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Agrega pizzas del menú para empezar.</p>
       ) : (
        cart.map((item, index) => (
         <div key={index} className="flex justify-between items-center p-3 border-b last:border-b-0">
          <div className="flex-1 min-w-0">
           <p className="font-semibold text-gray-800 truncate">{item.receta.nombre} ({item.receta.tamano})</p>
           <p className="text-sm text-gray-500">
            1 x ${item.receta.precio.toFixed(2)}
           </p>
          </div>
          <div className="text-right flex items-center space-x-3">
           {/* Controles de Cantidad */}
           <div className="flex items-center border rounded-md">
            <button 
                onClick={() => updateCartItemQuantity(index, -1)} 
                className="p-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
            >
                <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-medium">{item.quantity}</span>
            <button 
                onClick={() => updateCartItemQuantity(index, 1)} 
                className="p-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
            >
                <Plus className="w-4 h-4" />
            </button>
           </div>
           
           {/* Precio Total */}
           <span className="font-bold text-lg text-indigo-600">
            ${item.totalPrice.toFixed(2)}
           </span>
          </div>
         </div>
        ))
       )}
      </div>

      {/* Resumen y Botones de Venta */}
      <div className="pt-4 border-t mt-4">
       <div className="flex justify-between text-2xl font-bold mb-4">
        <span>TOTAL:</span>
        <span className="text-green-600">${cartTotal.toFixed(2)}</span>
       </div>
       <div className="space-y-2">
        <button 
         onClick={handleProcessSale} 
         disabled={cart.length === 0 || loading}
         className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
         {loading ? <Loader2 className="animate-spin inline mr-2" /> : <ShoppingCart className="w-5 h-5 inline mr-2" />}
         Finalizar Venta
        </button>
        <button 
         onClick={() => setCart([])} 
         disabled={cart.length === 0 || loading}
         className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
         Vaciar Carrito
        </button>
       </div>
      </div>
     </div>
    </div>
   </div>
   
   {/* ======================================= */}
   {/* MODAL 1: CREAR / EDITAR RECETA (CRUD) */}
   {/* ======================================= */}
    {mostrarFormularioReceta && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
            <div className="relative mx-auto p-6 border w-full max-w-3xl shadow-lg rounded-md bg-white">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                    {recetaAEditar ? 'Editar Receta Existente' : 'Crear Nueva Receta de Pizza'}
                </h3>
                <form onSubmit={handleSaveReceta} className="space-y-6">
                    
                    {/* SECCIÓN 1: DATOS BÁSICOS */}
                    <fieldset className="p-4 border rounded-lg space-y-4">
                        <legend className="font-semibold text-lg text-indigo-600 px-2">Información Básica</legend>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Pizza</label>
                                <input 
                                    type="text" 
                                    name="nombre" 
                                    id="nombre" 
                                    value={recetaFormData.nombre}
                                    onChange={handleRecetaInputChange}
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="tamano" className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
                                <select 
                                    name="tamano" 
                                    id="tamano" 
                                    value={recetaFormData.tamano}
                                    onChange={handleRecetaInputChange}
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                >
                                    <option value="Mediana">Mediana</option>
                                    <option value="Grande">Grande</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                                <input 
                                    type="number" 
                                    name="precio" 
                                    id="precio" 
                                    value={recetaFormData.precio}
                                    onChange={handleRecetaInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* SECCIÓN 2: INGREDIENTES */}
                    <fieldset className="p-4 border rounded-lg space-y-4">
                        <legend className="font-semibold text-lg text-indigo-600 px-2">Consumo de Ingredientes</legend>
                        
                        {/* AÑADIR NUEVO INGREDIENTE */}
                        <div className="grid grid-cols-12 gap-3 items-end p-2 bg-gray-50 rounded-md border">
                            <div className="col-span-6">
                                <label htmlFor="id_producto" className="block text-sm font-medium text-gray-700 mb-1">Ingrediente</label>
                                <select 
                                    name="id_producto" 
                                    id="id_producto" 
                                    value={tempIngrediente.id_producto}
                                    onChange={handleTempIngredienteChange}
                                    required
                                    // *** APLICAMOS LA CORRECCIÓN DE ESTILO AQUÍ ***
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                                >
                                    <option value="">Selecciona un producto</option>
                                    {stock.map(item => (
                                        // Las opciones también fuerzan el color
                                        <option key={item.id} value={item.id} className="text-gray-900">
                                            {item.producto} ({item.especificacion})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-4">
                                <label htmlFor="cantidad_uso" className="block text-sm font-medium text-gray-700 mb-1">Cantidad a Usar</label>
                                <input 
                                    type="number" 
                                    name="cantidad_uso" 
                                    id="cantidad_uso" 
                                    value={tempIngrediente.cantidad_uso}
                                    onChange={handleTempIngredienteChange}
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <span className="text-xs text-gray-500 mt-1">Unidad: {stock.find(i => i.id === Number(tempIngrediente.id_producto))?.especificacion || 'N/A'}</span>
                            </div>
                            <div className="col-span-2">
                                <button
                                    type="button"
                                    onClick={handleAddIngrediente}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md shadow-sm flex justify-center items-center"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* LISTA DE INGREDIENTES AÑADIDOS */}
                        {recetaFormData.ingredientes.length > 0 && (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {recetaFormData.ingredientes.map((ing) => ( 
                                    <div key={ing.id_producto} className="flex justify-between items-center p-2 border rounded-md bg-white">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{ing.producto_nombre}</p>
                                            <p className="text-sm text-gray-500">
                                                Uso: **{ing.cantidad_uso} {ing.unidad_medida}**
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveIngrediente(ing.id_producto)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {recetaFormData.ingredientes.length === 0 && (
                            <p className="text-center text-gray-500 text-sm italic">
                                Usa la sección de arriba para añadir los ingredientes y sus cantidades.
                            </p>
                        )}
                    </fieldset>
                    
                    {/* BOTONES DE GUARDAR/CANCELAR */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button 
                            type="button" 
                            onClick={handleCloseRecetaForm} 
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving || loading}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin inline mr-2 w-5 h-5" /> : <Check className="inline mr-2 w-5 h-5" />}
                            {recetaAEditar ? 'Guardar Cambios' : 'Crear Receta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}

   {/* ======================================= */}
   {/* MODAL 2: DETALLES DE RECETA */}
   {/* ======================================= */}
    {mostrarDetallesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
            <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                    Detalles de Receta: {mostrarDetallesModal.nombre} ({mostrarDetallesModal.tamano})
                </h3>
                
                <p className="text-lg font-bold text-green-600 mb-4">Precio de Venta: ${mostrarDetallesModal.precio.toFixed(2)}</p>

                <h4 className="font-semibold text-gray-700 mb-2">Ingredientes Requeridos:</h4>
                <ul className="list-disc list-inside space-y-1 bg-gray-50 p-4 rounded-md max-h-40 overflow-y-auto">
                    {mostrarDetallesModal.ingredientes.length > 0 ? (
                        mostrarDetallesModal.ingredientes.map((ing, index) => (
                            <li key={index} className="text-sm text-gray-700">
                                **{ing.cantidad_uso} {ing.unidad_medida}** de {ing.producto_nombre}
                            </li>
                        ))
                    ) : (
                        <p className="text-sm italic text-gray-500">Esta receta no tiene ingredientes definidos.</p>
                    )}
                </ul>

                <div className="flex justify-end mt-6">
                    <button 
                        type="button" 
                        onClick={() => setMostrarDetallesModal(null)} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )}
  </div>
 );
};

export default VentaPizzasPage;
// src/services/contactService.tsx

const API_URL_CONTACTS = 'http://localhost/Pizzatrack/backend/api/contacts/index.php'; 

export interface LeadContact {
    id?: string | number; 
    name: string;
    phone: string;
    email: string;
    tag: string; 
    tipoContacto: 'proveedor' | 'trabajador'; 
    profile?: { 
        type: 'silhouette' | 'initials';
        value?: string;
        bgColor?: string;
        textColor?: string;
    };
}

interface ApiResponse<T = LeadContact[]> {
    success: boolean;
    data?: T;
    message: string;
}

// --- LECTURA (GET) - CORREGIDA ---
export const getContacts = async (): Promise<ApiResponse<LeadContact[]>> => {
    try {
        const response = await fetch(API_URL_CONTACTS);
        const json = await response.json();
        
        if (json.success) {
            return { success: true, data: json.data as LeadContact[], message: json.message };
        }
        
        return json as ApiResponse<LeadContact[]>;

    } catch (_error) { 
        console.error("Error en getContacts:", _error);
        return { success: false, message: 'Fallo de conexión con el servidor.' };
    }
};

// --- CREACIÓN (POST) ---
export const createContact = async (contact: Omit<LeadContact, 'id' | 'profile'> & { profile?: LeadContact['profile'] }): Promise<ApiResponse> => {
    try {
        const dataToSend = {
            ...contact,
            profile: undefined
        };
        const response = await fetch(API_URL_CONTACTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend),
        });
        const data = await response.json();
        return data as ApiResponse;
    } catch (_error) { // <-- CORRECCIÓN
        console.error("Error en createContact:", _error);
        return { success: false, message: 'Fallo de conexión durante la creación.' };
    }
};

// --- ACTUALIZACIÓN (PUT) ---
export const updateContact = async (contact: LeadContact & { id: string | number }): Promise<ApiResponse> => {
    try {
        const dataToSend = {
            ...contact,
            profile: undefined 
        };
        const response = await fetch(API_URL_CONTACTS, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend),
        });
        const data = await response.json();
        return data as ApiResponse;
    } catch (_error) { // <-- CORRECCIÓN
        console.error("Error en updateContact:", _error);
        return { success: false, message: 'Fallo de conexión durante la actualización.' };
    }
};

// --- ELIMINACIÓN (DELETE) ---
export const deleteContact = async (id: string | number): Promise<ApiResponse> => {
    try {
        const response = await fetch(API_URL_CONTACTS, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id }),
        });
        const data = await response.json();
        return data as ApiResponse;
    } catch (_error) { // <-- CORRECCIÓN
        console.error("Error en deleteContact:", _error);
        return { success: false, message: 'Fallo de conexión durante la eliminación.' };
    }
};
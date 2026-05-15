import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "es";

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Sidebar
    "nav.dashboard": "Dashboard",
    "nav.resources": "Resources",
    "nav.myReservations": "My Reservations",
    "nav.wallet": "Wallet",
    "nav.favorites": "Favorites",
    "nav.admin": "Admin",
    "nav.manageResources": "Manage Resources",
    "nav.allReservations": "All Reservations",
    "nav.myListings": "My Listings",
    "nav.logout": "Log Out",
    "nav.appTitle": "Space & Equipment Reservation",

    // Login
    "login.title": "Sign in to manage your reservations",
    "login.email": "Email",
    "login.password": "Password",
    "login.forgot": "Forgot password?",
    "login.signIn": "Sign In",
    "login.noAccount": "Don't have an account?",
    "login.register": "Register here",

    // Register
    "register.title": "Create your account to start booking",
    "register.name": "Full Name",
    "register.email": "Email",
    "register.password": "Password",
    "register.role": "Role",
    "register.roleUser": "User",
    "register.roleAdmin": "Administrator",
    "register.create": "Create Account",
    "register.username": "Username",
    "register.bio": "Short Bio",
    "register.passwordHint": "6-12 characters, no spaces",
    "register.hasAccount": "Already have an account?",
    "register.signIn": "Sign in",

    // Dashboard
    "dashboard.welcome": "Welcome back,",
    "dashboard.overview": "Here's an overview of your reservations and resources.",
    "dashboard.availableResources": "Available Resources",
    "dashboard.activeReservations": "Active Reservations",
    "dashboard.equipmentInUse": "Equipment in Use",
    "dashboard.walletBalance": "Wallet Balance",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.browseResources": "Browse Resources",
    "dashboard.myReservations": "My Reservations",
    "dashboard.topUpWallet": "Top Up Wallet",
    "dashboard.recentReservations": "Recent Reservations",

    // Resources
    "resources.title": "Resources",
    "resources.subtitle": "Browse and book available spaces and equipment.",
    "resources.search": "Search resources...",
    "resources.type": "Type",
    "resources.allTypes": "All Types",
    "resources.room": "Room",
    "resources.laptop": "Laptop",
    "resources.projector": "Projector",
    "resources.vehicle": "Vehicle",
    "resources.whiteboard": "Whiteboard",
    "resources.available": "Available",
    "resources.inUse": "In Use",
    "resources.deposit": "Deposit",
    "resources.viewBook": "View & Book",
    "resources.unavailable": "Unavailable",

    // Resource Detail
    "detail.back": "Back to Resources",
    "detail.bookThis": "Book This Resource",
    "detail.date": "Date",
    "detail.startTime": "Start Time",
    "detail.endTime": "End Time",
    "detail.notes": "Notes (optional)",
    "detail.refundableDeposit": "Refundable Deposit",
    "detail.depositNote": "The deposit will be refunded after the booking ends, provided the resource is returned in good condition.",
    "detail.confirm": "Confirm Reservation",
    "detail.timeSlots": "Available Time Slots",
    "detail.timeSlotsHint": "Select a date above, then pick an available slot to book.",
    "detail.rules": "Rules & Requirements",
    "detail.amenities": "Amenities",
    "detail.capacity": "Capacity",
    "detail.confirmTitle": "Confirm Reservation",
    "detail.resource": "Resource",
    "detail.timeSlot": "Time Slot",
    "detail.deposit": "Deposit",
    "detail.cancel": "Cancel",
    "detail.confirmBtn": "Confirm",

    // My Reservations
    "reservations.title": "My Reservations",
    "reservations.subtitle": "View, modify, or cancel your bookings.",
    "reservations.refresh": "Refresh",
    "reservations.total": "Total",
    "reservations.confirmed": "Confirmed",
    "reservations.pending": "Pending",
    "reservations.completed": "Completed",
    "reservations.cancelled": "Cancelled",
    "reservations.resource": "Resource",
    "reservations.type": "Type",
    "reservations.date": "Date",
    "reservations.time": "Time",
    "reservations.depositCol": "Deposit",
    "reservations.status": "Status",
    "reservations.actions": "Actions",
    "reservations.modify": "Modify",
    "reservations.cancel": "Cancel",

    // Wallet
    "wallet.title": "Wallet",
    "wallet.subtitle": "Manage your virtual balance and view transaction history.",
    "wallet.balance": "Available Balance",
    "wallet.topUp": "Top Up",
    "wallet.totalDeposited": "Total Deposited",
    "wallet.totalRefunded": "Total Refunded",
    "wallet.forfeited": "Forfeited",
    "wallet.history": "Transaction History",
    "wallet.description": "Description",
    "wallet.dateCol": "Date",
    "wallet.typeCol": "Type",
    "wallet.amount": "Amount",
    "wallet.credit": "Credit",
    "wallet.debit": "Debit",
    "wallet.refund": "Refund",
    "wallet.topUpTitle": "Recharge Wallet",
    "wallet.amountLabel": "Amount to add (€)",
    "wallet.cardNumber": "Card Number",
    "wallet.expiry": "Expiry Date (MM/YY)",
    "wallet.cvv": "CVV",
    "wallet.payButton": "Pay and Recharge",
    "wallet.invalidAmount": "Please enter a valid amount",
    "wallet.success": "Recharge successful!",
    "wallet.processing": "Processing payment...",
    "wallet.cancel": "Cancel",

    // Admin Resources
    "adminRes.title": "Manage Resources",
    "adminRes.subtitle": "Add, edit, or remove spaces and equipment.",
    "adminRes.add": "Add Resource",
    "adminRes.resource": "Resource",
    "adminRes.type": "Type",
    "adminRes.location": "Location",
    "adminRes.deposit": "Deposit",
    "adminRes.status": "Status",
    "adminRes.actions": "Actions",
    "adminRes.edit": "Edit",
    "adminRes.delete": "Delete",
    "adminRes.dialogTitle": "Add New Resource",
    "adminRes.resName": "Resource Name",
    "adminRes.depositFee": "Deposit Fee (€)",
    "adminRes.cancelBtn": "Cancel",
    "adminRes.addBtn": "Add Resource",
    "adminRes.updateBtn": "Update Resource",
    "adminRes.description": "Description",
    "adminRes.rules": "Rules & Requirements",
    "adminRes.details": "Details & Rules",
    "adminRes.myListings": "My Listings",
    "adminRes.mySubtitle": "Manage the items you've posted for rent.",

    // Admin Reservations
    "adminBook.title": "All Reservations",
    "adminBook.subtitle": "Monitor and manage all bookings across the platform.",
    "adminBook.search": "Search by user or resource...",
    "adminBook.status": "Status",
    "adminBook.all": "All",
    "adminBook.user": "User",
    "adminBook.resource": "Resource",
    "adminBook.date": "Date",
    "adminBook.time": "Time",
    "adminBook.deposit": "Deposit",

    // User roles
    "role.admin": "Admin",
    "role.user": "User",
    "role.switchTo": "Switch to",

    // Favorites
    "favorites.title": "My Favorites",
    "favorites.noFavorites": "You haven't added any favorites yet.",
  },
  es: {
    // Sidebar
    "nav.dashboard": "Panel Principal",
    "nav.resources": "Recursos",
    "nav.myReservations": "Mis Reservas",
    "nav.wallet": "Monedero",
    "nav.favorites": "Favoritos",
    "nav.admin": "Admin",
    "nav.manageResources": "Gestionar Recursos",
    "nav.allReservations": "Todas las Reservas",
    "nav.myListings": "Mis Anuncios",
    "nav.logout": "Cerrar Sesión",
    "nav.appTitle": "Reserva de Espacios y Equipos",

    // Login
    "login.title": "Inicia sesión para gestionar tus reservas",
    "login.email": "Correo electrónico",
    "login.password": "Contraseña",
    "login.forgot": "¿Olvidaste tu contraseña?",
    "login.signIn": "Iniciar Sesión",
    "login.noAccount": "¿No tienes una cuenta?",
    "login.register": "Regístrate aquí",

    // Register
    "register.title": "Crea tu cuenta para empezar a reservar",
    "register.name": "Nombre completo",
    "register.email": "Correo electrónico",
    "register.password": "Contraseña",
    "register.role": "Rol",
    "register.roleUser": "Usuario",
    "register.roleAdmin": "Administrador",
    "register.create": "Crear Cuenta",
    "register.username": "Nombre de Usuario",
    "register.bio": "Breve Biografía",
    "register.passwordHint": "6-12 caracteres, sin espacios",
    "register.hasAccount": "¿Ya tienes una cuenta?",
    "register.signIn": "Iniciar sesión",

    // Dashboard
    "dashboard.welcome": "Bienvenido/a de nuevo,",
    "dashboard.overview": "Aquí tienes un resumen de tus reservas y recursos.",
    "dashboard.availableResources": "Recursos Disponibles",
    "dashboard.activeReservations": "Reservas Activas",
    "dashboard.equipmentInUse": "Equipos en Uso",
    "dashboard.walletBalance": "Saldo del Monedero",
    "dashboard.quickActions": "Acciones Rápidas",
    "dashboard.browseResources": "Explorar Recursos",
    "dashboard.myReservations": "Mis Reservas",
    "dashboard.topUpWallet": "Recargar Monedero",
    "dashboard.recentReservations": "Reservas Recientes",

    // Resources
    "resources.title": "Recursos",
    "resources.subtitle": "Explora y reserva espacios y equipos disponibles.",
    "resources.search": "Buscar recursos...",
    "resources.type": "Tipo",
    "resources.allTypes": "Todos los Tipos",
    "resources.room": "Sala",
    "resources.laptop": "Portátil",
    "resources.projector": "Proyector",
    "resources.vehicle": "Vehículo",
    "resources.whiteboard": "Pizarra",
    "resources.available": "Disponible",
    "resources.inUse": "En Uso",
    "resources.deposit": "Depósito",
    "resources.viewBook": "Ver y Reservar",
    "resources.unavailable": "No Disponible",

    // Resource Detail
    "detail.back": "Volver a Recursos",
    "detail.bookThis": "Reservar este Recurso",
    "detail.date": "Fecha",
    "detail.startTime": "Hora de Inicio",
    "detail.endTime": "Hora de Fin",
    "detail.notes": "Notas (opcional)",
    "detail.refundableDeposit": "Depósito Reembolsable",
    "detail.depositNote": "El depósito se reembolsará una vez finalizada la reserva, siempre que el recurso se devuelva en buen estado.",
    "detail.confirm": "Confirmar Reserva",
    "detail.timeSlots": "Franjas Horarias Disponibles",
    "detail.timeSlotsHint": "Selecciona una fecha arriba y luego elige una franja disponible.",
    "detail.amenities": "Equipamiento",
    "detail.capacity": "Capacidad",
    "detail.confirmTitle": "Confirmar Reserva",
    "detail.resource": "Recurso",
    "detail.timeSlot": "Franja Horaria",
    "detail.deposit": "Depósito",
    "detail.cancel": "Cancelar",
    "detail.confirmBtn": "Confirmar",

    // My Reservations
    "reservations.title": "Mis Reservas",
    "reservations.subtitle": "Consulta, modifica o cancela tus reservas.",
    "reservations.refresh": "Actualizar",
    "reservations.total": "Total",
    "reservations.confirmed": "Confirmadas",
    "reservations.pending": "Pendientes",
    "reservations.completed": "Completadas",
    "reservations.cancelled": "Canceladas",
    "reservations.resource": "Recurso",
    "reservations.type": "Tipo",
    "reservations.date": "Fecha",
    "reservations.time": "Hora",
    "reservations.depositCol": "Depósito",
    "reservations.status": "Estado",
    "reservations.actions": "Acciones",
    "reservations.modify": "Modificar",
    "reservations.cancel": "Cancelar",

    // Wallet
    "wallet.title": "Monedero",
    "wallet.subtitle": "Gestiona tu saldo virtual y consulta el historial de transacciones.",
    "wallet.balance": "Saldo Disponible",
    "wallet.topUp": "Recargar",
    "wallet.totalDeposited": "Total Depositado",
    "wallet.totalRefunded": "Total Reembolsado",
    "wallet.forfeited": "Perdido",
    "wallet.history": "Historial de Transacciones",
    "wallet.description": "Descripción",
    "wallet.dateCol": "Fecha",
    "wallet.typeCol": "Tipo",
    "wallet.amount": "Importe",
    "wallet.credit": "Crédito",
    "wallet.debit": "Débito",
    "wallet.refund": "Reembolso",
    "wallet.topUpTitle": "Recargar Monedero",
    "wallet.amountLabel": "Importe a añadir (€)",
    "wallet.cardNumber": "Número de Tarjeta",
    "wallet.expiry": "Fecha de Caducidad (MM/AA)",
    "wallet.cvv": "CVV",
    "wallet.payButton": "Pagar y Recargar",
    "wallet.invalidAmount": "Por favor, introduce un importe válido",
    "wallet.success": "¡Recarga realizada con éxito!",
    "wallet.processing": "Procesando pago...",
    "wallet.cancel": "Cancelar",

    // Admin Resources
    "adminRes.title": "Gestionar Recursos",
    "adminRes.subtitle": "Añade, edita o elimina espacios y equipos.",
    "adminRes.add": "Añadir Recurso",
    "adminRes.resource": "Recurso",
    "adminRes.type": "Tipo",
    "adminRes.location": "Ubicación",
    "adminRes.deposit": "Depósito",
    "adminRes.status": "Estado",
    "adminRes.actions": "Acciones",
    "adminRes.edit": "Editar",
    "adminRes.delete": "Eliminar",
    "adminRes.dialogTitle": "Añadir Nuevo Recurso",
    "adminRes.resName": "Nombre del Recurso",
    "adminRes.depositFee": "Tarifa de Depósito (€)",
    "adminRes.cancelBtn": "Cancelar",
    "adminRes.addBtn": "Añadir Recurso",
    "adminRes.updateBtn": "Actualizar Recurso",
    "adminRes.description": "Descripción",
    "adminRes.rules": "Reglas y Requisitos",
    "adminRes.details": "Detalles y Reglas",
    "adminRes.myListings": "Mis Anuncios",
    "adminRes.mySubtitle": "Gestiona los artículos que has subido para alquilar.",

    // Admin Reservations
    "adminBook.title": "Todas las Reservas",
    "adminBook.subtitle": "Supervisa y gestiona todas las reservas de la plataforma.",
    "adminBook.search": "Buscar por usuario o recurso...",
    "adminBook.status": "Estado",
    "adminBook.all": "Todas",
    "adminBook.user": "Usuario",
    "adminBook.resource": "Recurso",
    "adminBook.date": "Fecha",
    "adminBook.time": "Hora",
    "adminBook.deposit": "Depósito",

    // User roles
    "role.admin": "Admin",
    "role.user": "Usuario",
    "role.switchTo": "Cambiar a",

    // Favoritos
    "favorites.title": "Mis Favoritos",
    "favorites.noFavorites": "Aún no has añadido ningún favorito.",
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (key: string) => translations[lang][key] ?? key;
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

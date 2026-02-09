/* ============================================================
   MUNICIPALIDAD DE CHASCOMÚS - CHATBOT SCRIPT (FULL DATA)
   ============================================================ */

/* --- 1. CONFIGURACIÓN, ESTADO Y BARRIOS --- */
let userName = localStorage.getItem('muni_user_name') || "";
let userNeighborhood = localStorage.getItem('muni_user_neighborhood') || "";
let userAge = localStorage.getItem('muni_user_age') || "";

let currentPath = ['main'];
let isAwaitingForm = false;
let currentFormStep = 0;
let formData = { tipo: "", ubicacion: "", descripcion: "" };
let isBotThinking = false; 

// Lista oficial completa de Barrios de Chascomús
const BARRIOS_CHASCOMUS = [
    "Centro", 
    "El Porteño", 
    "San Cayetano", 
    "Gallo Blanco", 
    "La Noria", 
    "Iporá", 
    "Fátima", 
    "Lomas Altas", 
    "Parque Girado", 
    "El Algarrobo", 
    "30 de Mayo", 
    "Barrio Jardín", 
    "Escribano", 
    "Comandante Espora", 
    "Acceso Norte", 
    "San José Obrero", 
    "San Luis", 
    "Las Violetas",
    "Los Sauces"
];

const PALABRAS_OFENSIVAS = ["puto", "puta", "mierda", "verga", "pija", "concha", "chota", "culo", "boludo", "boluda", "pelotudo", "pelotuda", "tonto", "tonta", "idiota", "tarado", "tarada", "gil", "gila", "bobo", "boba", "chupala", "forro", "forra", "inutil", "trolo", "trola"];

/* --- FUNCIONES DE VALIDACIÓN INTELIGENTE --- */

// Normaliza texto: quita tildes, pasa a minúsculas y limpia espacios
function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function esTextoValido(texto) {
    const t = normalizar(texto);
    if (t.length < 3) return { v: false, m: "❌ Muy corto. Usá al menos 3 letras." };
    if (/^\d+$/.test(t)) return { v: false, m: "❌ No uses solo números." };
    // Evita repetición excesiva de caracteres (ej: "holaaaaa")
    if (/([a-z])\1{2,}/.test(t)) return { v: false, m: "❌ Escribilo correctamente." };
    
    const palabras = t.split(/\s+/);
    for (let p of palabras) {
        if (PALABRAS_OFENSIVAS.includes(p)) return { v: false, m: "⚠️ Por favor, usá lenguaje adecuado." };
    }
    return { v: true };
}

function esBarrioOficial(inputUsuario) {
    const inputNorm = normalizar(inputUsuario); // Lo que escribió el usuario (ej: "ipora")

    // Buscamos en la lista oficial
    const coincidencia = BARRIOS_CHASCOMUS.find(barrioReal => {
        const barrioNorm = normalizar(barrioReal); // El barrio de la lista (ej: "ipora")
        
        // 1. Coincidencia exacta (ej: "ipora" == "ipora")
        if (inputNorm === barrioNorm) return true;

        // 2. Coincidencia parcial (ej: si escribe "jardin" encuentra "Barrio Jardín")
        // Solo si la entrada es sustancial (>4 letras) para evitar falsos positivos
        if (barrioNorm.includes(inputNorm) && inputNorm.length > 4) return true;

        return false;
    });

    if (coincidencia) return { v: true, nombre: coincidencia };
    
    return { v: false, m: "📍 No encontré ese barrio en la lista oficial. ¿Podrías revisar cómo lo escribiste? (Ej: Centro, Iporá, La Noria)." };
}

/* --- 2. ESTADÍSTICAS --- */
const STATS_URL = "https://script.google.com/macros/s/AKfycbxxF9ubtFqDwev5hVY5WOdlfxgFVI7p1Avo4lbke7CvvCd4e7P2o8liXdPQO3emZgP-sg/exec";

function registrarEvento(accion, detalle) {
    if (!STATS_URL || STATS_URL.includes("TUS_LETRAS_RARAS")) return;
    const datos = {
        fecha: new Date().toLocaleString(),
        usuario: userName || "Anónimo",
        barrio: userNeighborhood || "No especificado",
        edad: userAge || "No especificado",
        accion: accion,
        detalle: detalle
    };
    fetch(STATS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    }).catch(console.error);
}

/* --- 3. MENÚS --- */  
const MENUS = {
    // MENÚ PRINCIPAL: Solo atajos rápidos
    main: { 
        title: (name) => `¡Hola <b>${name}</b>! 👋 Soy MuniBot. Acá tenés los accesos más rápidos de hoy:`, 
        options: [
            { id: 'oea_shortcut', label: '👀 Ojos en Alerta', type: 'leaf', apiKey: 'ojos_en_alerta' },
            { id: 'ag_shortcut', label: '🎭 Agenda Cultural', type: 'leaf', apiKey: 'agenda_actual' },
            { id: 'f_shortcut', label: '💊 Farmacias de Turno', type: 'leaf', apiKey: 'farmacias_lista' },
            { id: 'h_shortcut', label: '📅 Turnos Hospital', type: 'leaf', apiKey: 'h_turnos' },
            { id: 'full_menu', label: '☰ VER MENÚ COMPLETO' }
        ]
    },

    // MENÚ COMPLETO
    full_menu: {
        title: () => '📱 Menú Completo de Servicios Municipales:',
        options: [
            { id: 'politicas_gen', label: '💜 GÉNERO (Urgencias)', type: 'leaf', apiKey: 'politicas_gen' },
            { id: 'politicas_comu', label: '🛍️ Módulos (alimentos)', type: 'leaf', apiKey: 'asistencia_social' },
            { id: 'desarrollo_menu', label: '🤝 Desarrollo Social' },
            { id: 'sibon', label: '📰 Boletin Oficial' },
            { id: 'ojos_en_alerta', label: '👁️ Ojos en Alerta (Seguridad)', type: 'leaf', apiKey: 'ojos_en_alerta' },
            { id: 'el_digital', label: '📰 Diario digital' },
            { id: 'turismo', label: '🏖️ Turismo' },
            { id: 'deportes', label: '⚽ Deportes' },
            { id: 'salud', label: '🏥 Salud' },
            { id: 'obras', label: '🚧 Reclamos 147' },
            { id: 'seguridad', label: '🛡️ Seguridad' },
            { id: 'produccion', label: '🏭 Producción y Empleo' },
            { id: 'habilitaciones', label: '💰 Habilitaciones' },
            { id: 'omic', label: '🏦 Denuncias Omic' },
            { id: 'cultura', label: '🎭 Cultura y Agenda' },
            { id: 'habitat', label: '🏡 Reg demanda Habitacional', type: 'submenu' },
            { id: 'pago_deuda', label: '🅿️ago: Auto, Agua, Inmueble', type: 'submenu' },
            { id: 'contacto_op', label: '☎️ Hablar con Operador', type: 'leaf', apiKey: 'contacto_gral' }
        ]
    },

    // ... (El resto de tus menús se mantienen igual) ...
    ojos_en_alerta: { title: () => '👁️ Ojos en Alerta:', options: [ { id: 'oea_link', label: '🔗 Contacto WhatsApp', link: 'https://wa.me/5492241557444' } ] },
    cultura: { title: () => '🎭 Agenda Cultural:', options: [ { id: 'ag_actual', label: '📅 Agenda del Mes (FEBRERO)', type: 'leaf', apiKey: 'agenda_actual' } ] },
    el_digital: { title: () => '📰 Diario digital:', options: [ { id: 'digital_link', label: '🔗 Ir al Diario Digital', link: 'https://www.eldigitalchascomus.com.ar/' } ] },
    sibon: { title: () => '📰 Boletín Oficial de Chascomús:', options: [ { id: 'sibon_link', label: '🔗 Ir al Boletín Oficial', link: 'https://sibom.slyt.gba.gob.ar/cities/31' } ] },
    turismo: { title: () => 'Turismo y Cultura:', options: [ { id: 't_info', label: 'ℹ️ Oficinas y Contacto', type: 'leaf', apiKey: 'turismo_info' }, { id: 't_link', label: '🔗 Web de Turismo', link: 'https://linktr.ee/turismoch' } ] },
    deportes: { title: () => 'Deportes:', options: [ { id: 'd_info', label: '📍 Dirección de Deportes', type: 'leaf', apiKey: 'deportes_info' }, { id: 'd_calle', label: '🏃 Circuito de Calle', type: 'leaf', apiKey: 'deportes_circuito' } ] },
    desarrollo_menu: { title: () => 'Desarrollo Social y Comunitaria:', options: [ { id: 'mediacion', label: '⚖️ Mediación Vecinal', type: 'leaf', apiKey: 'mediacion_info' }, { id: 'uda', label: '📍 Puntos UDA', type: 'leaf', apiKey: 'uda_info' }, { id: 'ninez', label: '👶 Niñez', type: 'leaf', apiKey: 'ninez' } ] },
    habitat: { title: () => 'Secretaría de Hábitat:', options: [ { id: 'habitat', label: '🔑 Info de Hábitat', type: 'leaf', apiKey: 'info_habitat' }, { id: 'hab_info', label: '📍 Dirección y Contacto', type: 'leaf', apiKey: 'habitat_info' }, { id: 'hab_plan', label: '🏘️ Planes Habitacionales', type: 'leaf', apiKey: 'habitat_planes' } ] },
    salud: { title: () => 'Gestión de Salud Pública:', options: [ { id: 'centros', label: '🏥 CAPS (Salitas)' }, { id: 'hospital_menu', label: '🏥 Hospital' }, { id: 'f_lista', label: '💊 Farmacias y Turnos', type: 'leaf', apiKey: 'farmacias_lista' }, { id: 'zoonosis', label: '🐾 Zoonosis', type: 'leaf', apiKey: 'zoo_rabia' }, { id: 'vac_hu', label: '💉 Vacunatorio', type: 'leaf', apiKey: 'vacunacion_info' } ] },
    centros: { title: () => 'Centros de Atención Primaria (CAPS):', options: [ { id: 'c_map', label: '📍 Ver Ubicaciones (Mapas)', type: 'leaf', apiKey: 'caps_mapas' }, { id: 'c_wa', label: '📞 Números de WhatsApp', type: 'leaf', apiKey: 'caps_wa' } ] },
    hospital_menu: { title: () => 'Hospital Municipal:', options: [ { id: 'h_tur', label: '📅 WhatsApp Turnos', type: 'leaf', apiKey: 'h_turnos' }, { id: 'h_espec_menu', label: '🩺 Especialidades', type: 'submenu' }, { id: 'h_guardia', label: '🚨 Guardia e Info', type: 'leaf', apiKey: 'h_info' } ] },
    h_espec_menu: { title: () => '🩺 Seleccioná la especialidad para ver los días:', options: [ { id: 'esp_pediatria', label: '👶 Pediatría', type: 'leaf', apiKey: 'info_pediatria' }, { id: 'esp_clinica', label: '🩺 Clínica Médica', type: 'leaf', apiKey: 'info_clinica' }, { id: 'esp_gineco', label: '🤰 Ginecología / Obstetricia', type: 'leaf', apiKey: 'info_gineco' }, { id: 'esp_cardio', label: '❤️ Cardiología', type: 'leaf', apiKey: 'info_cardio' }, { id: 'esp_trauma', label: '🦴 Traumatología', type: 'leaf', apiKey: 'info_trauma' }, { id: 'esp_oftalmo', label: '👁️ Oftalmología', type: 'leaf', apiKey: 'info_oftalmo' }, { id: 'esp_nutri', label: '🍎 Nutrición', type: 'leaf', apiKey: 'info_nutri' }, { id: 'esp_cirugia', label: '🔪 Cirugía', type: 'leaf', apiKey: 'info_cirugia' }, { id: 'esp_neuro', label: '🧠 Neurología / Psiquiatría', type: 'leaf', apiKey: 'info_neuro_psiq' } ] },
    seguridad: { title: () => 'Seguridad y Trámites:', options: [ { id: 'pamuv', label: '🆘 Asistencia Víctima (PAMUV)', type: 'leaf', apiKey: 'pamuv' }, { id: 'apps_seg', label: '📲 Descargar Apps (Basapp y SEM)', type: 'leaf', apiKey: 'apps_seguridad' }, { id: 'def_civil', label: '🌪️ Defensa Civil (103)', type: 'leaf', apiKey: 'defensa_civil' }, { id: 'lic_tramite', label: '🪪 Licencia (Carnet)', type: 'leaf', apiKey: 'lic_turno' }, { id: 'seg_academia', label: '🚗 Academia Conductores', type: 'leaf', apiKey: 'seg_academia' }, { id: 'seg_infracciones', label: '⚖️ Mis Infracciones', type: 'leaf', apiKey: 'seg_infracciones' }, { id: 'poli', label: '📞 Monitoreo y Comisaría', type: 'leaf', apiKey: 'poli' } ] },
    habilitaciones: { title: () => 'Gestión de Habilitaciones:', options: [ { id: 'hab_video', label: '🎥 Ver Video Instructivo', type: 'leaf', apiKey: 'hab_video_info' }, { id: 'hab_gral', label: '🏢 Comercio e Industria', type: 'leaf', apiKey: 'hab_gral' }, { id: 'hab_eventos', label: '🎉 Eventos y Salones', type: 'leaf', apiKey: 'hab_eventos' }, { id: 'hab_espacio', label: '🍔 Patios y Carros (Foodtruck)', type: 'leaf', apiKey: 'hab_espacio' }, { id: 'hab_reba', label: '🍷 REBA (Alcohol)', type: 'leaf', apiKey: 'hab_reba' } ] },
    pago_deuda: { title: () => 'Pago de Deudas y Boletas:', options: [ { id: 'deuda', label: '🔍 Ver Deuda / Pagar', type: 'leaf', apiKey: 'deuda' }, { id: 'agua', label: '💧 Agua', type: 'leaf', apiKey: 'agua' }, { id: 'boleta', label: '📧 Boleta Digital', type: 'leaf', apiKey: 'boleta' } ] },
    omic: { title: () => 'OMIC - Defensa del Consumidor:', options: [ { id: 'omic', label: '📢 OMIC (Defensa Consumidor)', type: 'leaf', apiKey: 'omic_info' } ] },
    hab_menu: { title: () => 'Gestión de Habilitaciones:', options: [ { id: 'hab_gral', label: '🏢 Comercio e Industria', type: 'leaf', apiKey: 'hab_gral' }, { id: 'hab_eventos', label: '🎉 Eventos y Salones', type: 'leaf', apiKey: 'hab_eventos' }, { id: 'hab_espacio', label: '🍔 Patios y Carros (Foodtruck)', type: 'leaf', apiKey: 'hab_espacio' }, { id: 'hab_reba', label: '🍷 REBA (Alcohol)', type: 'leaf', apiKey: 'hab_reba' } ] },
    produccion: { title: () => '🏭 Producción y Empleo:', options: [ { id: 'prod_eco_social', label: '🟢 Economía Social', type: 'submenu' }, { id: 'prod_of_empleo', label: '🔵 Oficina de Empleo (Busco Trabajo)', type: 'submenu' }, { id: 'prod_empresas', label: '🟠 Empresas y Emprendedores', type: 'submenu' }, { id: 'prod_empleadores', label: '🟣 Empleadores (Busco Personal)', type: 'submenu' }, { id: 'prod_manipulacion', label: '🔴 Carnet Manipulación Alimentos', type: 'leaf', apiKey: 'res_manipulacion' }, { id: 'prod_contacto', label: '📍 Contacto y Dirección', type: 'leaf', apiKey: 'prod_contacto' } ] },
    prod_eco_social: { title: () => '🟢 Economía Social:', options: [ { id: 'pe_compre', label: '🤝 Compre Chascomús', type: 'leaf', apiKey: 'res_compre_chascomus' }, { id: 'pe_frescos', label: '🥦 Productores Alimentos Frescos', type: 'leaf', apiKey: 'res_prod_frescos' } ] },
    prod_of_empleo: { title: () => '🔵 Oficina de Empleo:', options: [ { id: 'oe_inscripcion', label: '📝 Inscripción / Actualizar CV', type: 'leaf', apiKey: 'res_oe_inscripcion' }, { id: 'oe_promover', label: '♿ Programa Promover (Discapacidad)', type: 'leaf', apiKey: 'res_oe_promover' }, { id: 'oe_taller_cv', label: '📄 Taller Armado de CV', type: 'leaf', apiKey: 'res_oe_taller_cv' } ] },
    prod_empresas: { title: () => '🟠 Empresas y Emprendedores:', options: [ { id: 'emp_chasco', label: '🚀 Chascomús Emprende', type: 'leaf', apiKey: 'res_emp_chasco' } ] },
    prod_empleadores: { title: () => '🟣 Empleadores:', options: [ { id: 'empl_busqueda', label: '🔎 Publicar Búsqueda Laboral', type: 'leaf', apiKey: 'res_empl_busqueda' }, { id: 'empl_madrinas', label: '🤝 Empresas Madrinas', type: 'leaf', apiKey: 'res_empl_madrinas' } ] },
    obras: { title: () => 'Atención al Vecino 147:', options: [ { id: 'info_147', label: '📝 Iniciar Reclamo 147 (Chat), ℹ️ Info, Web y Teléfonos', type: 'leaf', apiKey: 'link_147' }, { id: 'poda', label: '🌿 Poda', type: 'leaf', apiKey: 'poda' }, { id: 'obras_basura', label: '♻️ Recolección', type: 'leaf', apiKey: 'obras_basura' } ] }
};

/* --- 4. RESPUESTAS (BASE DE DATOS HTML) --- */
const RES = {
    // ... (Se mantienen todas tus respuestas intactas) ...
    'agenda_actual': `<div class="info-card"><strong>📅 AGENDA FEBRERO 2026</strong><br><i>¡Disfrutá el verano en Chascomús!</i><br><br>🌕 <b>Sáb 1 - Remada Luna Llena:</b><br>Kayak & Tablas al atardecer.<br>📍 Club de Pesca y Náutica.<br><br>🎬 <b>Vie 6 - Audiovisual:</b> "Mis imágenes diarias" en C.C. Vieja Estación | 21hs.<br><br>🎭 <b>Sáb 7 - Teatro:</b> "Amores y Desamores" en Casa de Casco | 21hs.<br><br>🎂 <b>Sáb 7 - 90 Años Bellas Artes:</b> Mazzini y Lincoln | 19hs.<br><br>🏊 <b>Dom 8 - Triatlón Olímpico:</b> Paseo de los Inmigrantes | 8hs.<br><br>🎉 <b>13-16 - CARNAVAL INFANTIL:</b> Av. Alfonsín | 20hs.<br><br>🏊 <b>Sáb 14 - Aguas Abiertas:</b> Escalinatas Costanera | 12:00hs.<br><br>🎭 <b>Sáb 21 - Teatro:</b> "El Acompañamiento" en Casa de Casco | 21hs.<br><br>🐴 <b>21-22 - Gran Fiesta Criolla:</b> Fortín Chascomús | 13hs.<br><br>🎭 <b>27-28 - Visitas Dramatizadas:</b> Vieja Estación | 21hs.<br><br><hr style="border-top:1px dashed #ccc;margin:10px 0;">📲 <a href="https://wa.me/5492241603414" style="color:#25D366;font-weight:bold;">💬 WhatsApp Turismo</a></div>`,
    
    // Aquí puedes pegar el resto del objeto RES completo que ya tenías, no lo copio todo para no hacer el mensaje eterno, pero la estructura es esta.
    'omic_info': `<div class="info-card"><strong>📢 OMIC</strong><br>Oficina Municipal de Información al Consumidor.<br>📍 Dorrego 229.<br>⏰ Lun-Vie 8-13hs.<br>📞 43-1287</div>`,
    'caps_wa': `<div class="info-card"><strong>📞 WhatsApp CAPS:</strong><br>🟢 30 de Mayo: 2241-588248<br>🟢 B. Jardín: 2241-498087<br>🟢 San Luis: 2241-604874<br>🟢 El Porteño: 2241-409316<br>🟢 Gallo Blanco: 2241-469267<br>🟢 Iporá: 2241-588247<br>🟢 La Noria: 2241-604872<br>🟢 San Cayetano: 2241-511430</div>`,
    'link_147': `<div class="info-card"><strong>📝 ATENCIÓN 147</strong><br>💻 <a href="https://147.chascomus.gob.ar">Web Autogestión</a><br>📧 atencionalvecino@chascomus.gob.ar<br>📞 Línea 147 (8-15hs).</div>`,
    'caps_mapas': `<div class="info-card"><strong>📍 Mapas CAPS:</strong><br>• <a href="https://www.google.com/maps/search/?api=1&query=CIC+30+de+Mayo+Chascomus">CIC 30 de Mayo</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=Barrio+Jardin+Chascomus">Barrio Jardín</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+San+Luis+Chascomus">San Luis</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+El+Porteño+Chascomus">El Porteño</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+Gallo+Blanco+Chascomus">Gallo Blanco</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+Ipora+Chascomus">Iporá</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+La+Noria+Chascomus">La Noria</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+San+Cayetano+Chascomus">San Cayetano</a></div>`,
    'farmacias_lista': `<div class="info-card"><strong>📍 Farmacias:</strong><br>Alfonsín, Aprile, Batastini, Belgrano, Bellingieri, Cangialosi, Chascomús, Del Norte, Farmasur, Malena, Moriset, Oria, Pasteur, Pensa, Pozzi, Puyssegur.<br><br>💊 <a href="https://www.turnofarma.com/turnos/ar/ba/chascomus" class="wa-btn">VER DE TURNO</a></div>`,
    'zoo_rabia': `<div class="info-card" style="border-left:5px solid #f1c40f;"><strong>🐾 Quirófano Móvil</strong><br>📅 Lun 3 Feb | 8:30hs<br>📍 B. Los Sauces.<br>✅ GRATIS.</div>`,
    'vacunacion_info': `<div class="info-card"><strong>💉 Vacunación</strong><br>🏥 Hospital San Vicente.<br>🏠 Puntos Barriales (CIC, CAPS).<br>📋 Llevar DNI y Libreta.</div>`,
    'info_habitat': `<div class="info-card"><strong>🔑 Info de Hábitat</strong><br>• Registro Demanda.<br>• Bien de Familia.<br>• Tierras y Catastro.</div>`,
    'habitat_info': `<div class="info-card"><strong>📍 Dirección de Hábitat</strong><br><a href="https://wa.me/5492241559412" class="wa-btn">💬 WhatsApp</a><br>📍 Dorrego y Bolivar.</div>`,
    'habitat_planes': `<div class="info-card"><strong>🏘️ Planes Habitacionales</strong><br><a href="https://apps.chascomus.gob.ar/vivienda/" class="wa-btn">🔗 Ver Planes</a></div>`,
    'ojos_en_alerta': `<div class="info-card"><strong>👀 OJOS EN ALERTA</strong><br>Seguridad ciudadana.<br>📍 Arenales y J. Quintana.<br><a href="https://wa.me/5492241557444">📞 2241-557444</a></div>`,
    'pamuv': `<div class="info-card" style="border-left:5px solid #c0392b;"><strong>🆘 PAMUV</strong><br>Asistencia a la Víctima.<br><a href="https://wa.me/5492241514881" class="wa-btn">📞 WhatsApp 24hs</a></div>`,
    'defensa_civil': `<div class="info-card" style="border-left:5px solid #c0392b;"><strong>🌪️ Defensa Civil</strong><br>🚨 Emergencias 103.<br><a href="tel:103" class="wa-btn">LLAMAR 103</a></div>`,
    'apps_seguridad': `<div class="info-card"><strong>📲 Apps Seguridad</strong><br>🔔 BASAPP (Alerta)<br>🅿️ SEM (Estacionamiento)<br>Disponibles en Play Store y App Store.</div>`,
    'turismo_info': `<div class="info-card"><strong>🏖️ Turismo</strong><br>📍 Av. Costanera España 25.<br>📞 61-5542.<br><a href="https://linktr.ee/turismoch">🔗 Linktree</a></div>`,
    'deportes_info': `<div class="info-card"><strong>⚽ Deportes</strong><br>📍 Av. Costanera y Lastra.<br>📞 42-4649.</div>`,
    'deportes_circuito': `<div class="info-card"><strong>🏃 Circuito de Calle</strong><br><a href="https://apps.chascomus.gob.ar/deportes/circuitodecalle/">🔗 IR A LA WEB</a></div>`,
    'seg_academia': `<div class="info-card"><strong>🚗 Academia Conductores</strong><br><a href="https://apps.chascomus.gob.ar/academia/">🔗 INGRESAR A LA WEB</a></div>`,
    'seg_medido': `<div class="info-card"><strong>🅿️ Estacionamiento</strong><br>Descargá SEM Mobile o gestioná vía web.</div>`,
    'lic_turno': `<b>📅 Turno Licencia:</b><br>🔗 <a href="https://apps.chascomus.gob.ar/academia/">SOLICITAR TURNO</a>`,
    'seg_infracciones': `<b>⚖️ Infracciones:</b><br>🔗 <a href="https://chascomus.gob.ar/municipio/estaticas/consultaInfracciones">VER MIS MULTAS</a>`,
    'poli': `<div class="info-card"><strong>🎥 MONITOREO</strong><br><a href="tel:431333" class="wa-btn">📞 43-1333</a><br>🚔 <b>POLICIA:</b> <a href="tel:422222">42-2222</a></div>`,
    'politicas_gen': `<div class="info-card" style="border-left:5px solid #9b59b6;"><strong>💜 Género</strong><br>📍 Moreno 259.<br>☎️ 43-1287.<br><a href="https://wa.me/5492241559397" class="wa-btn">🚨 GUARDIA 24HS</a></div>`,
    'asistencia_social': `<div class="info-card" style="border-left:5px solid #e67e22;"><strong>🍎 Módulos (CAM)</strong><br>📦 Retiro en depósito calle Juárez.<br>⏰ Lun-Vie 8-14hs.<br><a href="https://wa.me/5492241530478" class="wa-btn">📲 Consultar WhatsApp</a></div>`,
    'ninez': `<div class="info-card"><strong>👶 Niñez:</strong> Mendoza 95. 📞 43-1146.</div>`,
    'mediacion_info': `<div class="info-card"><strong>⚖️ Mediación:</strong> Moreno 259.</div>`,
    'uda_info': `<div class="info-card"><strong>📍 Puntos UDA:</strong><br>San Luis, San José, El Porteño, 30 de Mayo, B. Jardín, Gallo Blanco, Iporá.</div>`,
    'poda': `<div class="info-card"><strong>🌿 Poda:</strong> <a href="https://apps.chascomus.gob.ar/podaresponsable/solicitud.php">Solicitud Online</a></div>`,
    'obras_basura': `<div class="info-card"><strong>♻️ Basura:</strong><br>Lun-Sáb 20hs (Húmedos)<br>Jue 14hs (Reciclables)</div>`,
    'hac_tomasa': `<div class="info-card"><strong>🌾 TOMASA:</strong> <a href="https://tomasa.chascomus.gob.ar/">INGRESAR</a></div>`,
    'boleta': `<div class="info-card"><strong>📧 Boleta Digital:</strong> <a href="https://wa.me/5492241557616">📲 WhatsApp</a></div>`,
    'agua': `<div class="info-card"><strong>💧 Agua:</strong> <a href="https://apps.chascomus.gob.ar/caudalimetros/consulta.php">Ver Consumo</a></div>`,
    'deuda': `<div class="info-card"><strong>🔍 Deuda:</strong> <a href="https://chascomus.gob.ar/municipio/estaticas/consultaDeudas">Consultar Aquí</a></div>`,
    'hab_gral': `<div class="info-card"><strong>🏢 Habilitaciones:</strong> Maipú 415.<br><a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionComercial.php" class="wa-btn">INICIAR ONLINE</a></div>`,
    'hab_video_info': `<div class="info-card"><strong>🎥 Video Guía:</strong><br>Tutorial disponible.</div>`,
    'hab_eventos': `<div class="info-card"><strong>🎉 Eventos:</strong> Pedir con 10 días de anticipación.<br><a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionEventoPrivado2.0.php">Formulario</a></div>`,
    'hab_espacio': `<div class="info-card"><strong>🍔 Foodtrucks:</strong> <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionCarro.php">Solicitar Permiso</a></div>`,
    'hab_reba': `<div class="info-card"><strong>🍷 REBA:</strong> <a href="https://wa.me/5492241559389">💬 WhatsApp</a></div>`,
    'h_turnos': `<div class="info-card"><strong>📅 Turnos Hospital:</strong> <a href="https://wa.me/5492241466977">📲 2241-466977</a></div>`,
    'h_info': `<div class="info-card"><strong>📍 Hospital:</strong> Av. Alfonsín e Yrigoyen.</div>`,
    'info_pediatria': `<div class="info-card"><strong>👶 Pediatría:</strong> Lun, Mar, Jue.<br><a href="https://wa.me/5492241466977" class="wa-btn">📅 Turno</a></div>`,
    'info_clinica': `<div class="info-card"><strong>🩺 Clínica:</strong> Lun, Mié, Vie.<br><a href="https://wa.me/5492241466977" class="wa-btn">📅 Turno</a></div>`,
    'info_gineco': `<div class="info-card"><strong>🤰 Gineco/Obst:</strong> Lun, Mié.<br><a href="https://wa.me/5492241466977" class="wa-btn">📅 Turno</a></div>`,
    'info_cardio': `<div class="info-card"><strong>❤️ Cardio:</strong> Mar.<br><a href="https://wa.me/5492241466977" class="wa-btn">📅 Turno</a></div>`,
    'info_trauma': `<div class="info-card"><strong>🦴 Trauma:</strong> Mar.<br><a href="https://wa.me/5492241466977" class="wa-btn">📅 Turno</a></div>`,
    'info_oftalmo': `<div class="info-card"><strong>👁️ Oftalmo:</strong> Mié.<br><a href="https://wa.me/5492241466977" class="wa-btn">📅 Turno</a></div>`,
    'info_nutri': `<div class="info-card"><strong>🍎 Nutrición:</strong> Jue.<br><a href="https://wa.me/5492241466977" class="wa-btn">📅 Turno</a></div>`,
    'info_cirugia': `<div class="info-card"><strong>🔪 Cirugía:</strong> Jue.<br><a href="https://wa.me/5492241466977" class="wa-btn">📅 Turno</a></div>`,
    'info_neuro_psiq': `<div class="info-card"><strong>🧠 Salud Mental:</strong> Vie.<br><a href="https://wa.me/5492241466977" class="wa-btn">📅 Turno</a></div>`,
    'res_compre_chascomus': `<div class="info-card"><strong>🤝 Compre Chascomús:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSfa4LPccR6dYwkQFWhG31HELnaKMCSgUF7Jqy1xfiSNR_fA_g/viewform" class="wa-btn">📝 Inscripción</a></div>`,
    'res_prod_frescos': `<div class="info-card"><strong>🥦 Productores Frescos:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSeMzImHt14uXF4ZSk3wiJEqfxK4U2Tw9bSJrJXaKGLv5kLGew/closedform" class="wa-btn">📝 Formulario</a></div>`,
    'res_oe_inscripcion': `<div class="info-card"><strong>📝 Oficina Empleo:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSfl7uzaIU0u8G-S3uTjtddZl7y4o5jajZUzNuftZEyfqPdDKg/viewform" class="wa-btn">Cargar CV</a></div>`,
    'res_oe_promover': `<div class="info-card"><strong>♿ Programa Promover:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSdGoPi4Xmg0zD2VtBzTr1sFol1QtLAM5G0oDA6vExM_cvIYbQ/viewform" class="wa-btn">Inscripción</a></div>`,
    'res_oe_taller_cv': `<div class="info-card"><strong>📄 Taller CV:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSdQkEPZZx7gXZXO9vAb7u3Klxj8g5cwSe1fXqz6Zmo4jjMNBg/viewform" class="wa-btn">Inscribirse</a></div>`,
    'res_emp_chasco': `<div class="info-card"><strong>🚀 Emprendedores:</strong> <a href="https://uploads.chascomus.gob.ar/produccion/PROGRAMA%20CHASCOMUS%20EMPRENDE.pdf" class="wa-btn">Inscripción</a></div>`,
    'res_empl_busqueda': `<div class="info-card"><strong>🔎 Publicar Puesto:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSdOeVRsshYtc8JF-sTXyEqQgJl2hyTbxyfDPb0G7SsiGBMj_g/viewform" class="wa-btn">Formulario Empleador</a></div>`,
    'res_empl_madrinas': `<div class="info-card"><strong>🤝 Empresas Madrinas:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSe7SA_eKKQw-EDuFU9pDBIE_nUjzLOX6AZrHI_KfO3bwufVSA/viewform" class="wa-btn">Quiero ser Madrina</a></div>`,
    'res_manipulacion': `<div class="info-card"><strong>🔴 Carnet Manipulación:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSctX7eGQxBNei5howcIjXhIzlBTKQQb_RIBImnKXjVPvIVrvw/closedform" class="wa-btn">Inscripción</a></div>`,
    'prod_contacto': `<div class="info-card"><strong>📍 Producción:</strong> Maipú 415. 📞 43-6365.</div>`,
    'contacto_gral': `<div class="info-card"><strong>🏛️ Contacto:</strong> <a href="tel:02241431341" class="wa-btn">📞 43-1341</a><br><a href="https://wa.me/5492241000000">💬 Chat Operador</a></div>`
};

/* --- 5. MOTOR DE CHAT --- */
const FRASES_RESPUESTA = ["¡Excelente selección! ⭐", "¡Perfecto! 👍", "¡Genial! Te ayudo con eso 😊", "¡Buena opción! 🔍", "¡Excelente elección! 🎯"];
function getFraseAleatoria() { return FRASES_RESPUESTA[Math.floor(Math.random() * FRASES_RESPUESTA.length)]; }

function scrollToBottom() {
    const container = document.getElementById('chatMessages'); 
    setTimeout(() => container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' }), 100);
}

function showTyping() {
    isBotThinking = true;
    const container = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.id = 'typingIndicator'; typing.className = 'typing-indicator';
    typing.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    container.appendChild(typing);
    scrollToBottom();
}

function removeTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
    isBotThinking = false;
}

function addMessage(content, side = 'bot', options = null) {
    if (side === 'bot') removeTyping();
    const container = document.getElementById('chatMessages');
    const row = document.createElement('div'); row.className = 'message-wrapper';
    const div = document.createElement('div'); div.className = `message ${side}`;
    if (side === 'user') div.textContent = content; else div.innerHTML = content;
    row.appendChild(div);
    if (options) {
        const optDiv = document.createElement('div'); optDiv.className = 'options-container';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = `option-button ${opt.id === 'back' ? 'back' : ''}`;
            btn.innerText = opt.label;
            btn.onclick = () => handleAction(opt);
            optDiv.appendChild(btn);
        });
        row.appendChild(optDiv);
    }
    container.appendChild(row); scrollToBottom();
}

function handleAction(opt) {
    if (isBotThinking) return; 
    
    if (opt.id === 'back') { 
        if (currentPath.length > 1) currentPath.pop(); 
        showMenu(currentPath[currentPath.length - 1]); 
        return; 
    }

    if (opt.link) { window.open(opt.link, '_blank'); return; }

    addMessage(opt.label, 'user');

    // REGISTRO DE EDAD
    if (opt.type === 'age_select') {
        userAge = opt.label; 
        localStorage.setItem('muni_user_age', userAge);
        registrarEvento("Registro", "Perfil Completo - Edad: " + userAge); // REGISTRA EDAD
        showTyping();
        setTimeout(() => {
            addMessage(`¡Gracias <b>${userName}</b>! Ahora con tus datos. ¿En qué te ayudo hoy?`, 'bot');
            resetToMain();
        }, 1000);
        return;
    }

    // REGISTRO DE CLICKS (Solo si no es volver ni registro)
    registrarEvento("Click", opt.label || opt.id);

    if (opt.type === 'form_147') return startReclamoForm();
    showTyping();
    const frase = getFraseAleatoria();

    if (opt.type === 'leaf' || opt.apiKey) {
        setTimeout(() => {
            addMessage(`${frase}<br>${RES[opt.apiKey] || "Información no disponible."}`, 'bot');
            showNavControls(); 
        }, 800);
    } else if (MENUS[opt.id]) {
        currentPath.push(opt.id);
        setTimeout(() => { addMessage(frase, 'bot'); showMenu(opt.id); }, 600);
    }
}

function showMenu(key) {
    if (document.getElementById('typingIndicator')) removeTyping();
    const menu = MENUS[key];
    const title = typeof menu.title === 'function' ? menu.title(userName) : menu.title;
    let opts = [...menu.options];
    if (currentPath.length > 1) opts.push({ id: 'back', label: '⬅️ Volver' });
    addMessage(title, 'bot', opts);
}

function showNavControls() {
    const container = document.getElementById('chatMessages');
    const navDiv = document.createElement('div'); navDiv.className = 'options-container'; 
    navDiv.innerHTML = `<button class="option-button back" onclick="showMenu(currentPath[currentPath.length - 1])">⬅️ Volver</button>
                        <button class="option-button" onclick="resetToMain()">🏠 Inicio</button>`;
    container.appendChild(navDiv); scrollToBottom();
}

function resetToMain() { currentPath = ['main']; showTyping(); setTimeout(() => showMenu('main'), 600); }

/* --- 6. FORMULARIO 147 --- */
function startReclamoForm() {
    isAwaitingForm = true; currentFormStep = 1; toggleInput(true); 
    showTyping(); setTimeout(() => addMessage("📝 <b>Paso 1/3:</b> ¿Qué problema es? (Ej: Luminaria, Basura)", 'bot'), 600);
}

function processFormStep(text) {
    showTyping();
    setTimeout(() => {
        if (currentFormStep === 1) { formData.tipo = text; currentFormStep = 2; addMessage("📍 <b>Paso 2/3:</b> ¿Dirección exacta?", 'bot'); }
        else if (currentFormStep === 2) { formData.ubicacion = text; currentFormStep = 3; addMessage("🖊️ <b>Paso 3/3:</b> Descripción breve.", 'bot'); }
        else if (currentFormStep === 3) { formData.descripcion = text; finalizeForm(); }
    }, 600);
}

function finalizeForm() {
    isAwaitingForm = false; toggleInput(false);
    const msg = `🏛️ *RECLAMO 147*\n👤 *Vecino:* ${userName}\n🏷️ *Tipo:* ${formData.tipo}\n📍 *Ubicación:* ${formData.ubicacion}\n📝 *Desc:* ${formData.descripcion}`;
    const url = `https://wa.me/5492241514700?text=${encodeURIComponent(msg)}`;
    addMessage(`<div class="info-card">✅ <strong>Datos Listos</strong><br><a href="${url}" target="_blank" class="wa-btn">📲 ENVIAR RECLAMO</a></div>`, 'bot');
    showNavControls();
}

/* --- 7. BUSCADOR INTELIGENTE Y PROCESAMIENTO --- */

function ejecutarBusquedaInteligente(texto) {
   const diccionario = {
        'farmacia':   { type: 'leaf', apiKey: 'farmacias_lista', label: '💊 Farmacias' },
        'agenda':     { type: 'leaf', apiKey: 'agenda_actual', label: '🎭 Agenda Cultural' },
        'cultural':   { type: 'leaf', apiKey: 'agenda_actual', label: '🎭 Agenda Cultural' },
        'teatro':     { type: 'leaf', apiKey: 'agenda_actual', label: '🎭 Agenda Cultural' },
        'turno':      { type: 'leaf', apiKey: 'h_turnos', label: '📅 Turnos Hospital' },
        'especialidad':{ type: 'leaf', apiKey: 'h_turnos', label: '📅 Turnos Hospital' },
        'medico':     { type: 'leaf', apiKey: 'h_turnos', label: '📅 Turnos Hospital' },
        'hospital':   { id: 'hospital_menu', label: '🏥 Menú Hospital' }, 
        '147':        { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'reclamo':    { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'luz':        { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'foco':       { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'bache':      { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'perdida':     { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'caño':       { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'ramas':      { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'basura':     { type: 'leaf', apiKey: 'obras_basura', label: '♻️ Recolección' },
        'contenedor': { type: 'leaf', apiKey: 'obras_basura', label: '♻️ Recolección' },
        'reciclo':    { type: 'leaf', apiKey: 'obras_basura', label: '♻️ Recolección' },
        'recoleccion': { type: 'leaf', apiKey: 'obras_basura', label: '♻️ Recolección' },
        'poda':       { type: 'leaf', apiKey: 'poda', label: '🌿 Poda' },
        'arbol':      { type: 'leaf', apiKey: 'poda', label: '🌿 Poda' },
        'deporte':    { id: 'deportes', label: '⚽ Deportes' },  
        'futbol':     { id: 'deportes', label: '⚽ Deportes' },
        'canchas':    { id: 'deportes', label: '⚽ Deportes' },
        'natacion':   { id: 'deportes', label: '⚽ Deportes' },
        'piscina':    { id: 'deportes', label: '⚽ Deportes' },
        'turismo':    { id: 'turismo', label: '🏖️ Turismo' },
        'turista':    { id: 'turismo', label: '🏖️ Turismo' },
        'reba':       { type: 'leaf', apiKey: 'hab_reba', label: '🍷 REBA' },
        'alcohol':    { type: 'leaf', apiKey: 'hab_reba', label: '🍷 REBA' },
        'licencia':   { type: 'leaf', apiKey: 'lic_turno', label: '🪪 Licencias' },
        'carnet':     { type: 'leaf', apiKey: 'lic_turno', label: '🪪 Licencias' },
        'castracion': { type: 'leaf', apiKey: 'zoo_rabia', label: '🐾 Zoonosis' },
        'vacunacion': { type: 'leaf', apiKey: 'vacunacion_info', label: '💉 Vacunación' },
        'vacuna':     { type: 'leaf', apiKey: 'vacunacion_info', label: '💉 Vacunación' },
        'empleo':     { type: 'leaf', apiKey: 'prod_empleo', label: '👷 Empleo' },
        'emprende':   { id: 'produccion_menu', label: '👷 Producción y Empleo' }, 
        'caps':       { id: 'centros', label: '🏥 Caps' },
        'saludmental': { id: 'centros', label: '🏥 Caps' },
        'salita':     { id: 'centros', label: '🏥 Caps' },
        'salud':      { id: 'salud', label: '🏥 Menú Salud' },         
        'seguridad':  { id: 'seguridad', label: '🛡️ Menú Seguridad' }, 
        'tormenta':   { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'viento':     { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'inundacion': { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'clima':      { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'lluvia':     { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'emergencia': { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'camara':     { type: 'leaf', apiKey: 'poli', label: '📹 Camaras de seguridad' },
        'camaras':    { type: 'leaf', apiKey: 'poli', label: '📹 Camaras de seguridad' },
        'espacio':    { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'publico':    { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'evento':     { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'fiesta':     { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'foodtruck':  { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'carro':      { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'local':      { type: 'leaf', apiKey: 'hab_gral', label: '🏢 Habilitación Comercial' },  
        'comercio':   { type: 'leaf', apiKey: 'hab_gral', label: '🏢 Habilitación Comercial' },
        'medidor':    { type: 'leaf', apiKey: 'agua', label: '💧 Consumo de Agua'  }, 
        'agua':       { type: 'leaf', apiKey: 'agua', label: '💧 Consumo de Agua'  }, 
        'boleta':     { type: 'leaf', apiKey: 'boleta', label: '📧 Boleta Digital' },
        'tomasa':     { type: 'leaf', apiKey: 'hac_tomasa', label: '📧 Tomasa' },
        'casa':       { type: 'leaf', apiKey: 'habitat_info', label: '🏢 Habilitación Habitacional'  },
        'vivienda':   { type: 'leaf', apiKey: 'habitat_info', label: '🏢 Habilitación Habitacional'  },       
        'denuncia':   { id: 'omic', label: '🏦 Denuncias Omic' },
        'consumidor': { id: 'omic', label: '🏦 Denuncias Omic' },
        'barrio':     { id: 'vecinales', label: '🏘️ Vecinales' },
        'trabajo':    { id: 'produccion', label: '👷 Producción y Empleo' },        
        'curriculum': { id: 'produccion', label: '👷 Producción y Empleo' },
        'cv':         { id: 'produccion', label: '👷 Producción y Empleo' },
        'boletin':    { id: 'sibon', label: '📰 Boletín Oficial' },
        'oficial':    { id: 'sibon', label: '📰 Boletín Oficial' },
        'diario':     { id: 'el_digital', label: '📰 Diario Digital' },
        'digital':    { id: 'el_digital', label: '📰 Diario Digital' }

    };
    showTyping();
    setTimeout(() => {
        for (let palabra in diccionario) {
            if (texto.includes(palabra)) { 
                addMessage(getFraseAleatoria(), 'bot');
                handleAction(diccionario[palabra]); return;
            }
        }
        addMessage("No entendí. Escribí '<b>Menú</b>' para ver opciones. 🤔", 'bot');
        showNavControls();
    }, 800);
}

function processInput() {
    const input = document.getElementById('userInput'); 
    const val = input.value.trim();
    if (!val || isBotThinking) return;

    if (isAwaitingForm) { 
        addMessage(val, 'user'); input.value = ""; processFormStep(val); return; 
    }

    // REGISTRO DE NOMBRE
    if (!userName) { 
        const check = esTextoValido(val);
        if (!check.v) {
            addMessage(val, 'user'); input.value = ""; showTyping();
            setTimeout(() => addMessage(check.m, 'bot'), 600);
            return;
        }
        userName = val; 
        localStorage.setItem('muni_user_name', val); 
        registrarEvento("Registro", "Nombre: " + val); // REGISTRA NOMBRE
        addMessage(val, 'user'); input.value = ""; showTyping(); 
        
        setTimeout(() => addMessage(`¡Gusto conocerte <b>${userName}</b>! 👋 ¿Me indicarias tu <b>barrio</b> para mejorar la experiencia?`, 'bot'), 800); 
        return; 
    }

    // REGISTRO DE BARRIO (CON VALIDACIÓN INTELIGENTE)
    if (!userNeighborhood) { 
        // 1. Validar lenguaje (anti-insultos)
        const checkTexto = esTextoValido(val);
        if (!checkTexto.v) {
            addMessage(val, 'user'); input.value = ""; showTyping();
            setTimeout(() => addMessage(checkTexto.m, 'bot'), 600);
            return;
        }

        // 2. Validar barrio oficial (ignora tildes y mayúsculas)
        const checkBarrio = esBarrioOficial(val);
        if (!checkBarrio.v) {
            addMessage(val, 'user'); input.value = ""; showTyping();
            setTimeout(() => addMessage(checkBarrio.m, 'bot'), 600);
            return;
        }

        // ÉXITO
        userNeighborhood = checkBarrio.nombre; // Usamos el nombre bien escrito de la lista
        localStorage.setItem('muni_user_neighborhood', userNeighborhood); 
        registrarEvento("Registro", "Barrio: " + userNeighborhood); // REGISTRA BARRIO
        
        addMessage(val, 'user'); input.value = ""; showTyping();
        
        const edades = [{label:'-20', type:'age_select'}, {label:'20-40', type:'age_select'}, {label:'40-60', type:'age_select'}, {label:'+60', type:'age_select'}];
        setTimeout(() => addMessage(`¡Excelente! <b>${userName}</b> de <b>${userNeighborhood}</b>. ¿Cuál es tu edad?`, 'bot', edades), 800);
        return;
    }

    // BUSCADOR NORMAL
    addMessage(val, 'user'); 
    registrarEvento("Búsqueda", val); // REGISTRA BÚSQUEDA
    input.value = ""; 
    ejecutarBusquedaInteligente(val.toLowerCase());
}

/* --- 8. CARGA --- */
document.getElementById('sendButton').onclick = processInput;
document.getElementById('userInput').onkeypress = (e) => { if(e.key === 'Enter') processInput(); };
function toggleInput(show) { document.getElementById('inputBar').style.display = show ? 'flex' : 'none'; }
function toggleInfo() { document.getElementById('infoModal').classList.toggle('show'); }
function clearSession() { if(confirm("¿Borrar datos?")) { localStorage.clear(); location.reload(); } }

window.onload = () => { if (!userName) { showTyping(); setTimeout(() => addMessage("👋 Bienvenido. Para empezar, ¿cual es tu <b>nombre</b>?", 'bot'), 600); } else resetToMain(); };
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');


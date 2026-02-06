/* --- CONFIGURACIÓN --- */
let userName = localStorage.getItem('muni_user_name') || "";
let currentPath = ['main'];
let isAwaitingForm = false;
let currentFormStep = 0;
let formData = { tipo: "", ubicacion: "", descripcion: "" };

/* --- ESTADÍSTICAS (Google Sheets) --- */
// ⚠️ IMPORTANTE: PEGA AQUÍ TU URL DE APPS SCRIPT
const STATS_URL = "https://script.google.com/macros/s/AKfycbyv6W175qMpbqVUsg0ETM2SOtkdUPsoAUHG3XnaiIjgMFmEnDr7FeVGcyr9dl9AfHB0/exec";

function registrarEvento(accion, detalle) {
    if (!STATS_URL || STATS_URL.includes("TUS_LETRAS_RARAS_AQUI")) return;

    const datos = {
        usuario: userName || "Anónimo",
        accion: accion,
        detalle: detalle
    };

    // 'no-cors' permite enviar datos sin esperar respuesta (fire and forget)
    fetch(STATS_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    }).catch(err => console.error("Error stats:", err));
}

/* --- MENÚS --- */  
const MENUS = {
    main: { 
        title: (name) => `¡Hola <b>${name}</b>! 👋 Soy MuniBot el asistente virtual de la Municipalidad. ¿Empecemos la recorrida?`, 
        options: [
            { id: 'politicas_gen', label: '💜 GÉNERO (Urgencias)', type: 'leaf', apiKey: 'politicas_gen' },
            { id: 'politicas_comu', label: '🛍️ Módulos (alimentos)', type: 'leaf', apiKey: 'asistencia_social' },
            { id: 'desarrollo_menu', label: '🤝 Desarrollo Social' },
            { id: 'sibon', label: '📰 Boletin Oficial' },
            { id: 'ojos en_alerta', label: '👁️ Ojos en Alerta (Seguridad)', type: 'leaf', apiKey: 'ojos_en_alerta' },
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

    ojos_en_alerta: {
        title: () => '👁️ Ojos en Alerta:',
        options: [
            { id: 'oea_link', label: '🔗 Contacto WhatsApp', link: 'https://wa.me/5492241557444' },
        ]
    },

    cultura: {
        title: () => '🎭 Agenda Cultural:',
        options: [
            { id: 'ag_actual', label: '📅 Agenda del Mes (FEBRERO)', type: 'leaf', apiKey: 'agenda_actual' },
        ]
    },

     el_digital: {
        title: () => '📰 Diario digital:',
        options: [
            { id: 'digital_link', label: '🔗 Ir al Diario Digital', link: 'https://www.eldigitalchascomus.com.ar/' }
        ]
    },

    sibon: {
        title: () => '📰 Boletín Oficial de Chascomús:',
        options: [
            { id: 'sibon_link', label: '🔗 Ir al Boletín Oficial', link: 'https://sibom.slyt.gba.gob.ar/cities/31' }
        ]
    },
    turismo: {
        title: () => 'Turismo y Cultura:',
        options: [
            { id: 't_info', label: 'ℹ️ Oficinas y Contacto', type: 'leaf', apiKey: 'turismo_info' },
            { id: 't_link', label: '🔗 Web de Turismo', link: 'https://linktr.ee/turismoch' }
        ]
    },
    deportes: {
        title: () => 'Deportes:',
        options: [
            { id: 'd_info', label: '📍 Dirección de Deportes', type: 'leaf', apiKey: 'deportes_info' },
            { id: 'd_calle', label: '🏃 Circuito de Calle', type: 'leaf', apiKey: 'deportes_circuito' }
        ]
    },
    desarrollo_menu: {
        title: () => 'Desarrollo Social y Comunitaria:', 
        options: [
            { id: 'mediacion', label: '⚖️ Mediación Vecinal', type: 'leaf', apiKey: 'mediacion_info' },
            { id: 'uda', label: '📍 Puntos UDA', type: 'leaf', apiKey: 'uda_info' },
            { id: 'ninez', label: '👶 Niñez', type: 'leaf', apiKey: 'ninez' }
        ]
    },
    habitat: {
        title: () => 'Secretaría de Hábitat:',
        options: [
            { id: 'habitat', label: '🔑 Info de Hábitat', type: 'leaf', apiKey: 'info_habitat' },
            { id: 'hab_info', label: '📍 Dirección y Contacto', type: 'leaf', apiKey: 'habitat_info' },
            { id: 'hab_plan', label: '🏘️ Planes Habitacionales', type: 'leaf', apiKey: 'habitat_planes' }
        ]
    },
    salud: { 
        title: () => 'Gestión de Salud Pública:', 
        options: [
            { id: 'centros', label: '🏥 CAPS (Salitas)' }, 
            { id: 'hospital_menu', label: '🏥 Hospital' },
            { id: 'f_lista', label: '💊 Farmacias y Turnos', type: 'leaf', apiKey: 'farmacias_lista' },
            { id: 'zoonosis', label: '🐾 Zoonosis', type: 'leaf', apiKey: 'zoo_rabia' },
            { id: 'vac_hu', label: '💉 Vacunatorio', type: 'leaf', apiKey: 'vacunacion_info' }
        ]
    },
    centros: { 
        title: () => 'Centros de Atención Primaria (CAPS):',
        options: [
            { id: 'c_map', label: '📍 Ver Ubicaciones (Mapas)', type: 'leaf', apiKey: 'caps_mapas' },
            { id: 'c_wa', label: '📞 Números de WhatsApp', type: 'leaf', apiKey: 'caps_wa' }
        ]
    },
    hospital_menu: {
        title: () => 'Hospital Municipal:',
        options: [
            { id: 'h_tur', label: '📅 WhatsApp Turnos', type: 'leaf', apiKey: 'h_turnos' },
            { id: 'h_espec_menu', label: '🩺 Especialidades', type: 'submenu' },
            { id: 'h_guardia', label: '🚨 Guardia e Info', type: 'leaf', apiKey: 'h_info' }
        ]
    },
    /* --- MENÚ ESPECIALIDADES (INVERTIDO) --- */
    h_espec_menu: {
        title: () => '🩺 Seleccioná la especialidad para ver los días:',
        options: [
            { id: 'esp_pediatria', label: '👶 Pediatría', type: 'leaf', apiKey: 'info_pediatria' },
            { id: 'esp_clinica', label: '🩺 Clínica Médica', type: 'leaf', apiKey: 'info_clinica' },
            { id: 'esp_gineco', label: '🤰 Ginecología / Obstetricia', type: 'leaf', apiKey: 'info_gineco' },
            { id: 'esp_cardio', label: '❤️ Cardiología', type: 'leaf', apiKey: 'info_cardio' },
            { id: 'esp_trauma', label: '🦴 Traumatología', type: 'leaf', apiKey: 'info_trauma' },
            { id: 'esp_oftalmo', label: '👁️ Oftalmología', type: 'leaf', apiKey: 'info_oftalmo' },
            { id: 'esp_nutri', label: '🍎 Nutrición', type: 'leaf', apiKey: 'info_nutri' },
            { id: 'esp_cirugia', label: '🔪 Cirugía', type: 'leaf', apiKey: 'info_cirugia' },
            { id: 'esp_neuro', label: '🧠 Neurología / Psiquiatría', type: 'leaf', apiKey: 'info_neuro_psiq' }
        ]
    },
    seguridad: { 
        title: () => 'Seguridad y Trámites:', 
        options: [
            { id: 'pamuv', label: '🆘 Asistencia Víctima (PAMUV)', type: 'leaf', apiKey: 'pamuv' },
            { id: 'apps_seg', label: '📲 Descargar Apps (Basapp y SEM)', type: 'leaf', apiKey: 'apps_seguridad' }, 
            { id: 'def_civil', label: '🌪️ Defensa Civil (103)', type: 'leaf', apiKey: 'defensa_civil' },
            { id: 'lic_tramite', label: '🪪 Licencia (Carnet)', type: 'leaf', apiKey: 'lic_turno' },
            { id: 'seg_academia', label: '🚗 Academia Conductores', type: 'leaf', apiKey: 'seg_academia' },
            { id: 'seg_infracciones', label: '⚖️ Mis Infracciones', type: 'leaf', apiKey: 'seg_infracciones' },
            { id: 'poli', label: '📞 Monitoreo y Comisaría', type: 'leaf', apiKey: 'poli' }
        ]
    },

  habilitaciones: {
        title: () => 'Gestión de Habilitaciones:',
        options: [
            { id: 'hab_video', label: '🎥 Ver Video Instructivo', type: 'leaf', apiKey: 'hab_video_info' },
            { id: 'hab_gral', label: '🏢 Comercio e Industria', type: 'leaf', apiKey: 'hab_gral' },
            { id: 'hab_eventos', label: '🎉 Eventos y Salones', type: 'leaf', apiKey: 'hab_eventos' },
            { id: 'hab_espacio', label: '🍔 Patios y Carros (Foodtruck)', type: 'leaf', apiKey: 'hab_espacio' },
            { id: 'hab_reba', label: '🍷 REBA (Alcohol)', type: 'leaf', apiKey: 'hab_reba' }
        ]
    },

    pago_deuda: {
        title: () => 'Pago de Deudas y Boletas:',
        options: [        
            { id: 'deuda', label: '🔍 Ver Deuda / Pagar', type: 'leaf', apiKey: 'deuda' },
            { id: 'agua', label: '💧 Agua', type: 'leaf', apiKey: 'agua' },
            { id: 'boleta', label: '📧 Boleta Digital', type: 'leaf', apiKey: 'boleta' }
        ]
    },

    omic: { 
        title: () => 'OMIC - Defensa del Consumidor:', 
        options: [
             { id: 'omic', label: '📢 OMIC (Defensa Consumidor)', type: 'leaf', apiKey: 'omic_info' },]
    },

    hab_menu: {
        title: () => 'Gestión de Habilitaciones:',
        options: [
            { id: 'hab_gral', label: '🏢 Comercio e Industria', type: 'leaf', apiKey: 'hab_gral' },
            { id: 'hab_eventos', label: '🎉 Eventos y Salones', type: 'leaf', apiKey: 'hab_eventos' },
            { id: 'hab_espacio', label: '🍔 Patios y Carros (Foodtruck)', type: 'leaf', apiKey: 'hab_espacio' },
            { id: 'hab_reba', label: '🍷 REBA (Alcohol)', type: 'leaf', apiKey: 'hab_reba' }
        ]
    },
    
    produccion: {
        title: () => '🏭 Producción y Empleo:',
        options: [
            { id: 'prod_eco_social', label: '🟢 Economía Social', type: 'submenu' },
            { id: 'prod_of_empleo', label: '🔵 Oficina de Empleo (Busco Trabajo)', type: 'submenu' },
            { id: 'prod_empresas', label: '🟠 Empresas y Emprendedores', type: 'submenu' },
            { id: 'prod_empleadores', label: '🟣 Empleadores (Busco Personal)', type: 'submenu' },
            { id: 'prod_manipulacion', label: '🔴 Carnet Manipulación Alimentos', type: 'leaf', apiKey: 'res_manipulacion' },
            { id: 'prod_contacto', label: '📍 Contacto y Dirección', type: 'leaf', apiKey: 'prod_contacto' }
        ]
    },

    prod_eco_social: {
        title: () => '🟢 Economía Social:',
        options: [
            { id: 'pe_compre', label: '🤝 Compre Chascomús', type: 'leaf', apiKey: 'res_compre_chascomus' },
            { id: 'pe_frescos', label: '🥦 Productores Alimentos Frescos', type: 'leaf', apiKey: 'res_prod_frescos' }
        ]
    },

    prod_of_empleo: {
        title: () => '🔵 Oficina de Empleo:',
        options: [
            { id: 'oe_inscripcion', label: '📝 Inscripción / Actualizar CV', type: 'leaf', apiKey: 'res_oe_inscripcion' },
            { id: 'oe_promover', label: '♿ Programa Promover (Discapacidad)', type: 'leaf', apiKey: 'res_oe_promover' },
            { id: 'oe_taller_cv', label: '📄 Taller Armado de CV', type: 'leaf', apiKey: 'res_oe_taller_cv' }
        ]
    },

    prod_empresas: {
        title: () => '🟠 Empresas y Emprendedores:',
        options: [
            { id: 'emp_chasco', label: '🚀 Chascomús Emprende', type: 'leaf', apiKey: 'res_emp_chasco' },
        ]
    },

    prod_empleadores: {
        title: () => '🟣 Empleadores:',
        options: [
            { id: 'empl_busqueda', label: '🔎 Publicar Búsqueda Laboral', type: 'leaf', apiKey: 'res_empl_busqueda' },
            { id: 'empl_madrinas', label: '🤝 Empresas Madrinas', type: 'leaf', apiKey: 'res_empl_madrinas' }
        ]
    },
    obras: { 
        title: () => 'Atención al Vecino 147:', 
        options: [
            { id: 'info_147', label: '📝 Iniciar Reclamo 147 (Chat), ℹ️ Info, Web y Teléfonos', type: 'leaf', apiKey: 'link_147' },
            { id: 'poda', label: '🌿 Poda', type: 'leaf', apiKey: 'poda' },
            { id: 'obras_basura', label: '♻️ Recolección', type: 'leaf', apiKey: 'obras_basura' }
        ]
    }
};

/* --- RESPUESTAS (Base de Datos HTML) --- */
const RES = {
    'agenda_actual': `
    <div class="info-card">
        <strong>📅 AGENDA FEBRERO 2026</strong><br>
        <i>¡Disfrutá el verano en Chascomús!</i><br><br>

        🌕 <b>Sáb 1 - Remada Luna Llena:</b><br>
        Kayak & Tablas al atardecer.<br>
        📍 Club de Pesca y Náutica. (Horario a confirmar).<br><br>

        🎬 <b>Vie 6 - Audiovisual:</b><br>
        "Mis imágenes diarias".<br>
        📍 C.C. Vieja Estación | 21hs | Gratis.<br><br>

        🎭 <b>Sáb 7 - Teatro:</b><br>
        "Amores y Desamores".<br>
        📍 Casa de Casco | 21hs | 🎟️ $18.000.<br><br>

        🎂 <b>Sáb 7 - 90 Años Bellas Artes:</b><br>
        Música en vivo y danza. Llevá tu reposera.<br>
        📍 Mazzini y Lincoln | 19hs | Gratis.<br><br>

        🏊 <b>Dom 8 - Triatlón Olímpico:</b><br>
        Competencia de resistencia.<br>
        📍 Paseo de los Inmigrantes | 8hs.<br><br>

        🎉 <b>13, 14, 15 y 16 - CARNAVAL INFANTIL:</b><br>
        Desfiles, música y color.<br>
        📍 Corsódromo (Av. Alfonsín) | 20hs | Gratis.<br><br>

        🏊 <b>Sáb 14 - Aguas Abiertas (3ra fecha):</b><br>
        Carreras de 750m y 2500m.<br>
        📍 Escalinatas Costanera | 12:00hs.<br><br>

        🎭 <b>Sáb 21 - Teatro:</b><br>
        Obra "El Acompañamiento".<br>
        📍 Casa de Casco | 21hs | 🎟️ $18.000.<br><br>

        🐴 <b>21 y 22 - Gran Fiesta Criolla:</b><br>
        Jineteadas, desfiles y peña.<br>
        📍 Fortín Chascomús (Ruta 20) | 13hs.<br><br>

        🎭 <b>27 y 28 - Visitas Dramatizadas:</b><br>
        Recorrido teatralizado histórico.<br>
        📍 Vieja Estación | 21hs | 🎟️ $18.000.<br><br>

        <hr style="border-top: 1px dashed #ccc; margin: 10px 0;">

        🏛️🌅 <b>INSCRIPCIONES Y LINKS:</b><br>
        Solicitá los formularios de inscripción para actividades:<br><br>
        📲 <b>WhatsApp Turismo:</b><br>
        <a href="https://wa.me/5492241603414" style="color:#25D366; font-weight:bold; text-decoration:none;">💬 2241-603414 (Clic aquí)</a><br><br>
        🔗 <b>Linktree Inscripciones:</b><br>
        <a href="https://linktr.ee/visitasguiadas.turismoch" target="_blank">Ingresar al Linktree</a>
    </div>`,
    
    'omic_info': `
    <div class="info-card">
        <strong>📢 OMIC (Defensa del Consumidor)</strong><br>
        Oficina Municipal de Información al Consumidor.<br><br>
        ⚖️ <b>Asesoramiento y Reclamos:</b><br>
        Protección de derechos en compras y servicios.<br><br>
        📍 <b>Dirección:</b> Dorrego 229 (Estación Ferroautomotora).<br>
        ⏰ <b>Horario:</b> Lunes a Viernes de 8:00 a 13:00 hs.<br>
        📞 <b>Teléfonos:</b> 43-1287 / 42-5558
    </div>`,

    'caps_wa': `
    <div class="info-card">
        <strong>📞 WhatsApp de los CAPS:</strong><br><br>
        🟢 <b>30 de Mayo:</b> <a href="https://wa.me/5492241588248">2241-588248</a><br>
        🟢 <b>Barrio Jardín:</b> <a href="https://wa.me/5492241498087">2241-498087</a><br>
        🟢 <b>San Luis:</b> <a href="https://wa.me/5492241604874">2241-604874</a><br>
        🟢 <b>El Porteño:</b> <a href="https://wa.me/5492241409316">2241-409316</a><br>
        🟢 <b>Gallo Blanco:</b> <a href="https://wa.me/5492241469267">2241-469267</a><br>
        🟢 <b>Iporá:</b> <a href="https://wa.me/5492241588247">2241-588247</a><br>
        🟢 <b>La Noria:</b> <a href="https://wa.me/5492241604872">2241-604872</a><br>
        🟢 <b>San Cayetano:</b> <a href="https://wa.me/5492241511430">2241-511430</a>
    </div>`,

    'link_147': `
    <div class="info-card">
        <strong>📝 ATENCIÓN AL VECINO 147</strong><br><br>
        💻 <b>Primera opción:</b>Web Autogestión (24/7):</b><br>
        Cargá tu ticket y seguí el caso.<br>
        🔗 <a href="https://147.chascomus.gob.ar" target="_blank">147.chascomus.gob.ar</a><br><br>
        📧 <b>Correo:</b> <a href="mailto:atencionalvecino@chascomus.gob.ar">atencionalvecino@chascomus.gob.ar</a><br><br>
           <b>Utilizar como ultima opcion:</b><br>
        📞 <b>Teléfono (Línea 147):</b><br>
        Lun a Vie de 8 a 15 horas.<br><br>
        📋 <b>Datos necesarios:</b><br>
        Nombre, DNI, Teléfono, Dirección del problema y adjuntar foto o archivo.
    </div>`,

    'caps_mapas': `
    <div class="info-card">
        <strong>📍 Ubicaciones CAPS (Toque para ver mapa):</strong><br><br>
        • <a href="https://www.google.com/maps/search/?api=1&query=CIC+30+de+Mayo+Chascomus" target="_blank">CIC 30 de Mayo</a> (Bvd. 5 y Calle 2)<br>
        • <a href="https://www.google.com/maps/search/?api=1&query=Barrio+Jardin+Chascomus" target="_blank">Barrio Jardín</a> (Tucumán e/ Quintana)<br>
        • <a href="https://www.google.com/maps/search/?api=1&query=CAPS+San+Luis+Chascomus" target="_blank">San Luis</a> (Chubut 755)<br>
        • <a href="https://www.google.com/maps/search/?api=1&query=CAPS+El+Porteño+Chascomus" target="_blank">El Porteño</a> (Lucio Mansilla)<br>
        • <a href="https://www.google.com/maps/search/?api=1&query=CAPS+Gallo+Blanco+Chascomus" target="_blank">Gallo Blanco</a> (Estados Unidos)<br>
        • <a href="https://www.google.com/maps/search/?api=1&query=CAPS+Ipora+Chascomus" target="_blank">Iporá</a> (Sargento Cabral 387)<br>
        • <a href="https://www.google.com/maps/search/?api=1&query=CAPS+La+Noria+Chascomus" target="_blank">La Noria</a> (Grito de Dolores)<br>
        • <a href="https://www.google.com/maps/search/?api=1&query=CAPS+San+Cayetano+Chascomus" target="_blank">San Cayetano</a> (Gabino Ezeiza)
    </div>`,

    'farmacias_lista': `
    <div class="info-card">
        <strong>📍 Farmacias en Chascomús:</strong><br><br>
        • <b>Alfonsín:</b> Libres del Sur 121<br>
        • <b>Aprile:</b> Av. Lastra 115<br>
        • <b>Batastini:</b> Cramer 70<br>
        • <b>Belgrano:</b> Belgrano 649<br>
        • <b>Bellingieri:</b> H. Yrigoyen 78<br>
        • <b>Cangialosi:</b> Garay 56<br>
        • <b>Chascomús:</b> Av. Lastra 350<br>
        • <b>Del Norte:</b> El Ombú 102<br>
        • <b>Farmasur:</b> Bahía Blanca 91<br>
        • <b>Malena:</b> Escribano y Machado<br>
        • <b>Moriset:</b> Av. Lastra 591<br>
        • <b>Oria:</b> Libres del Sur 413<br>
        • <b>Pasteur:</b> Libres del Sur 302<br>
        • <b>Pensa:</b> H. Yrigoyen 710<br>
        • <b>Pozzi:</b> Rioja 28<br>
        • <b>Puyssegur:</b> Libres del Sur 946<br><br>
        💊 <a href="https://www.turnofarma.com/turnos/ar/ba/chascomus" target="_blank" class="wa-btn" style="background:#2ecc71 !important;">VER FARMACIAS DE TURNO</a>
    </div>`,

    'zoo_rabia': `
    <div class="info-card" style="border-left: 5px solid #f1c40f;">
        <strong style="color:#d35400;">🐾 Quirófano Móvil (Castración)</strong><br><br>
        📅 <b>Lunes 3 de Febrero</b><br>
        ⏰ <b>A partir de las 8:30hs</b><br>
        📍 <b>Barrio Los Sauces</b> (Destacamento policial)<br><br>
        ✅ <b>GRATIS</b> - Revisación Clínica.<br>
        🐕 <b>Requisito:</b> Llevar la mascota con collar, correa y/o transportadora.<br><br>
        🏢 <b>Sede Zoonosis:</b> Mendoza 95.
    </div>`,

    'vacunacion_info': `
    <div class="info-card">
        <strong>💉 Vacunación</strong><br><br>
        🏥 <b>Hospital San Vicente de Paul:</b><br>
        Vacunatorio central. Prioridad: Niños (6m a 2a), gestantes y puérperas.<br><br>
        🏠 <b>Puntos Barriales:</b><br>
        CIC "Dr. Quintín" (30 de Mayo) y otros CAPS.<br><br>
        📋 <b>Info Importante:</b><br>
        • <b>Demanda espontánea</b> (No requiere orden médica).<br>
        • <b>Requisitos:</b> Llevar DNI y Libreta de Vacunación.<br><br>
        📱 <i>Consultá las redes de "Secretaría de Salud Chascomús" para horarios actualizados.</i>
    </div>`,

    'info_habitat': `
    <div class="info-card">
        <strong>🔑 Info de Hábitat</strong><br>
        • Registro de Demanda (Mayores de 18).<br>
        • Bien de Familia (Protección jurídica).<br>
        • Gestión de Tierras y Catastro.<br><br>
        👇 <b>Seleccioná una opción:</b>
    </div>`,
    
    'habitat_info': `
    <div class="info-card">
        <strong>📍 Dirección y contacto</strong><br>
        <i>Dirección de Hábitat y Tierras</i><br><br>
        <a href="https://wa.me/5492241559412" target="_blank" class="wa-btn" style="background-color: #25D366 !important; margin-bottom: 8px;">
            💬 Consultas WhatsApp
        </a>
        <a href="https://www.google.com/maps/search/?api=1&query=Dorrego+y+Bolivar+Chascomus" target="_blank" class="wa-btn" style="background-color: #e67e22 !important; margin-bottom: 8px;">
            📍 Dorrego y Bolivar (Ex IOMA)
        </a>
       </div>`,
       
    'habitat_planes': `
    <div class="info-card">
        <strong>🏘️ Planes Habitacionales</strong><br>
        <i>Programas de vivienda social y acceso a la tierra</i><br><br>
        📋 <b>Trámites Disponibles:</b><br>
        1. Registro de Demanda Habitacional.<br>
        2. Solicitud de Bien de Familia.<br>
        3. Consultas sobre Planes de Vivienda.<br><br>
        <a href="https://apps.chascomus.gob.ar/vivienda/" target="_blank" class="wa-btn" style="background-color: #004a7c !important;">
        🔗 Planes Habitacionales
        </a>
    </div>`,

     'ojos_en_alerta': `
    <div class="info-card">
        <strong>👀 OJOS(En alerta)</strong><br>
        Programa de seguridad ciudadana.<br><br>
        ⚖️ <b>Denuncias, Robo, Accidentes, Actitudes sospechosas, etc;.:</b><br>
        Protección de derechos del ciudadano.<br><br>
        📍 <b>Dirección:</b> Arenales y Julian quintana).<br>
        ⏰ <b>Horario:</b> Lunes a Lunes 24hs.<br>
        <a href="https://wa.me/5492241557444">2241-557444</a><br><br>
       
    </div>`,

    // Respuestas Seguridad y Trámites
   
    'pamuv': `<div class="info-card" style="border-left: 5px solid #c0392b;"><strong style="color: #c0392b;">🆘 PAMUV (Asistencia a la Víctima)</strong><br><br>Atención, contención y asesoramiento a personas víctimas de delitos o situaciones de violencia.<br><br>🛡️ <b>Plan Integral de Seguridad 2025-2027</b><br><br>🚨 <b>ATENCIÓN 24 HORAS:</b><br>Línea permanente para emergencias o consultas.<br><a href="https://wa.me/5492241514881" class="wa-btn" style="background-color: #c0392b !important;">📞 2241-514881 (WhatsApp)</a></div>`,
    'defensa_civil': `<div class="info-card" style="border-left: 5px solid #c0392b;">
    <strong style="color: #c0392b;">🌪️ Defensa Civil</strong><br><br>
    🚨 <b>LÍNEA DE EMERGENCIA:</b><br>
    Atención ante temporales, caída de árboles y riesgo en vía pública.<br>
    📞 <a href="tel:103" class="wa-btn" style="background-color: #c0392b !important; text-align:center; display:block;">LLAMAR AL 103</a><br>
    📧 <a href="mailto:defensa.civil@chascomus.gob.ar">Enviar Correo Electrónico</a></div>`,
    'apps_seguridad': `
    <div class="info-card">
        <strong>📲 Aplicaciones de Seguridad y Tránsito</strong><br><br>
        🔔 <b>BASAPP (Alerta Vecinal):</b><br>
        Botón antipánico y reportes.<br>
        🤖 <a href="https://play.google.com/store/apps/details?id=ar.com.basapp.android.client" target="_blank" rel="noopener noreferrer">Descargar Android</a><br>
        🍎 <a href="https://apps.apple.com/ar/app/basapp/id1453051463" target="_blank" rel="noopener noreferrer">Descargar iPhone</a><br><br>
        
        🅿️ <b>SEM (Estacionamiento Medido):</b><br>
        Gestioná tu estacionamiento.<br>
        🤖 <a href="https://play.google.com/store/apps/details?id=ar.edu.unlp.sem.mobile" target="_blank" rel="noopener noreferrer">Descargar Android</a><br>
        🍎 <a href="https://apps.apple.com/ar/app/sem-mobile/id1387705895" target="_blank" rel="noopener noreferrer">Descargar iPhone</a></div>`,
    'turismo_info': `<div class="info-card"><strong>🏖️ Subsecretaría de Turismo</strong><br>📍 Av. Costanera España 25<br>📞 <a href="tel:02241615542">02241 61-5542</a><br>📧 <a href="mailto:turismo@chascomus.gob.ar">Enviar Email</a><br>🔗 <a href="https://linktr.ee/turismoch" target="_blank">Más info en Linktree</a></div>`,
    'deportes_info': `<div class="info-card"><strong>⚽ Dirección de Deportes</strong><br>📍 Av. Costanera España y Av. Lastra<br>📞 <a href="tel:02241424649">(02241) 42 4649</a></div>`,
    'deportes_circuito': `<div class="info-card"><strong>🏃 Circuito de Calle</strong><br>Inscripciones, cronograma y resultados oficiales.<br>🔗 <a href="https://apps.chascomus.gob.ar/deportes/circuitodecalle/" target="_blank">IR A LA WEB</a></div>`,
    'seg_academia': `<div class="info-card"><strong>🚗 Academia de Conductores</strong><br>Turnos para cursos y exámenes teóricos.<br>🔗 <a href="https://apps.chascomus.gob.ar/academia/" target="_blank">INGRESAR A LA WEB</a></div>`,
    'seg_medido': `<div class="info-card"><strong>🅿️ Estacionamiento Medido</strong><br>Gestioná tu estacionamiento desde el celular.<br><br>📲 <b>Descargar App:</b><br>🤖 <a href="https://play.google.com/store/apps/details?id=ar.edu.unlp.sem.mobile.chascomus" target="_blank">Android (Google Play)</a><br>🍎 <a href="https://apps.apple.com/ar/app/sem-mobile/id1387705895" target="_blank">iPhone (App Store)</a><br><br>💻 <a href="https://chascomus.gob.ar/estacionamientomedido/" target="_blank">Gestión vía Web</a></div>`,
    'lic_turno': `<b>📅 Turno Licencia:</b><br>🔗 <a href="https://apps.chascomus.gob.ar/academia/">SOLICITAR TURNO</a>`, 
    'seg_infracciones': `<b>⚖️ Infracciones:</b><br>🔗 <a href="https://chascomus.gob.ar/municipio/estaticas/consultaInfracciones">VER MIS MULTAS</a>`, 

    'poli': `
    <div class="info-card">
        <strong>🎥 (MONITOREO)</strong><br><br>
        Secretaría de Seguridad Ciudadana y el Centro de Monitoreo.<br><br>
        ☎️ <b>:Para comunicarte</b><br>
        <a href="tel:43-1333" class="wa-btn" style="background-color:#25D366 !important; text-align:center;">📞 43-1333</a><br>
        <small><i>⚠️ Solo emergencias.</i></small><br><br>
         🚔 <b>POLICIA:</b><br>
        Solicitalo a <a href="tel:422222"class="wa-btn" style="background-color:#25D366 !important; text-align:center;">📞 42-2222</a><br><br>`,

    'politicas_gen': `<div class="info-card" style="border-left: 5px solid #9b59b6;"><strong style="color: #8e44ad; font-size: 1rem;">💜 Género y Diversidad</strong><br><br><div style="font-size: 0.85rem; margin-bottom: 12px;">🚨 <b>Guardia 24/7:</b> Orientación y acompañamiento en casos de violencia.<br>🧠 <b>Equipo Técnico:</b> Abogadas, psicólogas y trabajadoras sociales.<br>🏠 <b>Hogar de Tránsito:</b> Alojamiento temporal para mujeres en riesgo.<br>🗣️ <b>Varones:</b> Espacio de abordaje y deconstrucción de conductas violentas.<br>👮‍♀️ <b>Articulación:</b> Trabajo conjunto con Comisaría de la Mujer.</div><div style="background: #fdf2ff; padding: 10px; border-radius: 8px; font-size: 0.9rem;">📍 <b>Oficina:</b> Moreno 259 (Lun-Vie 9-14hs)<br>☎️ <b>Fijo Oficina:</b> <a href="tel:02241530448">2241-530448</a><br>🚓 <b>Comisaría Mujer:</b> <a href="tel:02241422653">42-2653</a></div><a href="https://wa.me/5492241559397" target="_blank" class="wa-btn" style="background-color: #8e44ad !important;">🚨 GUARDIA 24HS (WhatsApp)</a></div>`,
    
    /* --- TARJETA NUEVA: MÓDULOS ALIMENTARIOS (Estilo destacado) --- */
    'asistencia_social': `
    <div class="info-card" style="border-left: 5px solid #e67e22;">
        <strong style="color: #d35400; font-size: 1rem;">🍎 Módulos Alimentarios (CAM)</strong><br><br>
        
        <div style="font-size: 0.85rem; margin-bottom: 12px;">
            📦 <b>RETIRO DE MERCADERÍA:</b><br>
            Entrega mensual de módulos de alimentos secos para familias empadronadas.<br><br>
            📋 <b>Requisitos al retirar:</b><br>
            • Presentar DNI del titular (Obligatorio).<br>
            • Certificado médico (si corresponde a dieta celíaca).
        </div>

        <div style="background: #fff3e0; padding: 10px; border-radius: 8px; font-size: 0.9rem; border: 1px solid #ffe0b2;">
            📍 <b>Lugar de Retiro:</b><br>
            Depósito de calle Juárez (casi esquina Mazzini).<br><br>
            ⏰ <b>Horario:</b><br>
            Lunes a Viernes de 8:00 a 14:00 hs.<br><br>
            🏢 <b>Trámites y Empadronamiento:</b><br>
            Secretaría de Desarrollo (Moreno 259).
        </div>

        <br>
        <a href="https://wa.me/5492241530478" target="_blank" class="wa-btn" style="background-color: #d35400 !important;">
            📲 Consultar Cronograma (WhatsApp)
        </a>
    </div>`,
    
    // --- SALUD Y BIENESTAR SOCIAL --- //
    'ninez': `<div class="info-card"><strong>👶 Niñez:</b> Mendoza Nº 95. 📞 43-1146.`,
    'mediacion_info': `<div class="info-card"><strong>⚖️ Mediación Comunitaria</strong><br>Resolución pacífica y gratuita de conflictos vecinales (ruidos, mascotas, edilicios).<br>📍 <b>Acercate a:</b> Moreno 259.</div>`,
    'uda_info': `<div class="info-card"><strong>📍 Puntos UDA (Atención en Barrios)</strong><br><i>Acercate a tu punto más cercano:</i><br><br>🔹 <b>UDA 1 (San Luis):</b> Chubut 755 (Mar/Vie 9-12).<br>🔹 <b>UDA 2 (San José Obrero):</b> F. Chapa 625 (Mar/Vie 9-12).<br>🔹 <b>UDA 3 (El Porteño):</b> Mansilla y Calle 3 (Vie 9-12).<br>🔹 <b>UDA 4 (30 de Mayo):</b> Bvd. 5 y Calle 2 (Vie 9-12).<br>🔹 <b>UDA 5 (B. Jardín):</b> J. Quintana e/ Misiones (Mar/Mié 9-12).<br>🔹 <b>UDA 6 (Gallo Blanco):</b> EE.UU. y Las Flores (Lun 9-12).<br>🔹 <b>UDA 7 (San Cayetano):</b> Comedor (Mar 9-12).<br>🔹 <b>UDA 8 (Políticas Com.):</b> Sarmiento 42 (Lun-Vie 8-12).<br>🔹 <b>UDA 9 (Iporá):</b> Perú y S. Cabral (Jue 9-12).<br><br>🚨 <b>Guardia 24hs:</b> <a href="https://wa.me/5492241559397">2241-559397</a></div>`,
   
    // --- OBRAS PÚBLICAS Y ATENCIÓN AL VECINO --- //

    'poda': `<div class="info-card"><strong>🌿 Ingresa en este link 👇🏼</strong><br>🔗 <a href="https://apps.chascomus.gob.ar/podaresponsable/solicitud.php">🌳 Solicitud Poda</a></div>`,
    'obras_basura': `<div class="info-card"><strong>♻️ Recolección de residuos</strong><br>Lun a Sáb 20hs (Húmedos)</strong><br>Jueves 14hs (Reciclables)`,
    
    // --- TRÁMITES Y SERVICIOS MUNICIPALES --- //

    'hac_tomasa': `<div class="info-card"><strong>🌾 TOMASA:</b><br>ℹ️ Portal de autogestión.<br>🔗 <a href="https://tomasa.chascomus.gob.ar/">INGRESAR</a>`,
    'boleta': `<div class="info-card"><strong>📧 BOLETA DIGITAL</strong><br>🟢 <i>Para inscribirse comomunicarce por estas vias</a><br> 
    📲: <a href="https://wa.me/5492241557616">2241-557616</a><br>📧 <a href="mailto:ingresospublicos@chascomus.gob.ar">Email</a></div>`,
    'agua': `<div class="info-card"><strong>💧 CONSUMO DE AGUA</strong><br> ℹ️ Para conocer y pagar su consumo ingrese a este Link</b><br>
    🔗 <a href="https://apps.chascomus.gob.ar/caudalimetros/consulta.php">VER MI CONSUMO</a>`, 
    'deuda': `<div class="info-card"><strong>🔍 CONSULTA DE DEUDA</strong><br>💸 Para ver sus inpuesto Inmobiliarios, Automotores, etc;.<br>
    🔗 <a href="https://chascomus.gob.ar/municipio/estaticas/consultaDeudas">CONSULTAR AQUÍ</a>`,
     
    /* --- HABILITACIÓN COMERCIAL / INDUSTRIAL GENERAL --- */
    'hab_gral': `
    <div class="info-card">
        <strong>🏢 Habilitación Comercial / Industrial</strong><br><br>
        <i>Para comercios, industrias y servicios.</i><br><br>
        📋 <b>Requisitos Principales:</b><br>
        • DNI (Mayor de 21 años).<br>
        • Constancia CUIT e IIBB.<br>
        • Título Propiedad/Alquiler (Firmas certificadas).<br>
        • Libre deuda Tasas Municipales.<br>
        • Certificado Urbanístico.<br><br>
        📍 <b>Presencial:</b> Maipú 415 (Producción).<br><br>
        🚀 <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionComercial.php" target="_blank" class="wa-btn">INICIAR TRÁMITE ONLINE</a>
    </div>`,

     'hab_video_info': `
    <div class="info-card">
        <strong>🎥 Guía de Habilitaciones</strong><br><br>
        <video width="100%" height="auto" controls style="border-radius: 8px; border: 1px solid #ddd;">
            <source src="videos/tutorial_habilitacion.mp4" type="video/mp4">
            Tu navegador no soporta el video.
        </video>
        <br><br>
        <p style="font-size: 0.85rem; color: #555;">
            Mirá este breve tutorial sobre cómo iniciar tu trámite de habilitación comercial 100% online.
        </p>
    </div>`,
    /* --- HABILITACIÓN EVENTOS Y ESPACIO PÚBLICO --- */
    'hab_eventos': `
    <div class="info-card">
        <strong>🎉 Eventos y Salones de Fiesta</strong><br>
        <i>Regulado por Ord. 5660, 5672 y 5923.</i><br><br>
        ⚠️ <b>Plazos:</b><br>
        Solicitar con <b>10 días hábiles</b> de anticipación.<br><br>
        🚒 <b>Requisito Bomberos:</b><br>
        Se exige certificado final de obra (Bomberos Dolores).<br>
        📧 tecnica_dolores@hotmail.com<br>
        📞 (02245) 44-6107<br><br>
        📝 <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionEventoPrivado2.0.php" target="_blank">IR AL FORMULARIO</a>
    </div>`,

    /* --- HABILITACIÓN ESPACIO PÚBLICO (FOODTRUCKS Y PATIOS) --- */
    'hab_espacio': `
    <div class="info-card">
        <strong>🍔 Uso de Espacio Público</strong><br>
        <i>Patios gastronómicos y Foodtrucks.</i><br><br>
        📋 <b>Requisitos:</b><br>
        • DNI y CUIT del titular.<br>
        • Curso manipulación de alimentos (todo el personal).<br>
        • Título del vehículo/carro.<br>
        • Seguros (Vehículo + Responsabilidad Civil).<br>
        • Domicilio en Chascomús.<br><br>
        📝 <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionCarro.php" target="_blank">SOLICITAR PERMISO</a>
    </div>`,

    /* --- HABILITACIÓN REBA (REGISTRO DE ALCOHOL) --- */
  'hab_reba': `
    <div class="info-card">
        <strong>🍷 Registro de Alcohol (REBA)</strong><br><br>
        Obligatorio para comercializar bebidas alcohólicas.<br><br>
        📲 <b>WhatsApp HABILITACIONES:</b><br>
        <a href="https://wa.me/5492241559389" class="wa-btn" style="background-color:#25D366 !important; text-align:center;">💬 2241-559389</a><br>
        <small><i>⚠️ Solo mensajes escritos o audios. No llamadas.</i></small><br><br>
        📧 <b>Por Email:</b><br>
        Solicitalo a <a href="mailto:habilitaciones@chascomus.gob.ar">habilitaciones@chascomus.gob.ar</a><br><br>
        🏦 <b>Pago:</b> Recibirás una boleta para abonar en Banco Provincia.
    </div>`,
    
    /* --- RESPUESTAS HOSPITAL MUNICIPAL --- */
    'h_turnos': `
    <div class="info-card">
        <strong>📅 Turnos Hospital</strong><br>WhatsApp: <a href="https://wa.me/5492241466977">📲 2241-466977</a>`,
    'h_info':  `
    <div class="info-card">
        <strong>📍 <b>Hospital Municipal:</b> Av. Alfonsín e Yrigoyen.<br>🚨 Guardia 24 hs.`,
    
    /* --- ESPECIALIDADES HOSPITAL (NUEVO ORDEN: Especialidad -> Día) --- */
    'info_pediatria': `
    <div class="info-card">
        <strong>👶 Pediatría</strong><br>
        <i>Atención en Consultorios Externos</i><br><br>
        📅 <b>Días:</b> Lunes, Martes y Jueves.<br><br>
        👇 <i>Sacá turno por WhatsApp:</i>
        <a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SOLICITAR TURNO</a>
    </div>`,

    'info_clinica': `
    <div class="info-card">
        <strong>🩺 Clínica Médica</strong><br><br>
        📅 <b>Días:</b> Lunes, Miércoles y Viernes.<br><br>
        👇 <i>Sacá turno por WhatsApp:</i>
        <a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SOLICITAR TURNO</a>
    </div>`,

    'info_gineco': `
    <div class="info-card">
        <strong>🤰 Salud de la Mujer</strong><br><br>
        🔹 <b>Ginecología:</b> Lunes.<br>
        🔹 <b>Obstetricia:</b> Miércoles.<br><br>
        👇 <i>Sacá turno por WhatsApp:</i>
        <a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SOLICITAR TURNO</a>
    </div>`,

    'info_cardio': `
    <div class="info-card">
        <strong>❤️ Cardiología</strong><br><br>
        📅 <b>Días:</b> Martes.<br><br>
        👇 <i>Sacá turno por WhatsApp:</i>
        <a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SOLICITAR TURNO</a>
    </div>`,

    'info_trauma': `
    <div class="info-card">
        <strong>🦴 Traumatología</strong><br><br>
        📅 <b>Días:</b> Martes.<br><br>
        👇 <i>Sacá turno por WhatsApp:</i>
        <a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SOLICITAR TURNO</a>
    </div>`,

    'info_oftalmo': `
    <div class="info-card">
        <strong>👁️ Oftalmología</strong><br><br>
        📅 <b>Días:</b> Miércoles.<br><br>
        👇 <i>Sacá turno por WhatsApp:</i>
        <a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SOLICITAR TURNO</a>
    </div>`,

    'info_nutri': `
    <div class="info-card">
        <strong>🍎 Nutrición</strong><br><br>
        📅 <b>Días:</b> Jueves.<br><br>
        👇 <i>Sacá turno por WhatsApp:</i>
        <a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SOLICITAR TURNO</a>
    </div>`,

    'info_cirugia': `
    <div class="info-card">
        <strong>🔪 Cirugía General</strong><br><br>
        📅 <b>Días:</b> Jueves.<br><br>
        👇 <i>Sacá turno por WhatsApp:</i>
        <a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SOLICITAR TURNO</a>
    </div>`,

    'info_neuro_psiq': `
    <div class="info-card">
        <strong>🧠 Salud Mental y Neurología</strong><br><br>
        🔹 <b>Neurología:</b> Viernes.<br>
        🔹 <b>Psiquiatría:</b> Viernes.<br><br>
        👇 <i>Sacá turno por WhatsApp:</i>
        <a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SOLICITAR TURNO</a>
    </div>`,
    
    // Respuestas Dirección de Producción
    /* 🟢 ECONOMÍA SOCIAL */
    'res_compre_chascomus': `
    <div class="info-card">
        <strong>🤝 Compre Chascomús - Producción Local</strong><br><br>
        Vinculamos a la economía social con comerciantes locales (Micro, Pequeños y Grandes) con habilitación.<br><br>
        📋 <b>Requisitos para inscripción:</b><br>
        Tener foto de: AFIP, ARBA, Habilitación Municipal y DNI.<br><br>
        👇 <i>Completá el formulario y la Dirección de Producción te contactará:</i><br>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSfa4LPccR6dYwkQFWhG31HELnaKMCSgUF7Jqy1xfiSNR_fA_g/viewform" target="_blank" class="wa-btn">📝 FORMULARIO DE INSCRIPCIÓN</a>
    </div>`,

/* 🟡 PRODUCCIÓN AGROPECUARIA */
    'res_prod_frescos': `
    <div class="info-card">
        <strong>🥦 Orientación Productores Alimentos Frescos</strong><br><br>
        Para productores de alimentos agroecológicos, agricultura familiar, cooperativas y PyMEs de Chascomús.<br><br>
        <i>Acompañamos el desarrollo de tu unidad económica.</i><br><br>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSeMzImHt14uXF4ZSk3wiJEqfxK4U2Tw9bSJrJXaKGLv5kLGew/closedform" target="_blank" class="wa-btn">📝 FORMULARIO PRODUCTORES</a>
    </div>`,

    /* 🔵 OFICINA DE EMPLEO */
    'res_oe_inscripcion': `
    <div class="info-card">
        <strong>📝 Inscripción / Actualización Laboral</strong><br><br>
        Para mayores de 18 años residentes en Chascomús en búsqueda activa.<br><br>
        1. Completá el formulario con tus datos y perfil.<br>
        2. Te contactaremos (Lun a Vie 8 a 14hs) para una entrevista y asesoramiento.<br><br>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSfl7uzaIU0u8G-S3uTjtddZl7y4o5jajZUzNuftZEyfqPdDKg/viewform" target="_blank" class="wa-btn">📝 CARGAR MI CV / DATOS</a>
    </div>`,

    /* 🟣 OFICINA DE EMPLEO - PROGRAMAS */
    'res_oe_promover': `
    <div class="info-card">
        <strong>♿ Programa Nacional Promover</strong><br><br>
        Para mayores de 18 años desempleados que posean <b>Certificado Único de Discapacidad (CUD)</b>.<br><br>
        Ofrece formación, capacitación y acompañamiento en el perfil laboral.<br><br>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdGoPi4Xmg0zD2VtBzTr1sFol1QtLAM5G0oDA6vExM_cvIYbQ/viewform" target="_blank" class="wa-btn">📝 INSCRIPCIÓN PROMOVER</a>
    </div>`,

    /* 🟣 OFICINA DE EMPLEO - TALLERES */
    'res_oe_taller_cv': `
    <div class="info-card">
        <strong>📄 Armado de CV y Búsqueda de Empleo</strong><br><br>
        ¿No sabés por dónde empezar a buscar trabajo? ¿Querés mejorar tu Currículum?<br><br>
        Te ofrecemos información y estrategias para tener la mejor herramienta de presentación.<br><br>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdQkEPZZx7gXZXO9vAb7u3Klxj8g5cwSe1fXqz6Zmo4jjMNBg/viewform" target="_blank" class="wa-btn">📝 INSCRIBIRSE AL TALLER</a>
    </div>`,

    /* 🟠 EMPRESAS */

    'res_emp_chasco': `
    <div class="info-card">
        <strong>🚀 Programa Chascomús Emprende</strong><br><br>
        Objetivo: Fortalecer y acompañar unidades productivas.<br><br>
        Al completar el formulario, ingresás al listado para coordinar una entrevista de diagnóstico y orientación.<br><br>
        <a href="https://uploads.chascomus.gob.ar/produccion/PROGRAMA%20CHASCOMUS%20EMPRENDE.pdf" target="_blank" class="wa-btn">📝 INSCRIPCIÓN EMPRENDEDORES</a>
    </div>`,

    /* 🟣 EMPLEADORES */
    'res_empl_busqueda': `
    <div class="info-card">
        <strong>🔎 Búsqueda de Personal</strong><br><br>
        Si sos empleador, completá el formulario describiendo el puesto.<br><br>
        ✅ La Dirección de Producción realizará una preselección y te presentará una <b>terna final de candidatos</b>.<br><br>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdOeVRsshYtc8JF-sTXyEqQgJl2hyTbxyfDPb0G7SsiGBMj_g/viewform" target="_blank" class="wa-btn">📝 PUBLICAR PUESTO</a>
    </div>`,

    /* 🟣 EMPLEADORES - EMPRESAS MADRINAS */
    'res_empl_madrinas': `
    <div class="info-card">
        <strong>🤝 Programa Formando Red - Empresas Madrinas</strong><br><br>
        Vinculamos empresas con compromiso social que deseen capacitar a futuros trabajadores, favoreciendo la igualdad de oportunidades.<br><br>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSe7SA_eKKQw-EDuFU9pDBIE_nUjzLOX6AZrHI_KfO3bwufVSA/viewform" target="_blank" class="wa-btn">📝 QUIERO SER EMPRESA MADRINA</a>
    </div>`,

    /* 🔴 MANIPULACIÓN */
    'res_manipulacion': `
    <div class="info-card">
        <strong>🔴 Carnet de Manipulación de Alimentos</strong><br><br>
        Obligatorio (Código Alimentario Argentino) para quien elabore, transporte o comercialice alimentos.<br><br>
        ✅ <b>Validez:</b> 3 años (Nacional).<br>
        🎓 <b>Requisito:</b> Aprobar el Curso de Manipulación Segura.<br><br>
        <i>Modalidad presencial (y próximamente virtual).</i><br><br>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSctX7eGQxBNei5howcIjXhIzlBTKQQb_RIBImnKXjVPvIVrvw/closedform" target="_blank" class="wa-btn">📝 INSCRIPCIÓN AL CURSO</a>
    </div>`,

    /* 🔴 CONTACTO PRODUCCIÓN */
     'prod_contacto': `
    <div class="info-card">
        <strong>📍 Dirección de Producción</strong><br><br>
        📍 <b>Dirección:</b> Maipú 415, Chascomús.<br>
        📞 <b>Teléfonos:</b> <a href="tel:02241436365">43-6365</a> / <a href="tel:02241430841">43-0841</a><br>
        📧 <a href="mailto:produccion@chascomus.gob.ar">produccion@chascomus.gob.ar</a><br><br>
        ℹ️ <b>Atención:</b><br>
        Orientación a productores de alimentos frescos, PYMES y cooperativas, impulsando la economía social y la agricultura familiar.
    </div>`,

    /* ☎️ CONTACTO GENERAL MUNICIPAL --- */
        'contacto_gral': `<div class="info-card">
    <strong>🏛️ Contacto Municipalidad</strong><br>
    <i>Canales de atención directa:</i><br><br>
    📞 <b>Teléfono Fijo (Conmutador):</b><br>
    Atención de 7:30 a 13:30 hs.<br>
    <a href="tel:02241431341" class="wa-btn" style="background-color: #004a7c !important; text-align:center;">📞 LLAMAR AL 43-1341</a><br>
    
    📲 <b>WhatsApp Operador:</b><br>
    Consultas y reclamos.<br>
    <a href="https://wa.me/5492241000000" class="wa-btn" style="text-align:center;">💬 CHATEAR AHORA</a><br>
    
    📍 <b>Mesa de Entradas:</b><br>
    Cr. Cramer 270.</div>`
};

/* --- LÓGICA DE INTERFAZ Y NAVEGACIÓN --- */

function toggleInfo() {
    const modal = document.getElementById('infoModal');
    modal.classList.toggle('show');
}

window.onclick = function(event) {
    const modal = document.getElementById('infoModal');
    if (event.target == modal) {
        modal.classList.remove('show');
    }
}

function toggleInput(show) { 
    const inputBar = document.getElementById('inputBar');
    if (inputBar) {
        inputBar.classList.toggle('hidden', !show);
        if(show) setTimeout(() => document.getElementById('userInput').focus(), 100);
    }
}

function addMessage(text, side = 'bot', options = null) {
    const container = document.getElementById('chatContainer');
    const row = document.createElement('div');
    row.style.width = '100%';
    row.style.display = 'flex';
    row.style.flexDirection = 'column';
    
    const div = document.createElement('div');
    div.className = `message ${side}`;
    div.innerHTML = text;
    row.appendChild(div);

    if (options) {
        const optDiv = document.createElement('div');
        optDiv.className = 'options-container';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = `option-button ${opt.id === 'back' ? 'back' : ''}`;
            btn.innerText = opt.label;
            btn.onclick = () => handleAction(opt);
            optDiv.appendChild(btn);
        });
        row.appendChild(optDiv);
    }
    
    container.appendChild(row);
    
    // Scroll actualizado para Flexbox (evita que se tape el contenido)
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
    
    // Scroll adicional si hay botones para asegurar que sean visibles
    if (options) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 300);
    }
}

/* --- FRASES DE RESPUESTA POSITIVA --- */
const FRASES_RESPUESTA = [
    "¡Qué gran elección! 🎯",
    "¡Excelente selección! ⭐",
    "¡Perfecto! Esa es una opción muy buena 👍",
    "¡Muy bien! Ahí vamos... 🚀",
    "¡Genial! Te ayudo con eso 😊",
    "¡Perfecta elección! 💯",
    "¡Buena opción! Vamos a ver... 🔍",
    "¡Eso me gusta! Procedamos... 💪",
    "¡Fantástico! Un momento... ⏳",
    "¡Muy buena elección! 🌟",
    "¡Excelente! Vamos a ello... 🛠️",
    "¡Perfecto! Estoy en eso... 🤖",
    "¡Genial! Vamos a ver qué encontramos... 🔎",
    "¡Muy bien! Estoy trabajando en eso... ⚙️",
    "¡Buena elección! Vamos a ello... 🚀"
];

function getFraseAleatoria() {
    return FRASES_RESPUESTA[Math.floor(Math.random() * FRASES_RESPUESTA.length)];
}

function handleAction(opt) {
    // --- NUEVO: REGISTRO DE CLICK ---
    registrarEvento("Click Botón", opt.label || opt.id);
    // --------------------------------

    if (opt.id === 'nav_home') return resetToMain();
    
    if (opt.id === 'nav_back') {
        if (currentPath.length > 1) {
            currentPath.pop();
            showMenu(currentPath[currentPath.length - 1]);
        } else {
            showMenu('main');
        }
        return;
    }

    if (opt.id === 'back') {
        if (currentPath.length > 1) {
            currentPath.pop();
            showMenu(currentPath[currentPath.length - 1]);
        } else {
            showMenu('main');
        }
        return;
    }

    if (opt.link) {
        window.open(opt.link, '_blank');
        return;
    }

    addMessage(opt.label, 'user');

    if (opt.type === 'form_147') {
        startReclamoForm();
        return;
    }

    if (opt.type === 'leaf' || opt.apiKey) {
        const content = RES[opt.apiKey] || "Información no disponible.";
        const frase = getFraseAleatoria();
        setTimeout(() => {
            addMessage(frase, 'bot');
            setTimeout(() => {
                addMessage(content, 'bot');
                showNavControls(); 
            }, 600);
        }, 400);
        return;
    }

    if (MENUS[opt.id]) {
        const frase = getFraseAleatoria();
        setTimeout(() => {
            addMessage(frase, 'bot');
            setTimeout(() => {
                currentPath.push(opt.id);
                showMenu(opt.id);
            }, 500);
        }, 300);
    }
}

function showMenu(key) {
    const menu = MENUS[key];
    const title = typeof menu.title === 'function' ? menu.title(userName) : menu.title;
    
    let opts = [...menu.options];
    if (currentPath.length > 1) opts.push({ id: 'back', label: '⬅️ Volver' });
    
    setTimeout(() => addMessage(title, 'bot', opts), 400);
}

function showNavControls() {
    const container = document.getElementById('chatContainer');
    const div = document.createElement('div');
    div.className = 'nav-controls';
    
    div.innerHTML = `
        <button class="nav-btn btn-back" onclick="handleAction({id:'nav_back'})">⬅ Volver</button>
        <button class="nav-btn btn-home" onclick="handleAction({id:'nav_home'})">🏠 Inicio</button>
    `;
    container.appendChild(div);
    
    // Scroll actualizado para botones de navegación
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

/* --- FORMULARIO 147 --- */
function startReclamoForm() {
    isAwaitingForm = true;
    currentFormStep = 1;
    toggleInput(true); 
    setTimeout(() => addMessage("📝 <b>Paso 1/3:</b> ¿Qué tipo de problema es? (Ej: Luminaria, Basura)", 'bot'), 500);
}

function processFormStep(text) {
    if (currentFormStep === 1) {
        formData.tipo = text;
        currentFormStep = 2;
        setTimeout(() => addMessage("📍 <b>Paso 2/3:</b> ¿Cuál es la dirección exacta?", 'bot'), 500);
    } else if (currentFormStep === 2) {
        formData.ubicacion = text;
        currentFormStep = 3;
        setTimeout(() => addMessage("🖊️ <b>Paso 3/3:</b> Breve descripción del problema.", 'bot'), 500);
        formData.descripcion = text;
    } else if (currentFormStep === 3) {
         setTimeout(() => addMessage("🖊️ <b>Paso 4/4:</b> Si puede adjunte una foto o archivo.", 'bot'), 500);
    } else if (currentFormStep === 4) {
        formData.descripcion = text;
        finalizeForm();
    }
}

function finalizeForm() {
    isAwaitingForm = false;
    toggleInput(false);
    const tel147 = "5492241514700"; 
    
    const msg = `🏛️ *RECLAMO 147* 🏛️\n👤 *Vecino:* ${userName}\n🏷️ *Tipo:* ${formData.tipo}\n📍 *Ubicación:* ${formData.ubicacion}\n📝 *Desc:* ${formData.descripcion}`;
    const url = `https://wa.me/${tel147}?text=${encodeURIComponent(msg)}`;
    
    const cardHtml = `
        <div class="info-card">
            ✅ <strong>Datos Listos</strong><br>
            Presioná abajo para enviar el reporte oficial.
            <a href="${url}" target="_blank" class="wa-btn">📲 ENVIAR RECLAMO</a>
        </div>`;
        
    addMessage(cardHtml, 'bot');
    showNavControls();
}

/* --- LÓGICA DE INICIO --- */
function processInput() {
    const input = document.getElementById('userInput');
    const val = input.value.trim();
    if(!val) return;
    
    // --- NUEVO: REGISTRO DE TEXTO ---
    registrarEvento("Consulta Escrita", val);
    // --------------------------------

    const texto = val.toLowerCase();

    /* --- 🔒 COMANDO SECRETO DE AUTOR --- */
    if (texto === 'autor' || texto === 'creador') {
        const firma = `
        <div class="info-card" style="border-left: 5px solid #000; background: #fff;">
            👨‍💻 <b>Desarrollo Original</b><br><br>
            Este sistema fue diseñado y programado por:<br>
            <b>Federico de Sistemas</b><br>
            <i>Municipalidad de Chascomús</i><br>
            © 2026 - Todos los derechos reservados.
        </div>`;
        addMessage(val, 'user');
        setTimeout(() => addMessage(firma, 'bot'), 500);
        input.value = "";
        return;
    }

    /* --- LÓGICA DE FORMULARIOS --- */
    if (isAwaitingForm) {
        addMessage(val, 'user');
        input.value = "";
        processFormStep(val);
        return;
    }

 /* --- PRIMER INGRESO (NOMBRE) --- */
    if (!userName) {
        addMessage(val, 'user');
        userName = val;
        localStorage.setItem('muni_user_name', val);
        input.value = "";
        
        setTimeout(() => {
            addMessage(`¡Mucho gusto, <b>${userName}</b>! 👋 Soy MuniBot, el asistente virtual de Municipalidad de Chascomús. ¿En que puedo ayudarte?
        Puedes escribir frases que tengan palabras clave como "casa, agua, foodtruck, caps".
        Te doy un ej; "Como habilito mi local", "puedo ver mi consumo de agua", etc.
        O simplemente la palabra "MENU" para ver todo 🤖`, 'bot');
            
            const atajos = [
                { id: 'oea_link', label: '👀 Ojos en Alerta', type: 'leaf', apiKey: 'ojos_en_alerta' },
                { id: 'ag_actual', label: '🎭 Agenda Cultural', type: 'leaf', apiKey: 'agenda_actual' },
                { id: 'f_lista', label: '💊 Farmacias de Turno', type: 'leaf', apiKey: 'farmacias_lista' },
                { id: 'h_tur', label: '📅 Turnos Hospital', type: 'leaf', apiKey: 'h_turnos' },
                { id: 'nav_home', label: '☰ VER MENÚ COMPLETO' }
            ];

            addMessage(`Acá tenés algunos accesos rápidos para empezar, o podés escribir <b>"Menú"</b> para ver todo:`, 'bot', atajos);
        }, 600);
        return;
    }

    addMessage(val, 'user');
    input.value = "";

    /* --- 🧠 CEREBRO DE RESPUESTAS RÁPIDAS --- */
    
    // 1. SALUDOS
    if (['hola', 'buen dia', 'buenas', 'que tal'].some(palabra => texto.includes(palabra))) {
        setTimeout(() => addMessage(`¡Hola <b>${userName}</b>! 👋 Qué gusto saludarte. ¿En qué te puedo ayudar hoy? Seleccioná una opción del menú.`, 'bot'), 600);
        return;
    }

    // 2. AGRADECIMIENTOS
    if (['gracias', 'muchas gracias', 'genial', 'excelente' , '👍🏽' , '👌🏼'].some(palabra => texto.includes(palabra))) {
        setTimeout(() => addMessage("¡De nada! Es un placer ayudarte. 😊", 'bot'), 600);
        return;
    }

    // 3. PEDIDO DE AYUDA / MENÚ
    if (['ayuda', 'menu', 'menú', 'inicio', 'botones', 'opciones', "me ayudas", "ayudame"].some(palabra => texto.includes(palabra))) {
        setTimeout(() => {
            addMessage("¡Entendido! Acá tenés el menú principal:", 'bot');
            resetToMain();
        }, 600);
        return;
    }

    // 4. INSULTOS (Filtro de educación)
    if (['boludo', 'tonto', 'inutil', 'mierda', 'puto' , 'forro' , 'estupido' , 'tarado'].some(palabra => texto.includes(palabra))) {
        setTimeout(() => addMessage("Por favor, mantengamos el respeto. Soy un robot intentando ayudar. 🤖💔", 'bot'), 600);
        return;
    }

    /* --- 5. BUSCADOR INTELIGENTE (SUPER CEREBRO 🧠) --- */
    
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
        'turismo':    { id: 'turismo', label: '🏖️ Turismo' },            
        'reba':       { type: 'leaf', apiKey: 'hab_reba', label: '🍷 REBA' },
        'alcohol':    { type: 'leaf', apiKey: 'hab_reba', label: '🍷 REBA' },
        'licencia':   { type: 'leaf', apiKey: 'lic_turno', label: '🪪 Licencias' },
        'carnet':     { type: 'leaf', apiKey: 'lic_turno', label: '🪪 Licencias' },
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
    
    for (let palabra in diccionario) {
        if (texto.includes(palabra)) { 
            const accion = diccionario[palabra];
            setTimeout(() => {
                addMessage(`¡Encontré esto sobre tu consulta <b>"${palabra.toUpperCase()}"</b>! 👇`, 'bot');
                handleAction(accion);
            }, 600);
            return;
        }
    }
    
    /* --- RESPUESTA POR DEFECTO --- */
    setTimeout(() => addMessage("No entendí tu mensaje. 🤔<br>Por favor, <b>utilizá los botones del menú</b> para navegar o escribí 'Ayuda' para volver al inicio.", 'bot'), 600);
}

function resetToMain() {
    currentPath = ['main'];
    showMenu('main');
}

function clearSession() {
    if(confirm("¿Cerrar sesión y borrar nombre?")) {
        localStorage.removeItem('muni_user_name');
        location.reload();
    }
}

// Event listeners
document.getElementById('sendButton').onclick = processInput;
document.getElementById('userInput').onkeypress = (e) => { if(e.key === 'Enter') processInput(); };

window.onload = () => {
    if (!userName) {
        addMessage("👋 Bienvenido al asistente de Chascomús.<br>Para comenzar, por favor <b>ingresá tu nombre</b>:", 'bot');
        toggleInput(true);
    } else {
        showMenu('main');
    }
};

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { 
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registrado:', reg))
            .catch(err => console.log('SW error:', err));
    });
}

// Objeto app para funciones globales
const app = {
    toggleInfo: toggleInfo,
    clearSession: clearSession
};

/* --- Mensaje en consola --- */
console.log("%c⛔ DETENTE", "color: red; font-size: 40px; font-weight: bold;");
console.log("%cEste código es propiedad intelectual de la Municipalidad de Chascomús.", "font-size: 16px; color: #004a7c;");
console.log("%cSi alguien te indicó que pegues algo aquí, es una estafa para robarte información o dinero.", "font-size: 14px; color: #000;");
console.log("%cSi sos desarrollador, podés contactarte con Federico de Sistemas para colaborar en proyectos oficiales.", "font-size: 14px; color: #000;");














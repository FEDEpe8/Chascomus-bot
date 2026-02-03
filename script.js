/* --- CONFIGURACIÓN --- */
let userName = localStorage.getItem('muni_user_name') || "";
let currentPath = ['main'];
let isAwaitingForm = false;
let currentFormStep = 0;
let formData = { tipo: "", ubicacion: "", descripcion: "" };

/* --- MENÚS --- */
const MENUS = {
    main: { 
        title: (name) => `¡Hola <b>${name}</b>! 👋 Soy Eva la asistente virtual de Municipalidad de Chascomús. ¿En que pudedo ayudarte?, 
        Podes usar el meno o escribrir palabras claves.
        Aqui te dejo algunas, agua, foodtruck, casa;
        o escribe menu para ver todo.`, 
        options: [
            { id: 'politicas_gen', label: '💜 GÉNERO (Urgencias)', type: 'leaf', apiKey: 'politicas_gen' },
            { id: 'politicas_comu', label: '🛍️ Módulos (alimentos)', type: 'leaf', apiKey: 'asistencia_social' },
            { id: 'desarrollo_menu', label: '🤝 Desarrollo Social' },
            { id: 'turismo', label: '🏖️ Turismo' },
            { id: 'deportes', label: '⚽ Deportes' },
            { id: 'salud', label: '🏥 Salud' },
            { id: 'obras', label: '🚧 Reclamos 147' },
            { id: 'seguridad', label: '🛡️ Seguridad' },
            { id: 'produccion', label: '🏭 Producción y Empleo' },
            { id: 'habilitaciones', label: '💰 Habilitaciones' },
            { id: 'omic', label: '🏦 Denuncias Omic' },
            { id: 'cultura', label: '🎭 Cultura y Agenda', type: 'submenu' },
            { id: 'habitat', label: '🏡 Reg demanda Habitacional', type: 'submenu' },
            { id: 'contacto_op', label: '☎️ Hablar con Operador', type: 'leaf', apiKey: 'contacto_gral' },
            // CORREGIDO: Ahora es tipo submenu para que abra las opciones de pago
            { id: 'pago_deuda', label: '🅿️ Pago: Auto, Agua, Inmueble', type: 'submenu' }
        ]
    },
    cultura: {
        title: () => '🎭 Agenda Cultural:',
        options: [
            { id: 'ag_actual', label: '📅 Agenda del Mes (FEBRERO)', type: 'leaf', apiKey: 'agenda_actual' },
            { id: 'ag_drive', label: '📂 Ver programación anual (Drive)', link: 'https://drive.google.com/drive/folders/1VgidPwJ_Hg-n_ECGj5KzLlM-58OEdJBP' }
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
            { id: 'ojos', label: '👁️ Ojos en Alerta', type: 'leaf', apiKey: 'ojos' },
            { id: 'poli', label: '📞 Comisaría', type: 'leaf', apiKey: 'poli' }
        ]
    },
    habilitaciones: { 
        title: () => 'Hacienda, Tasas y Producción:', 
        options: [
            { id: 'hab_menu', label: '🏬 Habilitaciones (Menú)', type: 'submenu' }, 
            { id: 'toma', label: '🤖 Hacienda Tomasa', type: 'leaf', apiKey: 'hac_tomasa' }
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
        title: () => 'Producción y Empleo:',
        options: [
            { id: 'prod_empleo', label: '👷 Oficina de Empleo', type: 'leaf', apiKey: 'prod_empleo' },
            { id: 'prod_emprende', label: '🚀 Emprendedores (PUPAAs)', type: 'leaf', apiKey: 'prod_emprende' },
            { id: 'prod_contacto', label: '📍 Contacto y Dirección', type: 'leaf', apiKey: 'prod_contacto' }
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
        Nombre, DNI, Teléfono y Dirección del problema.
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

    'mediacion_info': `<div class="info-card"><strong>⚖️ Mediación Comunitaria</strong><br>Resolución pacífica y gratuita de conflictos vecinales (ruidos, mascotas, edilicios).<br>📍 <b>Acercate a:</b> Moreno 259.</div>`,
    'uda_info': `<div class="info-card"><strong>📍 Puntos UDA (Atención en Barrios)</strong><br><i>Acercate a tu punto más cercano:</i><br><br>🔹 <b>UDA 1 (San Luis):</b> Chubut 755 (Mar/Vie 9-12).<br>🔹 <b>UDA 2 (San José Obrero):</b> F. Chapa 625 (Mar/Vie 9-12).<br>🔹 <b>UDA 3 (El Porteño):</b> Mansilla y Calle 3 (Vie 9-12).<br>🔹 <b>UDA 4 (30 de Mayo):</b> Bvd. 5 y Calle 2 (Vie 9-12).<br>🔹 <b>UDA 5 (B. Jardín):</b> J. Quintana e/ Misiones (Mar/Mié 9-12).<br>🔹 <b>UDA 6 (Gallo Blanco):</b> EE.UU. y Las Flores (Lun 9-12).<br>🔹 <b>UDA 7 (San Cayetano):</b> Comedor (Mar 9-12).<br>🔹 <b>UDA 8 (Políticas Com.):</b> Sarmiento 42 (Lun-Vie 8-12).<br>🔹 <b>UDA 9 (Iporá):</b> Perú y S. Cabral (Jue 9-12).<br><br>🚨 <b>Guardia 24hs:</b> <a href="https://wa.me/5492241559397">2241-559397</a></div>`,
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
    'ojos': `👁️ <b>Ojos en Alerta:</b> <a href="https://wa.me/5492241557444">2241-557444</a>`,
    'poli': `📞 <b>Policía:</b> 42-2222 | 🎥 <b>COM:</b> 43-1333`,
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
        <a href="https://wa.me/5492241559397" target="_blank" class="wa-btn" style="background-color: #d35400 !important;">
            📲 Consultar Cronograma (WhatsApp)
        </a>
    </div>`,
    
    'ninez': `<b>👶 Niñez:</b> Mendoza Nº 95. 📞 43-1146.`,
    'poda': `🌿 <a href="https://apps.chascomus.gob.ar/podaresponsable/solicitud.php">Solicitud Poda</a>`,
    'obras_basura': `♻️ <b>Recolección:</b><br>Lun a Sáb 20hs (Húmedos)<br>Jueves 14hs (Reciclables)`,
    
    'hac_tomasa': `<b>🤖 Hacienda Tomasa:</b><br>Portal de autogestión.<br>🔗 <a href="https://tomasa.chascomus.gob.ar/">INGRESAR</a>`, 


    'boleta': `<div class="info-card"><strong>📧 BOLETA DIGITAL</strong><br>🟢 WA: <a href="https://wa.me/5492241559739">2241-559739</a><br>📧 <a href="mailto:ingresospublicos@chascomus.gob.ar">Email</a></div>`,
    'agua': `<b>💧 Consumo de Agua:</b><br>🔗 <a href="https://apps.chascomus.gob.ar/caudalimetros/consulta.php">VER MI CONSUMO</a>`, 
    'deuda': `<b>🔍 Consulta de Deuda:</b><br>🔗 <a href="https://chascomus.gob.ar/municipio/estaticas/consultaDeudas">CONSULTAR AQUÍ</a>`,
    
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
    
    'h_turnos': `<strong>📅 Turnos Hospital:</strong><br>WhatsApp: <a href="https://wa.me/5492241466977">2241-466977</a>`,
    'h_info': `📍 <b>Hospital Municipal:</b> Av. Alfonsín e Yrigoyen.<br>🚨 Guardia 24 hs.`,
    
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
    
    'prod_empleo': `
    <div class="info-card">
        <strong>👷 Oficina de Empleo</strong><br><br>
        Intermediación laboral y programas de capacitación.<br><br>
        📋 <b>Servicios:</b><br>
        • Bolsa de trabajo.<br>
        • Programa "Jóvenes con Más y Mejor Trabajo".<br>
        • Entrenamientos laborales.<br><br>
        📍 <b>Sede:</b> Maipú 415.<br>
        ⏰ <b>Horario:</b> Lun a Vie de 8 a 13 hs.
    </div>`,

    'prod_emprende': `
    <div class="info-card">
        <strong>🚀 Chascomús Emprende</strong><br><br>
        Apoyo a emprendedores y productores locales.<br><br>
        🍞 <b>PUPAAs:</b><br>
        Registro de Pequeñas Unidades Productivas de Alimentos Artesanales.<br><br>
        🤝 <b>Compre Chascomús:</b><br>
        Fomento al consumo de productos locales.<br><br>
        📧 <b>Consultas:</b> <a href="mailto:produccion@chascomus.gob.ar">produccion@chascomus.gob.ar</a>
    </div>`,

    'prod_contacto': `
    <div class="info-card">
        <strong>🏭 Dirección de Producción</strong><br><br>
        📍 <b>Dirección:</b> Maipú 415.<br>
        📞 <b>Teléfono:</b> <a href="tel:02241436365">43-6365</a><br>
        📧 <b>Email:</b> <a href="mailto:produccion@chascomus.gob.ar">produccion@chascomus.gob.ar</a><br><br>
        ⏰ <b>Atención:</b> Lunes a Viernes de 8:00 a 13:30 hs.</div>`,

        'contacto_gral': `<div class="info-card">
    <strong>🏛️ Contacto Municipalidad</strong><br>
    <i>Canales de atención directa:</i><br><br>
    📞 <b>Teléfono Fijo (Conmutador):</b><br>
    Atención de 7:30 a 13:30 hs.<br>
    <a href="tel:02241431341" class="wa-btn" style="background-color: #004a7c !important; text-align:center;">📞 LLAMAR AL 43-1341</a><br>
    
    📲 <b>WhatsApp Operador:</b><br>
    Consultas y reclamos.<br>
    <a href="https://wa.me/5492241559397" class="wa-btn" style="text-align:center;">💬 CHATEAR AHORA</a><br>
    
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

// CORREGIDO: Función simplificada para solo poner foco, sin ocultar (Super Revisión)
function toggleInput(focus = false) { 
    if(focus) {
        setTimeout(() => {
            const input = document.getElementById('userInput');
            if(input) input.focus();
        }, 100);
    }
}

function addMessage(text, side = 'bot', options = null) {
    const container = document.getElementById('chatMessages');
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
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 100);
}

function handleAction(opt) {
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
        setTimeout(() => {
            addMessage(content, 'bot');
            showNavControls(); 
        }, 500);
        return;
    }

    if (MENUS[opt.id]) {
        currentPath.push(opt.id);
        showMenu(opt.id);
    }
}

function showMenu(key) {
    // toggleInput(false); // COMENTADO: Ya no ocultamos la barra
    const menu = MENUS[key];
    const title = typeof menu.title === 'function' ? menu.title(userName) : menu.title;
    
    let opts = [...menu.options];
    if (currentPath.length > 1) opts.push({ id: 'back', label: '⬅️ Volver' });
    
    setTimeout(() => addMessage(title, 'bot', opts), 400);
}

function showNavControls() {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'nav-controls';
    
    div.innerHTML = `
        <button class="nav-btn btn-back" onclick="handleAction({id:'nav_back'})">⬅ Volver</button>
        <button class="nav-btn btn-home" onclick="handleAction({id:'nav_home'})">🏠 Inicio</button>
    `;
    container.appendChild(div);
    
    // Pequeño delay para asegurar que el navegador renderizó el botón antes de scrollear
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 150);
}

/* --- FORMULARIO 147 --- */
function startReclamoForm() {
    isAwaitingForm = true;
    currentFormStep = 1;
    toggleInput(true); // Pone el foco para escribir
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
    } else if (currentFormStep === 3) {
        formData.descripcion = text;
        finalizeForm();
    }
}

function finalizeForm() {
    isAwaitingForm = false;
    // toggleInput(false); // Eliminado para no ocultar
    document.getElementById('userInput').blur(); // Solo bajamos el teclado
    
    const tel147 = "5492241559397"; 
    
    // CORREGIDO: Usamos encodeURIComponent para asegurar que el link funcione en todos los dispositivos
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

    // Normalizamos el texto (todo a minúsculas) para que entienda "Hola", "hola" o "HOLA"
    const texto = val.toLowerCase();

    /* --- 🔒 COMANDO SECRETO DE AUTOR --- */
    if (texto === 'autor' || texto === 'creador') {
        const firma = `
        <div class="info-card" style="border-left: 5px solid #000; background: #fff;">
            👨‍💻 <b>Desarrollo Original</b><br><br>
            Este sistema fue diseñado y programado por:<br>
            <b>Federico de Sistemas</b><br>
            <i>Municipalidad de Chascomús</i><br>
            © 2024 - Todos los derechos reservados.
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
            // 1. Saludo
            addMessage(`¡Mucho gusto, <b>${userName}</b>! Soy Eva, tu asistente virtual. 🤖`, 'bot');
            
            // 2. Definimos los botones de "Acceso Rápido"
            const atajos = [
                { id: 'ag_actual', label: '🎭 Agenda Cultural', type: 'leaf', apiKey: 'agenda_actual' },
                { id: 'f_lista', label: '💊 Farmacias de Turno', type: 'leaf', apiKey: 'farmacias_lista' },
                { id: 'h_tur', label: '📅 Turnos Hospital', type: 'leaf', apiKey: 'h_turnos' },
                { id: 'nav_home', label: '☰ VER MENÚ COMPLETO' } // Este lleva al menú principal
            ];

            // 3. Enviamos el mensaje CON los botones
            addMessage(`Acá tenés algunos accesos rápidos para empezar, o podés escribir <b>"Menú"</b> para ver todo:`, 'bot', atajos);
        }, 600);
        return;
    }

    // Mostramos lo que escribió el usuario
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
            resetToMain(); // <--- ESTO MUESTRA LOS BOTONES
        }, 600);
        return;
    }

    // 4. INSULTOS (Filtro de educación)
    if (['boludo', 'tonto', 'inutil', 'mierda', 'puto' , 'forro' , 'estupido'].some(palabra => texto.includes(palabra))) {
        setTimeout(() => addMessage("Por favor, mantengamos el respeto. Soy un robot intentando ayudar. 🤖💔", 'bot'), 600);
        return;
    }

    /* --- 5. BUSCADOR INTELIGENTE (SUPER CEREBRO 🧠) --- */
    // Acá definimos qué palabra activa qué botón.
    
    const diccionario = {
        // PALABRA CLAVE      // QUÉ BOTÓN ACTIVA
        'farmacia':   { type: 'leaf', apiKey: 'farmacias_lista', label: '💊 Farmacias' },
        'agenda':     { type: 'leaf', apiKey: 'agenda_actual', label: '🎭 Agenda Cultural' },
        'cultural':   { type: 'leaf', apiKey: 'agenda_actual', label: '🎭 Agenda Cultural' },
        'teatro':     { type: 'leaf', apiKey: 'agenda_actual', label: '🎭 Agenda Cultural' },
        'turno':      { type: 'leaf', apiKey: 'h_turnos', label: '📅 Turnos Hospital' },
        'hospital':   { id: 'hospital_menu', label: '🏥 Menú Hospital' }, 
        '147':        { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'reclamo':    { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'luz':        { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'basura':     { type: 'leaf', apiKey: 'obras_basura', label: '♻️ Recolección' },
        'contenedor': { type: 'leaf', apiKey: 'obras_basura', label: '♻️ Recolección' },
        'reciclo':    { type: 'leaf', apiKey: 'obras_basura', label: '♻️ Recolección' },
        'poda':       { type: 'leaf', apiKey: 'poda', label: '🌿 Poda' },
        'deporte':    { id: 'deportes', label: '⚽ Deportes' },           
        'turismo':    { id: 'turismo', label: '🏖️ Turismo' },            
        'reba_hab':   { type: 'leaf', apiKey: 'hab_reba', label: '🍷 REBA' },
        'licencia':   { type: 'leaf', apiKey: 'lic_turno', label: '🪪 Licencias' },
        'carnet':     { type: 'leaf', apiKey: 'lic_turno', label: '🪪 Licencias' },
        'castracion': { type: 'leaf', apiKey: 'zoo_rabia', label: '🐾 Zoonosis' },
        'vacuna':     { type: 'leaf', apiKey: 'vacunacion_info', label: '💉 Vacunación' },
        'empleo':     { type: 'leaf', apiKey: 'prod_empleo', label: '👷 Empleo' },
        'emprende':   { id: 'produccion_menu', label: '👷 Producción y Empleo' }, 
        'caps':       { id: 'centros', label: '🏥 Caps' },
        'salud':      { id: 'salud', label: '🏥 Menú Salud' },         
        'seguridad':  { id: 'seguridad', label: '🛡️ Menú Seguridad' }, 
        'clima':      { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'reba':       { type: 'leaf', apiKey: 'hab_reba', label: '🍷 REBA' },
        'espacio':    { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'evento':     { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'fiesta':     { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'foodtruck':  { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'carro':      { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'local':      { type: 'leaf', apiKey: 'hab_gral', label: '🏢 Habilitación Comercial' },  
        'comercio':   { type: 'leaf', apiKey: 'hab_gral', label: '🏢 Habilitación Comercial' },
        // CORREGIDO: Claves arregladas para coincidir con RES (antes hac_agua y hac_boleta)
        'medidor':    { type: 'leaf', apiKey: 'agua', label: '💧 Consumo de Agua'  }, 
        'agua':       { type: 'leaf', apiKey: 'agua', label: '💧 Consumo de Agua'  }, 
        'boleta':     { type: 'leaf', apiKey: 'boleta', label: '📧 Boleta Digital' },
        'tomasa':     { type: 'leaf', apiKey: 'hac_tomasa', label: '📧 Tomasa' },
        'casa':       { type: 'leaf', apiKey: 'habitat_info', label: '🏢 Habilitación Habitacional'  }
    };
    
    // El bot revisa si alguna palabra clave está en lo que escribió el usuario
    for (let palabra in diccionario) {
        if (texto.includes(palabra)) { 
            const accion = diccionario[palabra];
            setTimeout(() => {
                addMessage(`¡Encontré esto sobre <b>"${palabra.toUpperCase()}"</b>! 👇`, 'bot');
                handleAction(accion); // <--- ESTO SIMULA EL CLIC AUTOMÁTICO
            }, 600);
            return; // Cortamos acá para que no siga buscando
        }
    }
    
    /* --- RESPUESTA POR DEFECTO (Si no entendió nada) --- */
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

document.getElementById('sendButton').onclick = processInput;
document.getElementById('userInput').onkeypress = (e) => { if(e.key === 'Enter') processInput(); };

window.onload = () => {
    if (!userName) {
        addMessage("👋 Bienvenido al asistente de Chascomús.<br>Para comenzar, por favor <b>ingresá tu nombre</b>:", 'bot');
        toggleInput(true); // Pone foco en el teclado
    } else {
        showMenu('main');
    }
};

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js'); });
}

/* --- 🔒 MENSAJE EN CONSOLA --- */
console.log("%c⛔ DETENTE", "color: red; font-size: 40px; font-weight: bold;");
console.log("%cEste código es propiedad intelectual de la Municipalidad de Chascomús y fue desarrollado por Federico Perez Speroni.", "font-size: 16px; color: #004a7c;");

/* --- 🔒 SISTEMA DE BLINDAJE DE AUTORÍA (AUTO-REPARACIÓN) --- */
(function() {
    const _0x1 = "Q3JlYWRvIHBvcjogPGI+RmVkZXJpY28gZGUgU2lzdGVtYXM8L2I+PGJyPnBhcmEgbGEgTXVuaWNpcGFsaWRhZCBkZSBDaGFzY29tw7pz";
    function _secure() {
        const _el = document.getElementById('authorCredit');
        const _txt = atob(_0x1); 
        if (_el) {
            if (_el.innerHTML !== _txt) { _el.innerHTML = _txt; }
        } else {
            // ADVERTENCIA: SI EL DIV 'authorCredit' NO EXISTE EN EL HTML, ESTO BORRARÁ LA PÁGINA.
            document.body.innerHTML = '<h2 style="text-align:center;margin-top:50px;">⛔ Error de Integridad: Se ha modificado el código fuente original.</h2>';
        }
    }
    window.addEventListener('load', _secure);
    setInterval(_secure, 2000);
})();
    window.addEventListener('load', _secure);
    setInterval(_secure, 2000);
})();

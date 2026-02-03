/* --- CONFIGURACIÓN --- */
let userName = localStorage.getItem('muni_user_name') || "";
let currentPath = ['main'];
let isAwaitingForm = false;
let currentFormStep = 0;
let formData = { tipo: "", ubicacion: "", descripcion: "" };

/* --- MENÚS --- */
const MENUS = {
    main: { 
        title: (name) => `¡Hola <b>${name}</b>! 👋 Soy Eva, la asistente virtual de la Municipalidad de Chascomús.<br><br>¿En qué puedo ayudarte?<br>Podés usar el menú o escribir palabras claves (ej: agua, foodtruck, casa).`, 
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
        📍 Club de Pesca y Náutica.<br><br>
        🎭 <b>Sáb 7 - Teatro:</b><br>
        "Amores y Desamores".<br>
        📍 Casa de Casco | 21hs.<br><br>
        🎉 <b>13-16 - CARNAVAL INFANTIL:</b><br>
        📍 Corsódromo (Av. Alfonsín) | 20hs.<br><br>
        <a href="https://linktr.ee/visitasguiadas.turismoch" target="_blank">🔗 Ver Agenda Completa</a>
    </div>`,
    
    'omic_info': `
    <div class="info-card">
        <strong>📢 OMIC (Defensa del Consumidor)</strong><br>
        📍 <b>Dirección:</b> Dorrego 229 (Estación Ferroautomotora).<br>
        ⏰ <b>Horario:</b> Lunes a Viernes de 8:00 a 13:00 hs.<br>
        📞 <b>Teléfonos:</b> 43-1287 / 42-5558
    </div>`,

    'caps_wa': `<div class="info-card">
        <strong>📞 WhatsApp de los CAPS:</strong><br>
        🟢 <b>30 de Mayo:</b> <a href="https://wa.me/5492241588248">2241-588248</a><br>
        🟢 <b>Barrio Jardín:</b> <a href="https://wa.me/5492241498087">2241-498087</a><br>
        🟢 <b>San Luis:</b> <a href="https://wa.me/5492241604874">2241-604874</a><br>
        🟢 <b>El Porteño:</b> <a href="https://wa.me/5492241409316">2241-409316</a>
    </div>`,

    'link_147': `<div class="info-card">
        <strong>📝 ATENCIÓN AL VECINO 147</strong><br>
        💻 <b>Web Autogestión (24/7):</b><br>
        🔗 <a href="https://147.chascomus.gob.ar" target="_blank">147.chascomus.gob.ar</a><br>
        📞 <b>Teléfono:</b> 147 (8 a 15hs).
    </div>`,

    'caps_mapas': `<div class="info-card">
        <strong>📍 Ubicaciones CAPS:</strong><br>
        • <a href="https://maps.google.com/?q=CIC+30+de+Mayo+Chascomus" target="_blank">CIC 30 de Mayo</a><br>
        • <a href="https://maps.google.com/?q=CAPS+Barrio+Jardin+Chascomus" target="_blank">Barrio Jardín</a><br>
        • <a href="https://maps.google.com/?q=CAPS+San+Luis+Chascomus" target="_blank">San Luis</a>
    </div>`,

    'farmacias_lista': `<div class="info-card">
        <strong>📍 Farmacias:</strong><br>
        💊 <a href="https://www.turnofarma.com/turnos/ar/ba/chascomus" target="_blank" class="wa-btn" style="background:#2ecc71 !important;">VER DE TURNO AHORA</a><br>
        • Alfonsín, Aprile, Batastini, Belgrano, Bellingieri, etc.
    </div>`,

    'zoo_rabia': `<div class="info-card" style="border-left: 5px solid #f1c40f;">
        <strong style="color:#d35400;">🐾 Zoonosis</strong><br>
        📍 Mendoza 95.<br>
        🐕 Castraciones: Requiere turno previo.<br>
        💉 Vacunación Antirrábica: Lun a Vie 8 a 13hs.
    </div>`,

    'vacunacion_info': `<div class="info-card">
        <strong>💉 Vacunación</strong><br>
        🏥 <b>Hospital:</b> Vacunatorio central.<br>
        🏠 <b>Puntos Barriales:</b> Consultar en CAPS.<br>
        • Demanda espontánea. Llevar libreta.
    </div>`,

    'info_habitat': `<div class="info-card">
        <strong>🔑 Info de Hábitat</strong><br>
        • Registro de Demanda.<br>
        • Bien de Familia.<br>
        👇 <b>Seleccioná una opción abajo.</b>
    </div>`,
    
    'habitat_info': `<div class="info-card">
        <strong>📍 Dirección Hábitat</strong><br>
        Dorrego y Bolivar (Ex IOMA).<br>
        <a href="https://wa.me/5492241559412" target="_blank" class="wa-btn">💬 Consultas WhatsApp</a>
    </div>`,
       
    'habitat_planes': `<div class="info-card">
        <strong>🏘️ Planes Habitacionales</strong><br>
        <a href="https://apps.chascomus.gob.ar/vivienda/" target="_blank" class="wa-btn" style="background-color: #004a7c !important;">🔗 Ver Planes Vigentes</a>
    </div>`,

    'mediacion_info': `<div class="info-card"><strong>⚖️ Mediación Comunitaria</strong><br>Resolución de conflictos vecinales.<br>📍 Moreno 259.</div>`,
    'uda_info': `<div class="info-card"><strong>📍 Puntos UDA</strong><br>Atención descentralizada en barrios.<br>Consultá en tu CAPS más cercano.</div>`,
    'pamuv': `<div class="info-card" style="border-left: 5px solid #c0392b;"><strong style="color: #c0392b;">🆘 PAMUV (Asistencia a la Víctima)</strong><br>Atención ante delitos o violencia.<br><a href="https://wa.me/5492241514881" class="wa-btn" style="background-color: #c0392b !important;">📞 2241-514881 (24hs)</a></div>`,
    'defensa_civil': `<div class="info-card" style="border-left: 5px solid #c0392b;">
    <strong style="color: #c0392b;">🌪️ Defensa Civil</strong><br>
    🚨 <b>LÍNEA DE EMERGENCIA: 103</b><br>
    Caída de árboles, temporales, riesgo en vía pública.</div>`,
    
    'apps_seguridad': `<div class="info-card">
        <strong>📲 Apps Seguridad</strong><br>
        🔔 <b>BASAPP:</b> Alerta vecinal.<br>
        🅿️ <b>SEM:</b> Estacionamiento Medido.<br>
        <i>Buscalas en tu tienda de aplicaciones.</i></div>`,
        
    'turismo_info': `<div class="info-card"><strong>🏖️ Turismo</strong><br>📍 Av. Costanera España 25<br>📞 02241 61-5542<br>📧 turismo@chascomus.gob.ar</div>`,
    'deportes_info': `<div class="info-card"><strong>⚽ Deportes</strong><br>📍 Av. Costanera España y Av. Lastra<br>📞 (02241) 42 4649</div>`,
    'deportes_circuito': `<div class="info-card"><strong>🏃 Circuito de Calle</strong><br>Inscripciones y resultados.<br>🔗 <a href="https://apps.chascomus.gob.ar/deportes/circuitodecalle/" target="_blank">IR A LA WEB</a></div>`,
    'seg_academia': `<div class="info-card"><strong>🚗 Licencias</strong><br>Academia de Conductores.<br>🔗 <a href="https://apps.chascomus.gob.ar/academia/" target="_blank">WEB ACADEMIA</a></div>`,
    'seg_medido': `<div class="info-card"><strong>🅿️ Estacionamiento Medido</strong><br>💻 <a href="https://chascomus.gob.ar/estacionamientomedido/" target="_blank">Gestión Web</a></div>`,
    'lic_turno': `<b>📅 Turno Licencia:</b><br>🔗 <a href="https://apps.chascomus.gob.ar/academia/">SOLICITAR TURNO</a>`, 
    'seg_infracciones': `<b>⚖️ Infracciones:</b><br>🔗 <a href="https://chascomus.gob.ar/municipio/estaticas/consultaInfracciones">VER MIS MULTAS</a>`, 
    'ojos': `👁️ <b>Ojos en Alerta:</b> <a href="https://wa.me/5492241557444">2241-557444</a>`,
    'poli': `📞 <b>Policía:</b> 42-2222 | 🎥 <b>COM:</b> 43-1333`,
    'politicas_gen': `<div class="info-card" style="border-left: 5px solid #9b59b6;"><strong style="color: #8e44ad;">💜 Género y Diversidad</strong><br>Asesoramiento y acompañamiento.<br>📍 Moreno 259.<br><a href="https://wa.me/5492241559397" target="_blank" class="wa-btn" style="background-color: #8e44ad !important;">🚨 GUARDIA 24HS</a></div>`,
    
    'asistencia_social': `
    <div class="info-card" style="border-left: 5px solid #e67e22;">
        <strong style="color: #d35400;">🍎 Módulos Alimentarios (CAM)</strong><br>
        Retiro de mercadería para familias empadronadas.<br>
        📍 Depósito calle Juárez.<br>
        ⏰ Lun-Vie 8 a 14hs.<br>
        <a href="https://wa.me/5492241559397" target="_blank" class="wa-btn" style="background-color: #d35400 !important;">📲 Consultar Cronograma</a>
    </div>`,
    
    'ninez': `<b>👶 Niñez:</b> Mendoza Nº 95. 📞 43-1146.`,
    'poda': `🌿 <a href="https://apps.chascomus.gob.ar/podaresponsable/solicitud.php">Solicitud Poda</a>`,
    'obras_basura': `♻️ <b>Recolección:</b><br>Lun a Sáb 20hs (Húmedos)<br>Jueves 14hs (Reciclables)`,
    'hac_tomasa': `<b>🤖 Hacienda Tomasa:</b><br>Portal de autogestión.<br>🔗 <a href="https://tomasa.chascomus.gob.ar/">INGRESAR</a>`, 
    'boleta': `<div class="info-card"><strong>📧 BOLETA DIGITAL</strong><br>🟢 WA: <a href="https://wa.me/5492241559739">2241-559739</a><br>📧 ingresospublicos@chascomus.gob.ar</div>`,
    'agua': `<b>💧 Consumo de Agua:</b><br>🔗 <a href="https://apps.chascomus.gob.ar/caudalimetros/consulta.php">VER MI CONSUMO</a>`, 
    'deuda': `<b>🔍 Consulta de Deuda:</b><br>🔗 <a href="https://chascomus.gob.ar/municipio/estaticas/consultaDeudas">CONSULTAR AQUÍ</a>`,
    
    'hab_gral': `
    <div class="info-card">
        <strong>🏢 Habilitación Comercial</strong><br>
        📍 Maipú 415.<br>
        🚀 <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionComercial.php" target="_blank" class="wa-btn">INICIAR TRÁMITE ONLINE</a>
    </div>`,

    'hab_eventos': `
    <div class="info-card">
        <strong>🎉 Eventos Privados</strong><br>
        Solicitar con 10 días de anticipación.<br>
        📝 <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionEventoPrivado2.0.php" target="_blank">IR AL FORMULARIO</a>
    </div>`,

    'hab_espacio': `
    <div class="info-card">
        <strong>🍔 Uso Espacio Público</strong><br>
        Foodtrucks y Patios.<br>
        📝 <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionCarro.php" target="_blank">SOLICITAR PERMISO</a>
    </div>`,

  'hab_reba': `
    <div class="info-card">
        <strong>🍷 REBA (Alcohol)</strong><br>
        <a href="https://wa.me/5492241559389" class="wa-btn" style="background-color:#25D366 !important;">💬 WhatsApp Habilitaciones</a>
    </div>`,
    
    'h_turnos': `<strong>📅 Turnos Hospital:</strong><br>WhatsApp: <a href="https://wa.me/5492241466977">2241-466977</a>`,
    'h_info': `📍 <b>Hospital Municipal:</b> Av. Alfonsín e Yrigoyen.<br>🚨 Guardia 24 hs.`,
    
    'info_pediatria': `<b>👶 Pediatría:</b> Lun, Mar, Jue. <a href="https://wa.me/5492241466977">Sacar Turno</a>`,
    'info_clinica': `<b>🩺 Clínica:</b> Lun, Mié, Vie. <a href="https://wa.me/5492241466977">Sacar Turno</a>`,
    'info_gineco': `<b>🤰 Ginecología:</b> Lun. <b>Obstetricia:</b> Mié. <a href="https://wa.me/5492241466977">Sacar Turno</a>`,
    'info_cardio': `<b>❤️ Cardiología:</b> Martes. <a href="https://wa.me/5492241466977">Sacar Turno</a>`,
    'info_trauma': `<b>🦴 Traumatología:</b> Martes. <a href="https://wa.me/5492241466977">Sacar Turno</a>`,
    'info_oftalmo': `<b>👁️ Oftalmología:</b> Miércoles. <a href="https://wa.me/5492241466977">Sacar Turno</a>`,
    'info_nutri': `<b>🍎 Nutrición:</b> Jueves. <a href="https://wa.me/5492241466977">Sacar Turno</a>`,
    'info_cirugia': `<b>🔪 Cirugía:</b> Jueves. <a href="https://wa.me/5492241466977">Sacar Turno</a>`,
    'info_neuro_psiq': `<b>🧠 Salud Mental:</b> Viernes. <a href="https://wa.me/5492241466977">Sacar Turno</a>`,
    
    'prod_empleo': `<div class="info-card"><strong>👷 Oficina de Empleo</strong><br>Bolsa de trabajo y capacitaciones.<br>📍 Maipú 415.</div>`,
    'prod_emprende': `<div class="info-card"><strong>🚀 Emprendedores</strong><br>PUPAAs y Compre Chascomús.<br>📧 produccion@chascomus.gob.ar</div>`,
    'prod_contacto': `<div class="info-card"><strong>🏭 Producción</strong><br>📍 Maipú 415.<br>📞 43-6365</div>`,

    'contacto_gral': `<div class="info-card">
    <strong>🏛️ Contacto Municipalidad</strong><br>
    📞 <a href="tel:02241431341">43-1341</a> (Conmutador)<br>
    📲 <a href="https://wa.me/5492241559397" class="wa-btn">💬 CHAT OPERADOR</a><br>
    📍 Mesa de Entradas: Cr. Cramer 270.</div>`
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
    document.getElementById('userInput').blur(); // Solo bajamos el teclado
    
    const tel147 = "5492241559397"; 
    
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
    if (['boludo', 'tonto', 'inutil', 'mierda', 'puto' , 'forro' , 'estupido'].some(palabra => texto.includes(palabra))) {
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
        'medidor':    { type: 'leaf', apiKey: 'agua', label: '💧 Consumo de Agua'  }, 
        'agua':       { type: 'leaf', apiKey: 'agua', label: '💧 Consumo de Agua'  }, 
        'boleta':     { type: 'leaf', apiKey: 'boleta', label: '📧 Boleta Digital' },
        'tomasa':     { type: 'leaf', apiKey: 'hac_tomasa', label: '📧 Tomasa' },
        'casa':       { type: 'leaf', apiKey: 'habitat_info', label: '🏢 Habilitación Habitacional'  }
    };
    
    for (let palabra in diccionario) {
        if (texto.includes(palabra)) { 
            const accion = diccionario[palabra];
            setTimeout(() => {
                addMessage(`¡Encontré esto sobre <b>"${palabra.toUpperCase()}"</b>! 👇`, 'bot');
                handleAction(accion); 
            }, 600);
            return; 
        }
    }
    
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
            document.body.innerHTML = '<h2 style="text-align:center;margin-top:50px;">⛔ Error de Integridad: Se ha modificado el código fuente original.</h2>';
        }
    }
    window.addEventListener('load', _secure);
    setInterval(_secure, 2000);
})();
    window.addEventListener('load', _secure);
    setInterval(_secure, 2000);
})();

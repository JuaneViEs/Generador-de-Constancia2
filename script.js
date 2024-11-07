document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('entrarBtn').addEventListener('click', login);
    document.getElementById('password').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            login();
        }
    });

    document.getElementById('fileInput').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            document.getElementById('cedulaContainer').classList.remove('hidden');
        } else {
            document.getElementById('cedulaContainer').classList.add('hidden');
        }
    });

    document.getElementById('buscarBtn').addEventListener('click', buscarPersona);
    document.getElementById('regresarBtn').addEventListener('click', function() {
        document.getElementById('cedulaContainer').classList.add('hidden');
        document.getElementById('fileInput').value = ''; // Reiniciar el input de archivo
        document.getElementById('resultado').classList.add('hidden');
    });

    document.getElementById('generateBtn').addEventListener('click', generarConstancia);

    document.getElementById('regresarConstanciaBtn').addEventListener('click', function() {
        document.getElementById('constanciaContainer').classList.add('hidden');
        document.getElementById('formContainer').classList.remove('hidden');
    });
});

function login() {
    const passwordInput = document.getElementById('password').value;
    if (passwordInput === 'Incess2024') {
        document.getElementById('formContainer').classList.remove('hidden');
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('passwordError').classList.add('hidden');
    } else {
        document.getElementById('passwordError').classList.remove('hidden');
    }
}

let personas = []; // Almacena los datos del CSV

function buscarPersona() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const cedulaInput = document.getElementById('cedulaInput').value.trim();

    if (!file) {
        alert('Por favor, selecciona un archivo CSV.');
        return;
    }

    if (!cedulaInput) {
        alert('Por favor, ingrese una Cédula o ID.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = event.target.result;
        const parsed = Papa.parse(data, { header: true, skipEmptyLines: true });
        personas = parsed.data;

        const persona = personas.find(p => p['Cedula'] === cedulaInput);
        if (persona) {
            document.getElementById('resultado').textContent = `Persona encontrada: ${persona['Nombre']} ${persona['Apellido']}`;
            document.getElementById('resultado').classList.remove('hidden');
            document.getElementById('generateBtn').classList.remove('hidden');
        } else {
            alert('No se encontró una persona con esa Cédula o ID.');
            document.getElementById('resultado').classList.add('hidden');
            document.getElementById('generateBtn').classList.add('hidden');
        }
    };

    reader.readAsText(file);
}

function generarConstancia() {
    const cedulaInput = document.getElementById('cedulaInput').value.trim();
    const persona = personas.find(p => p['Cedula'] === cedulaInput);

    if (persona) {
        const { jsPDF } = window.jspdf;

        const doc = new jsPDF('p', 'mm', 'a4');
        const margin = 20;
        const docWidth = doc.internal.pageSize.getWidth();
        const docHeight = doc.internal.pageSize.getHeight();

        // Configurar la fuente a Times New Roman
        doc.setFont("times", "normal");

        // --- ENCABEZADO --- 
        const encabezadoRuta = 'images/imagen1.jpeg';  // Reemplaza con la ruta de tu imagen
        doc.addImage(encabezadoRuta, 'JPEG', margin, margin, docWidth - (2 * margin), 20);  // Ajustamos el tamaño y la posición

        // Título de la constancia (centrado, a 2 cm del encabezado)
        doc.setFontSize(18);
        doc.text('CONSTANCIA', docWidth / 2, margin + 20, { align: 'center' });  // 2 cm (20 mm)

        // Subrayar el título de la constancia (centrado y ajustado al texto)
        const tituloX = (docWidth - doc.getTextWidth('CONSTANCIA')) / 2;  // Centrar el texto en el medio de la página
        const tituloY = margin + 23;  // Y donde se encuentra el título (debajo del título)
        const tituloAncho = doc.getTextWidth('CONSTANCIA');  // Ancho de la línea ajustado al texto
        doc.setLineWidth(0.5);
        doc.line(tituloX, tituloY, tituloX + tituloAncho, tituloY);  // Línea centrada y ajustada al texto

        // --- TEXTO DE LA CONSTANCIA ---
        // Obtenemos la fecha de hoy
        const today = new Date();
        const day = today.getDate();
        const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        const month = monthNames[today.getMonth()]; // Nombre del mes
        const year = today.getFullYear();

        // Formateamos la fecha como "los 22 días de noviembre 2024"
        const fechaTexto = `los ${day} días de ${month} ${year}`;

        // Obtenemos el valor de "Denominacion de la formacion" o "No disponible" si no está presente
        let unidadCurricular = persona['Denominacion de la Formacion'] ? persona['Denominacion de la Formacion'] : 'No disponible';

        // Asegúrate de que el texto de la Unidad Curricular no se vea alterado
        // Limpiar caracteres extraños si los hay
        unidadCurricular = unidadCurricular.replace(/[^\x20-\x7E]/g, '');  // Elimina caracteres fuera del rango ASCII imprimible
        
        // --- Aquí no modificamos el caso ni los acentos ---
        // **No cambiamos la primera letra a mayúsculas**, ni eliminamos ningún acento, simplemente dejamos lo que está tal cual en el CSV.
        console.log('Unidad Curricular:', unidadCurricular);  // Para verificar la salida

        const texto = `
    La Coordinación del Centro de Formación Socialista Carora, INCES Región-Lara hace constar, por medio de la presente, que el (a) ciudadano (a): ${persona['Nombre']} ${persona['Apellido']}, Portador(a) de la Cédula de Identidad V-${persona['Cedula']}, participó en la formación de la Unidad Curricular: ${unidadCurricular}, con una duración de ${persona['Horas']} horas, con fecha de inicio el: ${persona['Fecha de Inicio']} y fecha de término el: ${persona['Fecha de Cierre']}.

        Constancia que se expide a petición de parte interesada en el Municipio Torres, Parroquia Trinidad Samuel, Estado Lara a ${fechaTexto}.
        




                                                                  Atentamente,
                                                                  Jesus Campos
                                                                  Jefe de Centro
                         Según el orden administrativo N OA-2024-02-29 de fecha 15-02-2024
        `;

        // Ajustar el texto en la página
        doc.setFontSize(12);  // Tamaño de fuente para el texto
        const lines = doc.splitTextToSize(texto, docWidth - 2 * margin);  // Ajustamos el texto al tamaño del documento
        let yOffset = margin + 30; // Empezamos más abajo después del título

        // Insertar texto ajustado línea por línea
        lines.forEach(line => {
            doc.text(line, margin, yOffset);
            yOffset += 10;
        });

        // --- PIE DE PÁGINA --- 
        const piePaginaRuta = 'images/imagen2.jpeg';  // Reemplaza con la ruta de tu imagen
        doc.addImage(piePaginaRuta, 'JPEG', margin, docHeight - margin - 20, docWidth - (2 * margin), 20);  // Ajustamos el tamaño y la posición

        // Guardar el PDF
        doc.save(`constancia_${persona['Nombre']}_${persona['Apellido']}.pdf`);
    } else {
        alert("No se ha encontrado la persona. Por favor, verifica la cédula.");
    }
}

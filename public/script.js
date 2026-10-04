const foto = document.getElementById("foto");
const preview = document.getElementById("preview");
const analizar = document.getElementById("analizar");
const informacion = document.getElementById("informacion");

foto.addEventListener("change", () => {

    const archivo = foto.files[0];

    if (!archivo) {
        return;
    }

    const imagen = URL.createObjectURL(archivo);

    preview.src = imagen;
    preview.style.display = "block";

    informacion.innerHTML = `
        <p>📷 Fotografía seleccionada correctamente.</p>
        <p>Presiona "Analizar mascota" para continuar.</p>
    `;
});

analizar.addEventListener("click", async () => {

    if (!foto.files[0]) {
        alert("Primero selecciona una fotografía.");
        return;
    }

    informacion.innerHTML = `
        <h3>🤖 Analizando...</h3>
        <p>Gemini está examinando la fotografía.</p>
    `;

    const formulario = new FormData();

    formulario.append("foto", foto.files[0]);

    try {

        const respuesta = await fetch("/analizar", {
            method: "POST",
            body: formulario
        });

        const datos = await respuesta.json();

console.log("DATOS RECIBIDOS:", datos);

        if (!respuesta.ok) {
            throw new Error(datos.error || "Error al analizar.");
        }

        informacion.innerHTML = `
            <div class="resultado-animal">

                <h2>🐾 ${datos.raza}</h2>

                <p class="tipo">
                    ${datos.animal}
                </p>

                <div class="dato">
                    <strong>📏 Tamaño</strong>
                    <p>${datos.tamano}</p>
                </div>

                <div class="dato">
                    <strong>❤️ Esperanza de vida</strong>
                    <p>${datos.esperanza_vida}</p>
                </div>

                <div class="dato">
                    <strong>📋 Características</strong>
                    <p>${datos.caracteristicas}</p>
                </div>

                <div class="dato">
                    <strong>🧼 Cuidados</strong>
                    <p>${datos.cuidados}</p>
                </div>

                <div class="dato">
                    <strong>🍖 Alimentación</strong>
                    <p>${datos.alimentacion}</p>
                </div>

                <div class="dato">
                    <strong>🏃 Ejercicio</strong>
                    <p>${datos.ejercicio}</p>
                </div>

            </div>
        `;

    } catch (error) {

        console.error(error);

        informacion.innerHTML = `
            <h3>❌ Ocurrió un error</h3>
            <p>${error.message}</p>
        `;
    }

});
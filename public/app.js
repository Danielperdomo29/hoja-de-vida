AOS.init();

document.addEventListener("DOMContentLoaded", () => {
  console.log("Frontend cargado con AOS y servidor listo.");

  const form = document.getElementById("contactForm");
  const alertBox = document.getElementById("formAlert");
  const submitBtn = form.querySelector("button");

  function mostrarAlerta(mensaje, tipo = "success") {
    alertBox.innerHTML = ""; // limpia antes

    const div = document.createElement("div");
    div.className = `alert alert-${tipo}`;
    div.textContent = mensaje;

    alertBox.appendChild(div);

    // Ocultar después de 5 segundos
    setTimeout(() => {
      div.remove();
    }, 5000);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();

    if (!nombre || !correo || !mensaje) {
      mostrarAlerta("Todos los campos son obligatorios.", "danger");
      return;
    }

    submitBtn.disabled = true;

    try {
      const res = await fetch("/enviar-correo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre, correo, mensaje })
      });

      const data = await res.json();

      if (res.ok) {
        mostrarAlerta(data.mensaje, "success");
        form.reset();
      } else {
        mostrarAlerta(data.error || "Error al enviar el mensaje.", "danger");
      }

    } catch (error) {
      console.error("Error de red:", error);
      mostrarAlerta("No se pudo conectar al servidor.", "danger");
    } finally {
      submitBtn.disabled = false;
    }
  });
});

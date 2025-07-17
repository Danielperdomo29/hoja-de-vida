// Inicializa animaciones AOS
AOS.init();

document.addEventListener("DOMContentLoaded", () => {
  console.log("Frontend cargado con AOS y servidor listo.");

  // ====== MATRIX BACKGROUND ======
  const canvas = document.getElementById("matrix-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const letters = "01";
    const fontSize = 16;
    let columns = Math.floor(window.innerWidth / fontSize);
    let drops = Array(columns).fill(1);

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(1);
    }

    function drawMatrix() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0F0";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    }

    resizeCanvas();
    setInterval(drawMatrix, 33);
    window.addEventListener("resize", resizeCanvas);
  }

  // ====== FORMULARIO DE CONTACTO ======
  const form = document.getElementById("contactForm");
  const alertBox = document.getElementById("formAlert");

  if (form && alertBox) {
    const submitBtn = form.querySelector("button");

    function mostrarAlerta(mensaje, tipo = "success") {
      alertBox.innerHTML = ""; // Limpiar alertas anteriores

      const div = document.createElement("div");
      div.className = `alert alert-${tipo}`;
      div.textContent = mensaje;

      alertBox.appendChild(div);

      setTimeout(() => div.remove(), 5000); // Ocultar tras 5s
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = form.nombre.value.trim();
      const correo = form.correo.value.trim();
      const mensaje = form.mensaje.value.trim();

      if (!nombre || !correo || !mensaje) {
        return mostrarAlerta("Todos los campos son obligatorios.", "danger");
      }

      submitBtn.disabled = true;

      try {
        const res = await fetch("/enviar-correo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
  }
  
});

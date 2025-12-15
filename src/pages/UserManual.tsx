import React from "react";

const UserManual: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Encabezado */}
        <section className="mb-10">
          <p className="text-sm text-purple-300 mb-2">Guía rápida</p>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Manual de Usuario · LinkUp
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Este manual te explica paso a paso cómo usar LinkUp para crear, unirte
            y gestionar reuniones con video, audio y chat, sin sufrir más de lo necesario.
          </p>
        </section>

        {/* Requisitos básicos */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent mb-4">
            1. Requisitos básicos
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-900/70 border border-purple-700/40 p-4">
              <h3 className="font-semibold mb-2">Equipo y conexión</h3>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                <li>Computador o portátil con navegador actualizado.</li>
                <li>Conexión a internet estable.</li>
                <li>Micrófono y cámara (opcional, pero recomendados).</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-900/70 border border-purple-700/40 p-4">
              <h3 className="font-semibold mb-2">Navegadores recomendados</h3>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                <li>Chrome / Edge / Opera en su última versión.</li>
                <li>Permitir acceso a cámara y micrófono cuando el navegador lo pida.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Inicio de sesión / registro */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent mb-4">
            2. Ingreso a la aplicación
          </h2>
          <div className="rounded-2xl bg-slate-900/70 border border-purple-700/40 p-6 space-y-4">
            <p className="text-slate-300">
              Para usar LinkUp debes iniciar sesión con tu cuenta (correo y contraseña)
              o con los proveedores que el sistema tenga habilitados (por ejemplo Google).
            </p>
            <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
              <li>Ingresa a la URL principal de LinkUp.</li>
              <li>Haz clic en <span className="font-semibold">“Iniciar sesión”</span> o <span className="font-semibold">“Registrarse”</span>.</li>
              <li>Completa los datos solicitados o selecciona el proveedor de autenticación.</li>
              <li>Cuando el inicio de sesión sea exitoso, serás redirigido al dashboard.</li>
            </ol>
          </div>
        </section>

        {/* Dashboard */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent mb-4">
            3. Dashboard principal
          </h2>
          <div className="rounded-2xl bg-slate-900/70 border border-purple-700/40 p-6 space-y-4">
            <p className="text-slate-300">
              El dashboard es la pantalla principal después de iniciar sesión.
              Desde ahí puedes acceder a las acciones más importantes.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-950/60 border border-violet-700/40 p-4">
                <h3 className="font-semibold mb-1">Crear reunión</h3>
                <p className="text-xs text-slate-300">
                  Genera un enlace o código de reunión nuevo, configura nombre, fecha y
                  otros detalles básicos.
                </p>
              </div>
              <div className="rounded-xl bg-slate-950/60 border border-violet-700/40 p-4">
                <h3 className="font-semibold mb-1">Unirse a reunión</h3>
                <p className="text-xs text-slate-300">
                  Ingresa con un código o enlace compartido por otra persona para
                  participar en una videollamada.
                </p>
              </div>
              <div className="rounded-xl bg-slate-950/60 border border-violet-700/40 p-4">
                <h3 className="font-semibold mb-1">Historial / reuniones</h3>
                <p className="text-xs text-slate-300">
                  Consulta reuniones pasadas, próximas y los datos básicos asociados a cada una.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Crear reunión */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent mb-4">
            4. Crear una reunión
          </h2>
          <div className="rounded-2xl bg-slate-900/70 border border-purple-700/40 p-6 space-y-3">
            <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
              <li>En el dashboard, haz clic en <span className="font-semibold">“Crear reunión”</span>.</li>
              <li>Escribe el nombre o tema de la reunión.</li>
              <li>Configura fecha, hora y otros campos que aparezcan en el formulario.</li>
              <li>Confirma para generar la reunión.</li>
              <li>Comparte el enlace o código con las personas que quieres invitar.</li>
            </ol>
            <p className="text-xs text-slate-400">
              Sugerencia: usa nombres claros para las reuniones (por ejemplo: “Reunión proyecto
              Sistemas Operativos – Grupo 3”).
            </p>
          </div>
        </section>

        {/* Unirse a reunión */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent mb-4">
            5. Unirse a una reunión existente
          </h2>
          <div className="rounded-2xl bg-slate-900/70 border border-purple-700/40 p-6 space-y-3">
            <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
              <li>Desde el dashboard, selecciona <span className="font-semibold">“Unirse a reunión”</span>.</li>
              <li>Introduce el código o pega el enlace que te compartieron.</li>
              <li>Verifica tu nombre o alias de usuario.</li>
              <li>Haz clic en <span className="font-semibold">“Entrar a la reunión”</span>.</li>
            </ol>
          </div>
        </section>

        {/* Dentro de la reunión */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent mb-4">
            6. Controles dentro de la reunión
          </h2>
          <div className="rounded-2xl bg-slate-900/70 border border-purple-700/40 p-6 space-y-4">
            <p className="text-slate-300">
              Una vez dentro de la sala, verás la interfaz de videollamada con varios
              botones y paneles.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2 text-sm">Barra inferior de controles</h3>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  <li><span className="font-semibold">Micrófono:</span> activar/desactivar tu audio.</li>
                  <li><span className="font-semibold">Cámara:</span> encender/apagar tu video.</li>
                  <li><span className="font-semibold">Salir:</span> abandonar la reunión.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm">Panel lateral</h3>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  <li><span className="font-semibold">Chat:</span> enviar y recibir mensajes de texto.</li>
                  <li><span className="font-semibold">Participantes:</span> ver quién está conectado.</li>
                </ul>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Si no escuchas a nadie, revisa el volumen del sistema, los permisos del navegador
              y asegúrate de tener seleccionado el dispositivo de audio correcto.
            </p>
          </div>
        </section>

        {/* Perfil y configuración */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent mb-4">
            7. Perfil de usuario
          </h2>
          <div className="rounded-2xl bg-slate-900/70 border border-purple-700/40 p-6 space-y-3">
            <p className="text-slate-300">
              Desde la sección de perfil puedes actualizar algunos datos básicos de tu cuenta
              (por ejemplo, nombre visible).
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
              <li>Accede al perfil desde el menú o el encabezado de la aplicación.</li>
              <li>Edita los campos permitidos y guarda los cambios.</li>
            </ul>
          </div>
        </section>

        {/* Problemas frecuentes */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent mb-4">
            8. Problemas frecuentes
          </h2>
          <div className="rounded-2xl bg-slate-900/70 border border-purple-700/40 p-6 space-y-3 text-sm text-slate-300">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <span className="font-semibold">No se ve mi cámara:</span> revisa permisos del navegador
                y que no tengas otra app usando la cámara.
              </li>
              <li>
                <span className="font-semibold">No escucho nada:</span> revisa el volumen,
                la salida de audio y que no tengas el navegador silenciado.
              </li>
              <li>
                <span className="font-semibold">No puedo entrar con el código:</span> verifica que el código
                esté bien escrito y que la reunión siga activa.
              </li>
            </ul>
          </div>
        </section>

        {/* Cierre */}
        <section className="mb-4 pb-10 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-500">
            Manual de usuario de LinkUp. Esta guía está pensada para estudiantes y equipos
            académicos que usan la plataforma para coordinar y realizar reuniones virtuales.
          </p>
        </section>
      </main>
    </div>
  );
};

export default UserManual;

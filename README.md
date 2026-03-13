# Guía de Ejecución: Sistema Audiovisual Interactivo

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (v14 o superior)
   ```bash
   node --version
   ```

2. **pnpm** (para Strudel)
   ```bash
   npm install -g pnpm
   ```

3. **Open Stage Control**
   
  Se descarga desde la web a través de [este enlace](https://openstagecontrol.ammd.net/)

## Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/Valengp2006/sistema-audiovisual-interactivo.git
cd sistema-audiovisual-interactivo
```

## Paso 2: Instalar Dependencias

### 2.1 Dependencias de Strudel

```bash
cd strudel
pnpm install
cd ..
```

### 2.2 Dependencias del Bridge Strudel

```bash
cd strudelP5-tests/oscBridge
npm install
cd ../..
```

### 2.3 Dependencias del Bridge UI (OSC)

```bash
cd OpenStageControlUITest
npm install
cd ..
```

**Verificación:** No deberían aparecer errores. Si aparecen warnings, está bien.

## Paso 3: Iniciar Strudel (Terminal 1)

```bash
# Desde la raíz del proyecto
cd strudel
pnpm dev
```

**Salida esperada:**
```
VITE v... ready in XXX ms
➜  Local:   http://localhost:4321/
```

**Verificación:** Abre `http://localhost:4321` en el navegador. Deberías ver el editor de Strudel.

## Paso 4: Iniciar Bridge Strudel → p5.js (Terminal 2)

```bash
# Desde la raíz del proyecto
cd strudelP5-tests/oscBridge
node bridge.js
```

**Salida esperada:**
```
🚀 Super Bridge Iniciado
- Escuchando a Strudel en ws://localhost:8080
- Transmitiendo a p5.js en ws://localhost:8081
```

**Puertos en uso:**
- **8080**: Recibe de Strudel
- **8081**: Envía a visuales p5.js

## Paso 5: Iniciar Bridge UI (OSC + Público) (Terminal 3)

```bash
# Desde la raíz del proyecto
cd OpenStageControlUITest
node bridgeUI.js
```

**Salida esperada:**
```
WS relay listening on ws://127.0.0.1:8083
✅ Cliente WebSocket conectado
OSC listening on udp://0.0.0.0:9000
```

**Puertos en uso:**
- **8083**: WebSocket para visuales (OSC + público)
- **9000**: OSC desde Open Stage Control


## 🎚️ Paso 6: Iniciar Open Stage Control (Desde la app)

- En el **Send** debe configurarse la dirección **127.0.0.1:9000**
- Debe ponerse el **Port 8082**

**Verificación:** Debe aparecer un mensaje de servidor iniciado junto con un codigo qr y las direcciones _http://127.0.0.1:8082_ y _http://192.168.1.66:8082_

## Paso 7: Cargar Configuración de Open Stage Control

1. Darle al botón de inicio
2. Cuando se abra la pestaña de control cargar el archivo `ControladorOSC.json`

**Verificación:** Deberían aparecer los controles RGB, XY pads, y sliders.

## Paso 8: Abrir Visuales Principales

Desde el navegador:
```
http://localhost:4321/visualesUnidad3.html
```

**Verificación:** 
- Deberías ver un canvas negro
- Abre la consola del navegador (F12)
- Deberías ver: `✅ WebSocket conectado`

## Paso 9: Ejecutar Código de Audio en Strudel

1. Ve a `http://localhost:4321`
2. En el editor, pega este código:

```javascript
setcps(0.7);

let p1 = n("0 2 4 6 7 6 4 2")
  .scale("<c3:major>")
  .distort(0.9)
  .superimpose((x) => x.detune("<0.5>"))
  .lpenv(perlin.slow(3).range(1, 4))
  .lpf(perlin.slow(2).range(100, 2000))
  .gain(0.3);

let p2 = "<a1>/8".clip(0.8).struct("x*8").note();

let p3 = n("0@3 2 4 <[6,8] [7,9]>")
  .scale("C:minor")
  .sound("piano");

let p4 = sound("[bd*4,~ rim ~ cp]*<1 [2 4]>");

// CRÍTICO: El .osc() envía los eventos al bridge
$: stack(p1, p2, p3, p4, p1.osc(), p2.osc(), p3.osc(), p4.osc())
```

3. Presiona **Ctrl+Enter** para ejecutar

**Verificación:** 
- Deberías **escuchar** el audio
- En las visuales deberían aparecer formas y colores reactivos

## Paso 10: Habilitar Control del Público (Opcional)

### 10.1 Obtener tu IP Local

**Para MacOs / Linux:**
```bash
ifconfig | grep "inet "
# Busca una línea como: inet 10.8.86.136
```
**Para Windows:**
```bash
ipconfig
```
- Anota tu IP (ejemplo: `10.8.86.136`)

### 10.3 Desde Dispositivos Móviles

1. Asegúrate que el celular esté en la **misma red WiFi**
2. Abre el navegador del celular
3. Ve a: `http://TU_IP:8000/visualesClap.html`
   - Ejemplo: `http://10.8.86.136:8000/visualesClap.html`

**Verificación:**
- Deberías ver la interfaz con sliders RGB
- Arriba debería decir "✓ Conectado" (verde)
- Al mover los sliders, el color del **clap** en las visuales debería cambiar

## Uso del Sistema

### Control del Performer (Tú)

**Open Stage Control**:
- RGB sliders: Controla colores del piano
- XY Pad: Control HSB del bombo (X=hue, Y=brightness)
- Cambios se reflejan **inmediatamente** en las visuales

### Control del Público

**Interfaz móvil** (`http://TU_IP:8000/visualesClap.html`):
- Controla el color del **clap** colaborativamente
- Cambios visibles cuando el clap suena en el audio

## 🔌 Resumen de Puertos Utilizados

| Puerto | Servicio | Función |
|--------|----------|---------|
| **4321** | Strudel (Vite) | Editor y servidor web de Strudel |
| **8082** | Open Stage Control | Interfaz web de control del performer |
| **8080** | Strudel → Bridge Strudel | WebSocket salida de Strudel |
| **8081** | Bridge Strudel → Visuales | WebSocket entrada de visuales |
| **8083** | Bridge UI → Visuales | WebSocket OSC + público → visuales |
| **9000** | Open Stage Control → Bridge UI | OSC (UDP) |

**¿Por qué tantos puertos?**
- Cada componente necesita su propio canal de comunicación
- Separar puertos evita conflictos y permite debugging independiente
- Permite que múltiples servicios corran simultáneamente sin interferir

## Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    STRUDEL (Audio)                          │
│                  http://localhost:4321                      │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket :8080
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Bridge Strudel (oscBridge/bridge.js)           │
│                      Puertos 8080 → 8081                    │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket :8081
                         ↓
                    ┌─────────┐
                    │VISUALES │ ← WebSocket :8083 ← bridgeUI.js
                    │ p5.js   │                         ↑
                    └─────────┘                         │
                                                        │
                         ┌──────────────────────────────┤
                         │                              │
                  OSC :9000                      WebSocket :8083
                         │                              │
              ┌──────────┴──────────┐           ┌──────┴───────┐
              │ Open Stage Control  │           │   Público    │
              │  (Performer - Tú)   │           │  (Celulares) │
              └─────────────────────┘           └──────────────┘
```

## Solución de Problemas Comunes

### Las visuales no reaccionan al audio

**Causa:** Bridge Strudel no está corriendo o falta `.osc()` en el código

**Solución:**
1. Verifica que `bridge.js` esté corriendo (Terminal 2)
2. En Strudel, asegúrate que el código termine con `.osc()`:
   ```javascript
   $: stack(p1, p2, p3, p4, p1.osc(), p2.osc(), p3.osc(), p4.osc())
   ```

### Open Stage Control no controla los colores

**Causa:** Bridge UI no está corriendo o no se cargó la configuración

**Solución:**
1. Verifica que `bridgeUI.js` esté corriendo (Terminal 3)
2. En Open Stage Control, carga el archivo `osc/configuracion-osc.json`
3. Verifica en la consola de las visuales que diga: `✅ WebSocket conectado`

### El celular dice "Desconectado"

**Causa:** No está en la misma red o bridgeUI.js no acepta conexiones externas

**Solución:**
1. Verifica que celular y computadora estén en la misma WiFi
2. Si persiste, modifica `OpenStageControlUITest/bridgeUI.js` línea 7:
   ```javascript
   const wss = new WebSocket.Server({ 
     port: WS_PORT,
     host: '0.0.0.0'  // Permite conexiones externas
   });
   ```
3. Reinicia `bridgeUI.js`

### Error: "Cannot find module 'ws'"

**Causa:** No se instalaron las dependencias

**Solución:**
```bash
cd strudelP5-tests/oscBridge  # o OpenStageControlUITest
npm install
```

### Puerto ya en uso

**Causa:** Otro proceso está usando el puerto

**Solución:**
```bash
# Encontrar proceso usando el puerto (ejemplo: 8080)
lsof -i :8080

#Cambiar de puerto desde vs code
```

## Checklist de Verificación

Antes de la presentación/performance, verifica:

- [ ] Terminal 1: Strudel corriendo (`pnpm dev`)
- [ ] Terminal 2: Bridge Strudel corriendo (`node bridge.js`)
- [ ] Terminal 3: Bridge UI corriendo (`node bridgeUI.js`)
- [ ] App 1: Open Stage Control corriendo
- [ ] Navegador 1: Strudel abierto (`localhost:4321`)
- [ ] Navegador 2: Visuales abiertas (`visualesUnidad3.html`)
- [ ] Configuración OSC cargada
- [ ] Audio suena en Strudel
- [ ] Visuales reaccionan al audio
- [ ] Controles de OSC funcionan
- [ ] (Opcional) Celulares pueden conectarse

## Notas Finales

- **Orden de inicio:** Es importante iniciar en el orden indicado para evitar errores de conexión
- **Puertos:** Todos los puertos son necesarios para el funcionamiento del sistema
- **Debugging:** Usa la consola del navegador (F12) para ver mensajes de conexión
- **Performance:** El sistema puede funcionar sin el control del público si no es necesario

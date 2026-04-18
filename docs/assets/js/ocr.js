/**
 * OCRApp - Módulo de Reconocimiento Óptico
 * Integración con Tesseract.js para extraer texto de facturas.
 */

const OCRApp = {
    worker: null,

    async init() {
        if (!window.Tesseract) {
            console.error("Tesseract.js no está cargado.");
            return;
        }
        console.log("Inicializando Tesseract Worker...");
        // Cargamos español e inglés para mayor precisión de monedas/fechas
        this.worker = await Tesseract.createWorker('spa+eng');
    },

    async handleUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const statusEl = document.getElementById('ocr-status');
        if (statusEl) statusEl.style.display = 'flex';

        try {
            if (!this.worker) await this.init();

            const startTime = Date.now();
            console.log("Iniciando escaneo OCR...");

            // Ejecutar Tesseract
            const { data: { text } } = await this.worker.recognize(file);
            console.log("Texto extraído:", text);

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            if (window.Toast) Toast.info(`Escaneo completado en ${duration}s. Analizando datos...`);

            this.parseReceiptText(text);

        } catch (error) {
            console.error("Error OCR:", error);
            if (window.Toast) Toast.error("❌ Error al procesar la imagen: " + error.message);
        } finally {
            if (statusEl) statusEl.style.display = 'none';
            // Limpiar input para permitir subir la misma foto otra vez si hubo error
            event.target.value = '';
        }
    },

    parseReceiptText(text) {
        const lines = text.split('\n').filter(l => l.trim() !== '');
        
        let highestAmount = 0;
        let dateFound = null;
        let merchantName = lines[0] || 'Gasto Desconocido'; // El primer texto grande suele ser la tienda

        // Regex para buscar el total o valores grandes (Ej: TOTAL: $15.000,00)
        const amountRegex = /(?:TOTAL|TOT|PAGAR|VLR).{0,5}?\$?\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{1,2})?)/i;
        // Regex genérica para buscar números que parezcan montos (Ej: 15.000)
        const genericAmountRegex = /\$?\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{1,2})?)/g;

        // Regex para fechas dd/mm/yy o dd-mm-yyyy etc.
        const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;

        lines.forEach(line => {
            // Intentar extraer Total explícito
            const amountMatch = line.match(amountRegex);
            if (amountMatch) {
                let valStr = amountMatch[1].replace(/[^\d.,]/g, '');
                // Normalizar punto/coma decimal
                valStr = valStr.replace(/\./g, '').replace(/,/g, '.'); 
                const valNum = parseFloat(valStr);
                if (valNum > highestAmount) highestAmount = valNum;
            } else {
                // Caer a regex genérica y obtener el monto mayor de la factura (suele ser el total)
                let match;
                while ((match = genericAmountRegex.exec(line)) !== null) {
                    let valStr = match[1].replace(/[^\d.,]/g, '');
                    // Heurística de conversión en base a Colombia (los miles van con punto)
                    valStr = valStr.replace(/\./g, '').replace(/,/g, '.');
                    const valNum = parseFloat(valStr);
                    if (valNum > highestAmount && valNum < 10000000) { // límite de cordura
                        highestAmount = valNum;
                    }
                }
            }

            // Buscar fecha
            if (!dateFound) {
                const dMatch = line.match(dateRegex);
                if (dMatch) {
                    let d = dMatch[1];
                    let m = dMatch[2];
                    let y = dMatch[3];
                    if (y.length === 2) y = "20" + y; // Asumir 20xx
                    dateFound = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                }
            }
        });

        const data = {
            descripcion: merchantName.substring(0, 50),
            monto: highestAmount,
            fecha: dateFound
        };

        this.validateAndSetData(data);
    },

    validateAndSetData(data) {
        if (data.monto > 0) {
            document.getElementById('monto').value = data.monto;
        }

        if (data.fecha) {
            document.getElementById('fecha').value = data.fecha;
        }

        const currentDesc = document.getElementById('descripcion').value;
        if (!currentDesc || currentDesc.length < 3) {
            // Limpiar descripción de caracteres raros que el OCR haya captado mal
            let cleanDesc = data.descripcion.replace(/[^a-zA-Z0-9\s]/g, '').trim();
            document.getElementById('descripcion').value = "Ticket: " + cleanDesc;
        }

        if (window.Toast) Toast.success("✅ Datos extraídos (Precisión variante). Por favor verifícalos.");
        
        // Destacar visualmente los campos extraídos
        ['monto', 'fecha', 'descripcion'].forEach(id => {
            const el = document.getElementById(id);
            if (el && el.value) {
                el.style.backgroundColor = 'var(--accent-glow, rgba(139, 92, 246, 0.2))';
                setTimeout(() => {
                    el.style.backgroundColor = '';
                }, 2000);
            }
        });
    }
};

window.OCRApp = OCRApp;

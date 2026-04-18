/**
 * AnalyticsJS - Módulo de Visualización Avanzada
 * Integra Chart.js y D3.js para análisis de datos premium.
 */

const AnalyticsJS = {
    instances: {},

    lastExpenses: [],

    async renderAll(expenses = null) {
        if (!expenses) {
            try {
                expenses = await window.ExpenseAPI.getAll();
            } catch (e) {
                console.warn("No se pudieron cargar datos para analytics");
                expenses = [];
            }
        }

        if (!expenses || expenses.length === 0) return;
        this.lastExpenses = expenses;

        this.renderTrendChart(expenses);
        this.renderRadarChart(expenses);
        this.renderSankeyDiagram(expenses);
        setTimeout(() => this.renderHeatmap(expenses), 100); // Pequeño delay para D3
        
        // Listener para redimensionamiento responsivo
        if (!this.resizeListenerAdded) {
            window.addEventListener('resize', () => {
                if (window.innerWidth < 100) return; // avoid drawing on zero width
                clearTimeout(this.resizeTimer);
                this.resizeTimer = setTimeout(() => {
                    this.renderSankeyDiagram(this.lastExpenses);
                    this.renderHeatmap(this.lastExpenses);
                }, 250);
            });
            this.resizeListenerAdded = true;
        }
    },

    // 1. Chart.js - LineChart Temporal
    renderTrendChart(expenses) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        // Agrupar gastos por mes (Últimos 6 meses)
        const monthlyData = {};
        expenses.forEach(e => {
            const date = new Date(e.fecha);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + parseFloat(e.monto);
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        const dataValues = sortedMonths.map(k => monthlyData[k]);

        if (this.instances.trend) this.instances.trend.destroy();

        this.instances.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedMonths,
                datasets: [{
                    label: 'Gasto Total Mensual',
                    data: dataValues,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'month', displayFormats: { month: 'MMM yyyy' } },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8', callback: val => '$ ' + (val/1000) + 'k' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    // 2. Chart.js - RadarChart Perfil de Gasto
    renderRadarChart(expenses) {
        const ctx = document.getElementById('radarChart');
        if (!ctx) return;

        // Agrupar gastos por Usuario -> Categoría
        const userCatObj = {};
        const categoriesSet = new Set();

        expenses.forEach(e => {
            const user = e.pagado_por_nombre || 'Desconocido';
            const cat = e.categoria;
            categoriesSet.add(cat);

            if (!userCatObj[user]) userCatObj[user] = {};
            userCatObj[user][cat] = (userCatObj[user][cat] || 0) + parseFloat(e.monto);
        });

        const categories = Array.from(categoriesSet);
        const users = Object.keys(userCatObj);
        
        const colors = [
            { border: '#6366f1', bg: 'rgba(99, 102, 241, 0.4)' },
            { border: '#10b981', bg: 'rgba(16, 185, 129, 0.4)' },
            { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.4)' },
        ];

        const datasets = users.map((user, idx) => ({
            label: user,
            data: categories.map(c => userCatObj[user][c] || 0),
            borderColor: colors[idx % colors.length].border,
            backgroundColor: colors[idx % colors.length].bg,
            borderWidth: 2,
            pointBackgroundColor: colors[idx % colors.length].border,
        }));

        if (this.instances.radar) this.instances.radar.destroy();

        this.instances.radar = new Chart(ctx, {
            type: 'radar',
            data: { labels: categories, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: '#ecf0f1', font: { size: 12 } },
                        ticks: { display: false }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#ecf0f1' } }
                }
            }
        });
    },

    // 3. D3.js - Sankey Diagram (Flujo Usuario -> Categoría -> Tipo)
    renderSankeyDiagram(expenses) {
        if (typeof d3 === 'undefined' || typeof d3.sankey === 'undefined') return;

        const container = d3.select("#d3-sankey-container");
        container.selectAll("*").remove(); // Limpiar

        const width = container.node().getBoundingClientRect().width || 400;
        const height = 350;

        // Construir nodos y enlaces
        const nodesMap = new Map();
        const linksData = [];

        function addNode(name) {
            if (!nodesMap.has(name)) nodesMap.set(name, { name, node: nodesMap.size });
        }

        expenses.forEach(e => {
            const user = e.pagado_por_nombre || 'Desconocido';
            const cat = e.categoria;
            const type = e.tipo === 'UNIFICADO' ? 'Comparte' : 'Propio';

            addNode(user);
            addNode(cat);
            addNode(type);

            // Link User -> Cat
            const linkUC = linksData.find(l => l.sourceName === user && l.targetName === cat);
            if (linkUC) linkUC.value += parseFloat(e.monto);
            else linksData.push({ sourceName: user, targetName: cat, value: parseFloat(e.monto) });

            // Link Cat -> Type
            const linkCT = linksData.find(l => l.sourceName === cat && l.targetName === type);
            if (linkCT) linkCT.value += parseFloat(e.monto);
            else linksData.push({ sourceName: cat, targetName: type, value: parseFloat(e.monto) });
        });

        const nodes = Array.from(nodesMap.values());
        const links = linksData.map(l => ({
            source: nodesMap.get(l.sourceName).node,
            target: nodesMap.get(l.targetName).node,
            value: l.value
        }));

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(10,10)");

        const sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(20)
            .extent([[1, 1], [width - 20, height - 20]]);

        const {nodes: sNodes, links: sLinks} = sankey({
            nodes: nodes.map(d => Object.assign({}, d)),
            links: links.map(d => Object.assign({}, d))
        });

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Enlaces
        svg.append("g")
            .selectAll("path")
            .data(sLinks)
            .enter().append("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", d => color(d.source.name))
            .attr("stroke-width", d => Math.max(1, d.width))
            .attr("fill", "none")
            .attr("opacity", 0.4)
            .on("mouseover", function() { d3.select(this).attr("opacity", 0.7); })
            .on("mouseout", function() { d3.select(this).attr("opacity", 0.4); })
            .append("title")
            .text(d => `${d.source.name} → ${d.target.name}\n$${d.value.toLocaleString('es-CO')}`);

        // Nodos
        const node = svg.append("g")
            .selectAll(".node")
            .data(sNodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        node.append("rect")
            .attr("height", d => Math.max(0, d.y1 - d.y0))
            .attr("width", sankey.nodeWidth())
            .style("fill", d => color(d.name))
            .style("stroke", "#0f172a")
            .append("title")
            .text(d => `${d.name}\nTotal: $${d.value.toLocaleString('es-CO')}`);

        node.append("text")
            .attr("x", -6)
            .attr("y", d => (d.y1 - d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .text(d => d.name)
            .style("fill", "#ecf0f1")
            .style("font-family", "Inter, sans-serif")
            .style("font-size", "12px")
            .filter(d => d.x0 < width / 2)
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");
    },

    // 4. D3.js - Calendar Heatmap (Días con más gastos)
    renderHeatmap(expenses) {
        if (typeof d3 === 'undefined') return;

        const container = d3.select("#d3-heatmap-container");
        container.selectAll("*").remove(); // Limpiar

        const cellSize = 15;
        const width = Math.max(800, container.node().getBoundingClientRect().width);
        const height = 150;

        // Agrupar por día (YYYY-MM-DD)
        const dailyData = d3.rollup(expenses, v => d3.sum(v, d => parseFloat(d.monto)), d => d.fecha);
        const dates = Array.from(dailyData.keys()).map(d => new Date(d));
        
        if (dates.length === 0) return;

        const minDate = d3.min(dates);
        const maxDate = new Date(); // Hasta hoy

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(40,20)`);

        const timeWeek = d3.timeWeek;
        const countDay = d => d.getDay();
        const color = d3.scaleSequential(d3.interpolatePuRd).domain([0, d3.max(dailyData.values()) || 100000]);

        const yearGrp = svg.selectAll("g")
            .data([1]) // un grupo
            .enter().append("g");

        // Dibujar rectángulos (días)
        yearGrp.selectAll("rect")
            .data(d3.timeDays(d3.timeMonth.offset(maxDate, -6), new Date(maxDate.getTime() + 86400000))) // Ultimos 6 meses
            .enter().append("rect")
            .attr("width", cellSize - 2)
            .attr("height", cellSize - 2)
            .attr("x", d => timeWeek.count(d3.timeMonth.offset(maxDate, -6), d) * cellSize)
            .attr("y", d => countDay(d) * cellSize)
            .attr("fill", d => {
                const dateStr = d.toISOString().split('T')[0];
                return dailyData.has(dateStr) ? color(dailyData.get(dateStr)) : "#1e293b";
            })
            .attr("rx", 3)
            .attr("ry", 3)
            .append("title")
            .text(d => {
                const dateStr = d.toISOString().split('T')[0];
                return `${dateStr}: $${(dailyData.get(dateStr) || 0).toLocaleString('es-CO')}`;
            });

        // Nombres de los días
        const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
        yearGrp.selectAll("text")
            .data(d3.range(7))
            .enter().append("text")
            .attr("x", -10)
            .attr("y", d => (d + 0.5) * cellSize)
            .attr("dy", "0.31em")
            .attr("font-size", "10px")
            .attr("fill", "#64748b")
            .text(d => days[d]);
    }
};

window.AnalyticsJS = AnalyticsJS;


/* =========================================================
   ITECHUB - ASSISTÊNCIAS PERTO DE VOCÊ
========================================================= */


/* =========================================================
   DADOS DAS ASSISTÊNCIAS
========================================================= */

const stores = [

    {
        id: 1,
        name: "SOS Assistência Asa Sul",
        contact: "https://wa.me/5561999999999",
        rating: 4.8,
        address: "W3 Sul, Asa Sul - DF",
        region: "asa-sul",
        status: "Aberto agora",
        logo: "img/smart-fix.png",
        specialties: ["Celulares", "Notebooks"],
        services: ["Troca de tela", "Troca de bateria", "Conector de carga"],
        reviewCount: 128,
        reviews: ["Atendimento rápido e muito atencioso.", "Resolveram meu aparelho no mesmo dia."],
        img: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=300&h=200&fit=crop",
        lat: -15.8110,
        lng: -47.8920
    },

    {
        id: 2,
        name: "TechCenter Sul",
        contact: "https://wa.me/5561988888888",
        rating: 4.5,
        address: "SQS 208, Asa Sul - DF",
        region: "asa-sul",
        status: "Fechado",
        logo: "img/the-off.png",
        specialties: ["Computadores", "Notebooks"],
        services: ["Formatação", "Manutenção de hardware", "Upgrade"],
        reviewCount: 96,
        reviews: ["Orçamento claro e serviço bem explicado."],
        img: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=300&h=200&fit=crop",
        lat: -15.8185,
        lng: -47.9001
    },

    {
        id: 3,
        name: "Paranoá Cell",
        contact: "https://wa.me/5561977777777",
        rating: 4.9,
        address: "Avenida Principal, Paranoá - DF",
        region: "paranoa",
        status: "Aberto agora",
        logo: "img/smartphone.png",
        specialties: ["Celulares", "Tablets"],
        services: ["Troca de tela", "Bateria", "Reparo de placa"],
        reviewCount: 154,
        reviews: ["Excelente atendimento.", "Preço justo e prazo cumprido."],
        img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=200&fit=crop",
        lat: -15.7720,
        lng: -47.7750
    },

    {
        id: 4,
        name: "Rei do Display Paranoá",
        contact: "https://wa.me/5561966666666",
        rating: 4.6,
        address: "Quadra 05, Paranoá - DF",
        region: "paranoa",
        status: "Aberto agora",
        logo: "img/concert-pro.png",
        specialties: ["Celulares", "Videogames"],
        services: ["Display", "Conectores", "Limpeza e manutenção"],
        reviewCount: 81,
        reviews: ["Serviço rápido e atendimento cordial."],
        img: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=300&h=200&fit=crop",
        lat: -15.7755,
        lng: -47.7780
    }

];


window.itechubStores = stores;


/* =========================================================
   VERIFICA SE A SEÇÃO EXISTE
========================================================= */

const mapElement = document.getElementById("map");

if (mapElement) {

    const storeList = document.getElementById("store-list");
    const btnLocalizacao = document.getElementById("btn-localizacao");
    let map = null;
    const markers = {};
    let userMarker = null;
    let userLocation = null;
    let routeLayer = null;


    /* =====================================================
       CRIA POPUP
    ===================================================== */

    function criarPopup(store) {

        const statusClass =
            store.status === "Aberto agora"
                ? "status-aberto"
                : "status-fechado";


        return `
            <div class="popup-loja">

                <h3>${store.name}</h3>

                <p class="popup-avaliacao">
                    ⭐ ${store.rating}
                </p>

                <p>
                    📍 ${store.address}
                </p>

                <span class="status-loja ${statusClass}">
                    ${store.status}
                </span>

            </div>
        `;
    }


    /* =====================================================
       MODAL DO MAPA
       Usa o mesmo modal da V13 sem depender dos IDs antigos.
    ===================================================== */
    function abrirModalMapa(store) {
        const modal = document.getElementById("assistencia-modal");
        if (!modal) return;

        const set = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        const logo = document.getElementById("modal-logo");
        if (logo) {
            logo.src = store.logo || "";
            logo.alt = store.name;
        }
        set("modal-nome", store.name);
        set("modal-local", `📍 ${store.address}`);
        set("modal-rating", `⭐ ${store.rating} · ${store.reviewCount || store.reviews?.length || 0} avaliações`);
        set("modal-horario", store.status === "Aberto agora" ? "Seg. a sex. · 08:00 às 18:00" : "Consulte o horário da assistência");
        set("modal-avaliacoes", `${store.reviewCount || store.reviews?.length || 0} avaliações · nota ${store.rating}`);
        set("modal-endereco", store.address);

        const tags = document.getElementById("modal-tags");
        if (tags) tags.innerHTML = (store.specialties || []).map(t => `<span class="tag">${t}</span>`).join("");

        const services = document.getElementById("modal-servicos");
        if (services) services.innerHTML = (store.services || []).map(item => `<li>✓ ${item}</li>`).join("");

        const reviews = document.getElementById("modal-reviews");
        if (reviews) {
            reviews.innerHTML = `<h3>O que os clientes dizem</h3>` +
                (store.reviews || []).map(text => `<div class="modal-review"><strong>Cliente Itechub</strong><span>★★★★★</span><p>“${text}”</p></div>`).join("");
        }

        const contact = document.getElementById("modal-contato");
        if (contact) {
            contact.href = store.contact || "#";
            contact.target = store.contact ? "_blank" : "_self";
            contact.rel = store.contact ? "noopener" : "";
        }

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    }

    /* =====================================================
       CRIA MARCADORES
    ===================================================== */

    function inicializarMapa() {
        map = L.map(mapElement, { scrollWheelZoom: false })
            .setView([-15.793889, -47.882778], 11);

        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 20
            }
        ).addTo(map);

        stores.forEach(store => {
            const marker = L.marker([store.lat, store.lng], {
                title: store.name,
                icon: L.divIcon({
                    className: "map-marker-wrap",
                    html: '<span class="map-marker"><i class="fa-solid fa-location-dot"></i></span>',
                    iconSize: [32, 40],
                    iconAnchor: [16, 38],
                    popupAnchor: [0, -34]
                })
            });

            marker.addTo(map).bindPopup(criarPopup(store));
            marker.on("click", () => abrirModalMapa(store));
            markers[store.id] = marker;
        });
    }

    function obterLocalizacao() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Seu navegador não suporta localização."));
                return;
            }

            navigator.geolocation.getCurrentPosition(position => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                if (userMarker) map.removeLayer(userMarker);
                userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
                    radius: 9,
                    color: "#ffffff",
                    weight: 3,
                    fillColor: "#10b981",
                    fillOpacity: 1
                }).addTo(map).bindPopup("<b>Você está aqui</b>");

                resolve(userLocation);
            }, error => {
                console.error(error);
                reject(new Error("Não foi possível obter sua localização. Verifique a permissão do navegador."));
            }, { enableHighAccuracy: true, timeout: 12000 });
        });
    }

    async function tracarRota(store, button) {
        const buttonContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculando...';

        try {
            if (!userLocation) await obterLocalizacao();

            const routeUrl = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${store.lng},${store.lat}?overview=full&geometries=geojson`;
            const response = await fetch(routeUrl);
            if (!response.ok) throw new Error("O serviço de rotas está indisponível.");

            const result = await response.json();
            if (result.code !== "Ok" || !result.routes?.length) {
                throw new Error("Não foi encontrada uma rota para esta assistência.");
            }

            const route = result.routes[0];
            if (routeLayer) map.removeLayer(routeLayer);
            routeLayer = L.geoJSON(route.geometry, {
                style: { color: "#2563eb", weight: 6, opacity: 0.88, lineCap: "round", lineJoin: "round" }
            }).addTo(map);

            map.fitBounds(routeLayer.getBounds(), { padding: [40, 40], maxZoom: 15 });

            const distance = (route.distance / 1000).toFixed(1).replace(".", ",");
            const minutes = Math.max(1, Math.round(route.duration / 60));
            const marker = markers[store.id];
            marker.setPopupContent(`${criarPopup(store)}<p class="popup-rota"><i class="fa-solid fa-route"></i> ${distance} km · ${minutes} min de carro</p>`);
            marker.openPopup();
        } catch (error) {
            console.error(error);
            alert(error.message || "Não foi possível calcular a rota. Tente novamente.");
        } finally {
            button.disabled = false;
            button.innerHTML = buttonContent;
        }
    }


    /* =====================================================
       CRIA CARD
    ===================================================== */

    function criarCard(store) {

        const card = document.createElement("div");

        card.className = "store-card";

        card.dataset.region = store.region;


        const statusClass =
            store.status === "Aberto agora"
                ? "status-aberto"
                : "status-fechado";


        card.innerHTML = `

            <img
                src="${store.img}"
                alt="Imagem da ${store.name}"
            >

            <div class="store-card-info">

                <h3>
                    ${store.name}
                </h3>

                <div class="rating-loja">

                    <i class="fa-solid fa-star"></i>

                    <span>
                        ${store.rating}
                    </span>

                </div>

                <div class="endereco-loja">

                    <i class="fa-solid fa-location-dot"></i>

                    <span>
                        ${store.address}
                    </span>

                </div>

                <span class="status-loja ${statusClass}">
                    ${store.status}
                </span>

                <button class="btn-rota" type="button">
                    <i class="fa-solid fa-route"></i> Traçar rota
                </button>

            </div>

        `;

        card.querySelector(".btn-rota").addEventListener("click", event => {
            event.stopPropagation();
            tracarRota(store, event.currentTarget);
        });


        /* ================================================
           CLIQUE NO CARD
        ================================================= */

        card.addEventListener("click", () => {

            /* Remove destaque */

            document
                .querySelectorAll(".store-card")
                .forEach(item => {

                    item.classList.remove("active");

                });


            /* Adiciona destaque */

            card.classList.add("active");


            /* Pega marcador */

            const marker = markers[store.id];

            if (map && marker) {
                map.flyTo([store.lat, store.lng], 16, { duration: 1.2 });
                marker.openPopup();
            }
            abrirModalMapa(store);

        });


        return card;

    }


    /* =====================================================
       RENDERIZA LOJAS
    ===================================================== */

    function renderStores(filter = "todos") {

        storeList.innerHTML = "";


        const filteredStores = stores.filter(store => {

            if (filter === "todos") {
                return true;
            }

            return store.region === filter;

        });


        filteredStores.forEach(store => {

            const card = criarCard(store);

            storeList.appendChild(card);

        });

    }


    /* =====================================================
       FILTROS
    ===================================================== */

    const filtros = document.querySelectorAll(
        ".filtro-assistencia"
    );


    filtros.forEach(botao => {

        botao.addEventListener("click", () => {

            /* Remove ativo */

            filtros.forEach(item => {

                item.classList.remove("ativo");

            });


            /* Ativa botão */

            botao.classList.add("ativo");


            /* Pega região */

            const regiao =
                botao.dataset.regiao;


            /* Renderiza */

            renderStores(regiao);

        });

    });


    /* =====================================================
       LOCALIZAÇÃO DO USUÁRIO
    ===================================================== */

    if (btnLocalizacao) {

        btnLocalizacao.addEventListener(
            "click",
            async () => {
                btnLocalizacao.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Localizando...
                `;
                btnLocalizacao.disabled = true;
                try {
                    const location = await obterLocalizacao();
                    map.flyTo([location.lat, location.lng], 14, { duration: 1.5 });
                    userMarker.openPopup();
                } catch (error) {
                    alert(error.message);
                } finally {
                    btnLocalizacao.disabled = false;
                    btnLocalizacao.innerHTML = `
                        <i class="fa-solid fa-location-crosshairs"></i>
                        Minha localização
                    `;
                }
            }

        );

    }


    /* =====================================================
       CARREGA AS LOJAS
    ===================================================== */

    renderStores();
    inicializarMapa();
    setTimeout(() => map.invalidateSize(), 300);

}
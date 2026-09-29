document.addEventListener("DOMContentLoaded", () => {
  const sessionKey = "itechub_session";
  const companiesKey = "itechub_companies";
  const session = readJson(sessionStorage, sessionKey);

  if (!session || session.type !== "company" || !session.id) {
    window.location.replace("empresa-login.html");
    return;
  }

  const companies = readList(companiesKey);
  const account = companies.find((company) => company.id === session.id);
  if (!account) {
    sessionStorage.removeItem(sessionKey);
    window.location.replace("empresa-login.html");
    return;
  }

  const leadsKey = `itechub_company_leads_${account.id}`;
  const profileKey = `itechub_company_profile_${account.id}`;
  const defaultProfile = {
    companyName: account.companyName || session.companyName || "Minha assistência",
    phone: account.phone || "",
    location: account.location || "",
    about: account.about || "Apresente sua assistência e os cuidados que oferece aos clientes.",
    services: Array.isArray(account.services) ? account.services : []
  };
  let profile = { ...defaultProfile, ...readJson(localStorage, profileKey) };
  let leads = readList(leadsKey);
  let activeFilter = "all";

  const leadTable = document.getElementById("crm-leads");
  const searchInput = document.getElementById("crm-search");
  const leadDialog = document.getElementById("crm-lead-dialog");
  const profileDialog = document.getElementById("crm-profile-dialog");
  const leadForm = document.getElementById("crm-lead-form");
  const profileForm = document.getElementById("crm-profile-form");

  document.getElementById("crm-user-name").textContent = account.name || session.name || "Empresa";
  document.getElementById("crm-company-title").textContent = profile.companyName;
  document.getElementById("crm-logout").addEventListener("click", () => {
    sessionStorage.removeItem(sessionKey);
    window.location.href = "empresa-login.html";
  });

  document.querySelectorAll("[data-open-lead]").forEach((button) => {
    button.addEventListener("click", () => leadDialog.showModal());
  });
  document.querySelectorAll("[data-open-profile]").forEach((button) => {
    button.addEventListener("click", () => {
      profileForm.elements.companyName.value = profile.companyName;
      profileForm.elements.phone.value = profile.phone;
      profileForm.elements.location.value = profile.location;
      profileForm.elements.about.value = profile.about;
      profileForm.elements.services.value = profile.services.join(", ");
      profileDialog.showModal();
    });
  });
  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });

  document.querySelectorAll(".crm-filter").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll(".crm-filter").forEach((filterButton) => {
        const selected = filterButton === button;
        filterButton.classList.toggle("is-active", selected);
        filterButton.setAttribute("aria-pressed", String(selected));
      });
      renderLeads();
    });
  });

  searchInput.addEventListener("input", renderLeads);

  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(leadForm);
    leads.unshift({
      id: createId(),
      name: String(formData.get("name")).trim(),
      contact: String(formData.get("contact")).trim(),
      service: String(formData.get("service")).trim(),
      status: String(formData.get("status")),
      createdAt: new Date().toISOString()
    });
    saveList(leadsKey, leads);
    leadForm.reset();
    leadDialog.close();
    renderLeads();
  });

  leadTable.addEventListener("change", (event) => {
    const select = event.target.closest("[data-lead-status]");
    if (!select) return;
    const lead = leads.find((item) => item.id === select.dataset.leadStatus);
    if (!lead) return;
    lead.status = select.value;
    saveList(leadsKey, leads);
    renderLeads();
  });

  leadTable.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-lead]");
    if (!deleteButton) return;
    leads = leads.filter((lead) => lead.id !== deleteButton.dataset.deleteLead);
    saveList(leadsKey, leads);
    renderLeads();
  });

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(profileForm);
    profile = {
      companyName: String(formData.get("companyName")).trim(),
      phone: String(formData.get("phone")).trim(),
      location: String(formData.get("location")).trim(),
      about: String(formData.get("about")).trim(),
      services: String(formData.get("services")).split(",").map((service) => service.trim()).filter(Boolean)
    };

    account.companyName = profile.companyName;
    account.phone = profile.phone;
    account.location = profile.location;
    account.about = profile.about;
    account.services = profile.services;
    const companyIndex = companies.findIndex((company) => company.id === account.id);
    companies[companyIndex] = account;
    localStorage.setItem(companiesKey, JSON.stringify(companies));
    localStorage.setItem(profileKey, JSON.stringify(profile));

    const updatedSession = { ...session, companyName: profile.companyName };
    sessionStorage.setItem(sessionKey, JSON.stringify(updatedSession));
    document.getElementById("crm-company-title").textContent = profile.companyName;
    profileDialog.close();
    renderProfile();
  });

  function renderLeads() {
    const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
    const visibleLeads = leads.filter((lead) => {
      const matchesFilter = activeFilter === "all" || lead.status === activeFilter;
      const searchable = `${lead.name} ${lead.contact} ${lead.service}`.toLocaleLowerCase("pt-BR");
      return matchesFilter && searchable.includes(query);
    });

    if (!visibleLeads.length) {
      const hasLeads = leads.length > 0;
      leadTable.innerHTML = `<tr><td class="crm-empty" colspan="6"><span class="crm-empty-icon"><i class="fa-solid ${hasLeads ? "fa-filter" : "fa-address-book"}" aria-hidden="true"></i></span><strong>${hasLeads ? "Nenhum contato encontrado" : "Sua lista começa aqui"}</strong><span>${hasLeads ? "Ajuste a busca ou o filtro selecionado." : "Adicione um contato para acompanhar seu primeiro atendimento."}</span>${hasLeads ? "" : '<button class="crm-secondary-button" type="button" data-open-lead><i class="fa-solid fa-plus" aria-hidden="true"></i> Adicionar contato</button>'}</td></tr>`;
      leadTable.querySelector("[data-open-lead]")?.addEventListener("click", () => leadDialog.showModal());
    } else {
      leadTable.innerHTML = visibleLeads.map((lead) => `
        <tr>
          <td data-label="Cliente"><strong>${escapeHtml(lead.name)}</strong></td>
          <td data-label="Serviço">${escapeHtml(lead.service)}</td>
          <td data-label="Contato">${escapeHtml(lead.contact)}</td>
          <td data-label="Recebido em">${formatDate(lead.createdAt)}</td>
          <td data-label="Situação"><select class="crm-status-select status-${escapeHtml(lead.status)}" data-lead-status="${escapeHtml(lead.id)}" aria-label="Situação de ${escapeHtml(lead.name)}">${statusOptions(lead.status)}</select></td>
          <td data-label="Ações"><button class="crm-row-action" type="button" data-delete-lead="${escapeHtml(lead.id)}" aria-label="Excluir contato de ${escapeHtml(lead.name)}" title="Excluir"><i class="fa-regular fa-trash-can" aria-hidden="true"></i></button></td>
        </tr>`).join("");
    }

    document.getElementById("crm-stat-total").textContent = leads.length;
    document.getElementById("crm-stat-new").textContent = countStatus("novo");
    document.getElementById("crm-stat-scheduled").textContent = countStatus("agendado");
    document.getElementById("crm-stat-completed").textContent = countStatus("concluido");
  }

  function renderProfile() {
    document.getElementById("crm-profile-name").textContent = profile.companyName;
    document.getElementById("crm-profile-location").textContent = profile.location || "Localização ainda não informada";
    document.getElementById("crm-profile-about").textContent = profile.about;
    const serviceList = document.getElementById("crm-profile-services");
    serviceList.innerHTML = profile.services.length
      ? profile.services.map((service) => `<span>${escapeHtml(service)}</span>`).join("")
      : "<span>Nenhum serviço cadastrado</span>";
  }

  function countStatus(status) {
    return leads.filter((lead) => lead.status === status).length;
  }

  function statusOptions(selectedStatus) {
    const statuses = [
      ["novo", "Novo"],
      ["em-contato", "Em contato"],
      ["agendado", "Agendado"],
      ["concluido", "Concluído"]
    ];
    return statuses.map(([value, label]) => `<option value="${value}" ${value === selectedStatus ? "selected" : ""}>${label}</option>`).join("");
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function createId() {
    return window.crypto?.randomUUID?.() || `lead_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  function readJson(storage, key) {
    try {
      return JSON.parse(storage.getItem(key)) || null;
    } catch {
      return null;
    }
  }

  function readList(key) {
    const value = readJson(localStorage, key);
    return Array.isArray(value) ? value : [];
  }

  function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }

  renderProfile();
  renderLeads();
});
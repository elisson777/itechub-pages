document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     MENU MOBILE
     ========================================================= */
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  const dropdown = document.querySelector(".dropdown");
  const dropdownToggle = document.querySelector(".dropdown-toggle");

  const closeMenu = () => {
    nav?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuToggle) {
      menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      menuToggle.setAttribute("aria-label", "Abrir menu");
    }
  };

  menuToggle?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const open = !nav?.classList.contains("is-open");
    nav?.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menuToggle.innerHTML = open
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
  });

  dropdownToggle?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const open = !dropdown?.classList.contains("is-open");
    dropdown?.classList.toggle("is-open", open);
    dropdownToggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (dropdown && !dropdown.contains(event.target)) {
      dropdown.classList.remove("is-open");
      dropdownToggle?.setAttribute("aria-expanded", "false");
    }
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
      dropdown?.classList.remove("is-open");
      dropdownToggle?.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });

  /* =========================================================
     TRANSIÇÃO LOGIN / CADASTRO
     ========================================================= */
  const authShell = document.getElementById("user-auth");
  const companyShell = document.getElementById("company-auth");

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!authShell) return;
      authShell.dataset.mode = button.dataset.authMode;
    });
  });

  document.querySelectorAll("[data-company-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!companyShell) return;
      companyShell.dataset.mode = button.dataset.companyMode;
    });
  });

  /* =========================================================
     ITECHUB AUTH
     Autenticação demonstrativa para o projeto acadêmico.
     Contas ficam no localStorage e a sessão no sessionStorage.
     Senhas são armazenadas como SHA-256, não em texto puro.
     ========================================================= */

  const STORAGE = {
    users: "itechub_users",
    companies: "itechub_companies",
    session: "itechub_session"
  };

  const getList = (key) => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  const saveList = (key, list) => {
    localStorage.setItem(key, JSON.stringify(list));
  };

  const getSession = () => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE.session));
    } catch {
      return null;
    }
  };

  const setSession = (type, account) => {
    sessionStorage.setItem(
      STORAGE.session,
      JSON.stringify({
        type,
        id: account.id,
        name: account.name,
        email: account.email,
        companyName: account.companyName || null,
        loggedAt: new Date().toISOString()
      })
    );
  };

  const clearSession = () => {
    sessionStorage.removeItem(STORAGE.session);
  };

  const normalizeEmail = (email) => email.trim().toLowerCase();

  const createId = (prefix) => {
    if (window.crypto?.randomUUID) {
      return `${prefix}_${crypto.randomUUID()}`;
    }
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  };

  const hashPassword = async (password) => {
    if (!window.crypto?.subtle) {
      return btoa(unescape(encodeURIComponent(password)));
    }

    const data = new TextEncoder().encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);

    return [...new Uint8Array(hash)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  const getMessageElement = (form) => {
    let message = form.querySelector(".auth-message");

    if (!message) {
      message = document.createElement("div");
      message.className = "auth-message";
      form.prepend(message);
    }

    return message;
  };

  const showMessage = (form, text, type = "error") => {
    const message = getMessageElement(form);
    message.textContent = text;
    message.className = `auth-message ${type}`;
  };

  const clearMessage = (form) => {
    const message = form.querySelector(".auth-message");
    if (message) {
      message.textContent = "";
      message.className = "auth-message";
    }
  };

  const setLoading = (button, loading, defaultText) => {
    if (!button) return;

    button.disabled = loading;
    button.classList.toggle("is-loading", loading);
    button.textContent = loading ? "Aguarde..." : defaultText;
  };

  const isValidPassword = (password) => password.length >= 6;

  /* =========================================================
     CADASTRO / LOGIN DO USUÁRIO
     ========================================================= */

  const userForms = document.querySelectorAll("#user-auth .auth-form");

  userForms.forEach((form) => {
    const shell = document.getElementById("user-auth");
    if (!shell) return;

    const isSignup = form.closest(".auth-signup-form") !== null;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearMessage(form);

      const inputs = [...form.querySelectorAll("input")];
      const button = form.querySelector(".auth-primary");

      if (isSignup) {
        const [nameInput, emailInput, passwordInput] = inputs;

        const name = nameInput.value.trim();
        const email = normalizeEmail(emailInput.value);
        const password = passwordInput.value;

        if (name.length < 3) {
          showMessage(form, "Digite seu nome completo.");
          nameInput.focus();
          return;
        }

        if (!emailInput.checkValidity()) {
          showMessage(form, "Digite um e-mail válido.");
          emailInput.focus();
          return;
        }

        if (!isValidPassword(password)) {
          showMessage(form, "A senha precisa ter pelo menos 6 caracteres.");
          passwordInput.focus();
          return;
        }

        const users = getList(STORAGE.users);

        if (users.some((user) => user.email === email)) {
          showMessage(form, "Esse e-mail já possui uma conta. Entre na sua conta.");
          shell.dataset.mode = "signin";
          return;
        }

        setLoading(button, true, "Cadastrar");

        const passwordHash = await hashPassword(password);

        const account = {
          id: createId("usr"),
          name,
          email,
          passwordHash,
          createdAt: new Date().toISOString()
        };

        users.push(account);
        saveList(STORAGE.users, users);
        setSession("user", account);

        setLoading(button, false, "Cadastrar");
        showMessage(form, "Conta criada com sucesso! Redirecionando...", "success");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 700);

      } else {
        const [emailInput, passwordInput] = inputs;

        const email = normalizeEmail(emailInput.value);
        const password = passwordInput.value;

        if (!emailInput.checkValidity()) {
          showMessage(form, "Digite um e-mail válido.");
          emailInput.focus();
          return;
        }

        if (!password) {
          showMessage(form, "Digite sua senha.");
          passwordInput.focus();
          return;
        }

        setLoading(button, true, "Entrar");

        const users = getList(STORAGE.users);
        const account = users.find((user) => user.email === email);

        if (!account) {
          setLoading(button, false, "Entrar");
          showMessage(form, "Não encontramos uma conta com esse e-mail.");
          return;
        }

        const passwordHash = await hashPassword(password);

        if (account.passwordHash !== passwordHash) {
          setLoading(button, false, "Entrar");
          showMessage(form, "Senha incorreta.");
          return;
        }

        setSession("user", account);

        setLoading(button, false, "Entrar");
        showMessage(form, "Login realizado! Redirecionando...", "success");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 500);
      }
    });
  });

  /* =========================================================
     CADASTRO / LOGIN DA EMPRESA
     ========================================================= */

  const companyForms = document.querySelectorAll("#company-auth .auth-form");

  companyForms.forEach((form) => {
    const shell = document.getElementById("company-auth");
    if (!shell) return;

    const isSignup = form.closest(".auth-signup-form") !== null;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearMessage(form);

      const inputs = [...form.querySelectorAll("input")];
      const button = form.querySelector(".auth-primary");

      if (isSignup) {
        const [
          companyNameInput,
          cnpjInput,
          responsibleInput,
          phoneInput,
          emailInput,
          passwordInput
        ] = inputs;

        const companyName = companyNameInput.value.trim();
        const cnpj = cnpjInput.value.trim();
        const responsible = responsibleInput.value.trim();
        const phone = phoneInput.value.trim();
        const email = normalizeEmail(emailInput.value);
        const password = passwordInput.value;

        if (companyName.length < 3) {
          showMessage(form, "Informe o nome da assistência.");
          companyNameInput.focus();
          return;
        }

        if (cnpj.length < 11) {
          showMessage(form, "Informe um CNPJ válido.");
          cnpjInput.focus();
          return;
        }

        if (responsible.length < 3) {
          showMessage(form, "Informe o nome do responsável.");
          responsibleInput.focus();
          return;
        }

        if (phone.length < 8) {
          showMessage(form, "Informe um telefone válido.");
          phoneInput.focus();
          return;
        }

        if (!emailInput.checkValidity()) {
          showMessage(form, "Digite um e-mail profissional válido.");
          emailInput.focus();
          return;
        }

        if (!isValidPassword(password)) {
          showMessage(form, "A senha precisa ter pelo menos 6 caracteres.");
          passwordInput.focus();
          return;
        }

        const companies = getList(STORAGE.companies);

        if (companies.some((company) => company.email === email)) {
          showMessage(form, "Esse e-mail já está cadastrado para uma empresa.");
          shell.dataset.mode = "signin";
          return;
        }

        if (companies.some((company) => company.cnpj === cnpj)) {
          showMessage(form, "Esse CNPJ já está cadastrado.");
          return;
        }

        setLoading(button, true, "Cadastrar empresa");

        const passwordHash = await hashPassword(password);

        const account = {
          id: createId("company"),
          companyName,
          name: responsible,
          cnpj,
          phone,
          email,
          passwordHash,
          createdAt: new Date().toISOString()
        };

        companies.push(account);
        saveList(STORAGE.companies, companies);
        setSession("company", account);

        setLoading(button, false, "Cadastrar empresa");
        showMessage(form, "Empresa cadastrada com sucesso! Redirecionando...", "success");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 700);

      } else {
        const [emailInput, passwordInput] = inputs;

        const email = normalizeEmail(emailInput.value);
        const password = passwordInput.value;

        if (!emailInput.checkValidity()) {
          showMessage(form, "Digite um e-mail válido.");
          emailInput.focus();
          return;
        }

        if (!password) {
          showMessage(form, "Digite sua senha.");
          passwordInput.focus();
          return;
        }

        setLoading(button, true, "Entrar");

        const companies = getList(STORAGE.companies);
        const account = companies.find((company) => company.email === email);

        if (!account) {
          setLoading(button, false, "Entrar");
          showMessage(form, "Nenhuma empresa encontrada com esse e-mail.");
          return;
        }

        const passwordHash = await hashPassword(password);

        if (account.passwordHash !== passwordHash) {
          setLoading(button, false, "Entrar");
          showMessage(form, "Senha incorreta.");
          return;
        }

        setSession("company", account);

        setLoading(button, false, "Entrar");
        showMessage(form, "Login da empresa realizado! Redirecionando...", "success");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 500);
      }
    });
  });

  /* =========================================================
     RECUPERAÇÃO DE SENHA — DEMONSTRATIVA
     ========================================================= */

  document.querySelectorAll(".forgot-password").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const form = link.closest("form");
      if (!form) return;

      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput?.value.trim();

      if (!email) {
        showMessage(form, "Digite seu e-mail primeiro para solicitar a recuperação.");
        emailInput?.focus();
        return;
      }

      if (!emailInput.checkValidity()) {
        showMessage(form, "Digite um e-mail válido.");
        emailInput?.focus();
        return;
      }

      const isCompany = !!form.closest("#company-auth");
      const list = getList(isCompany ? STORAGE.companies : STORAGE.users);
      const exists = list.some((account) => account.email === normalizeEmail(email));

      if (exists) {
        showMessage(
          form,
          "Solicitação registrada. Em uma versão com backend, o link seria enviado por e-mail.",
          "success"
        );
      } else {
        showMessage(form, "Não encontramos uma conta com esse e-mail.");
      }
    });
  });

  /* =========================================================
     SESSÃO / HEADER
     ========================================================= */

  const updateHeaderSession = () => {
    const session = getSession();
    const desktopLogin = document.querySelector(".desktop-login");
    const menu = document.querySelector(".site-nav .menu");

    // Remove elementos criados anteriormente.
    document.querySelectorAll(".session-action").forEach((el) => el.remove());

    if (!session) {
      return;
    }

    if (desktopLogin) {
      desktopLogin.textContent = session.type === "company"
        ? "Área da empresa"
        : `Olá, ${session.name.split(" ")[0]}`;

      desktopLogin.href = "index.html#conta";
      desktopLogin.classList.add("session-action");
      desktopLogin.setAttribute("title", "Sessão ativa");
    }

    if (menu) {
      const li = document.createElement("li");
      li.className = "session-action";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "mobile-session-link";
      button.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Sair da conta`;

      button.addEventListener("click", () => {
        clearSession();
        window.location.href = "index.html";
      });

      li.appendChild(button);
      menu.appendChild(li);
    }

    if (desktopLogin) {
      const logout = document.createElement("button");
      logout.type = "button";
      logout.className = "session-logout session-action";
      logout.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';
      logout.setAttribute("aria-label", "Sair");
      logout.title = "Sair";

      logout.addEventListener("click", () => {
        clearSession();
        window.location.reload();
      });

      desktopLogin.insertAdjacentElement("afterend", logout);
    }
  };

  updateHeaderSession();

  /* Expõe a sessão para outros scripts/páginas do projeto. */
  window.ItechubAuth = {
    getSession,
    logout: () => {
      clearSession();
      window.location.href = "index.html";
    },
    isLoggedIn: () => !!getSession(),
    getUser: () => {
      const session = getSession();
      return session?.type === "user" ? session : null;
    },
    getCompany: () => {
      const session = getSession();
      return session?.type === "company" ? session : null;
    }
  };
});

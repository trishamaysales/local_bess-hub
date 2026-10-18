(() => {
  const app = document.getElementById("app");
  const toastRoot = document.getElementById("toastRoot");
  let registerRole = new URLSearchParams(location.search).get("role") === "seller" ? "seller" : "buyer";

  function readList(key) {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(value)) throw new Error(`Stored ${key} data is invalid.`);
    return value;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showMessage(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastRoot.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3000);
  }

  function loginView() {
    document.title = "Login — LocalBess Hub";
    app.classList.remove("register-view");
    app.innerHTML = `<section class="auth-wrap">
      <h2>Login</h2>
      <p class="muted">Sign in to continue to LocalBess Hub.</p>
      <form id="loginForm">
        <div class="form-group"><label for="loginAccountType">Account Type</label>
          <select id="loginAccountType" name="accountType" required>
            <option value="buyer" ${registerRole === "buyer" ? "selected" : ""}>Buyer</option>
            <option value="seller" ${registerRole === "seller" ? "selected" : ""}>Seller</option>
          </select>
        </div>
        <div class="form-group"><label for="loginEmail">Email</label><input id="loginEmail" name="email" type="email" autocomplete="email" required></div>
        <div class="form-group"><label for="loginPassword">Password</label><input id="loginPassword" name="password" type="password" autocomplete="current-password" required></div>
        <button class="btn" type="submit">Login</button>
      </form>
      <p class="hint">No account yet? <a href="#register">Create an account</a>.</p>
      <p class="hint">Passwords are stored in localStorage for this prototype only. This is not production-level security.</p>
    </section>`;

    app.querySelector("#loginForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const email = String(form.get("email")).trim();
      const password = String(form.get("password"));
      const role = String(form.get("accountType"));
      const existing = readList("users").find((user) => String(user.email || "").toLowerCase() === email.toLowerCase());
      if (!existing) {
        showMessage("Email not found. Please register first.");
        return;
      }
      if (existing.role !== role) {
        showMessage(role === "buyer" ? "Please select the account type matching your Buyer account." : "Please select the account type matching your Seller account.");
        return;
      }
      if (existing.password !== password) {
        showMessage("Invalid email or password.");
        return;
      }
      localStorage.setItem("loggedInUser", JSON.stringify(existing));
      localStorage.setItem(role === "seller" ? "loggedInSeller" : "loggedInBuyer", JSON.stringify(existing));
      location.href = role === "seller" ? "seller.html" : "buyer.html";
    });
  }

  function registerView() {
    const seller = registerRole === "seller";
    document.title = "Register — LocalBess Hub";
    app.classList.add("register-view");
    app.innerHTML = `<section class="auth-wrap register-wrap">
      <p class="page-back"><a class="back-link" href="#login">← Back to Login</a></p>
      <h2>Create an account</h2>
      <p class="muted">Register first. After your account is saved, you can login.</p>
      <div class="role-pick">
        <div class="role-card ${seller ? "" : "active"}" data-reg-role="buyer" role="button" tabindex="0" aria-pressed="${!seller}"><strong>Buyer</strong><p class="muted">Browse, favorite, and buy from local shops.</p></div>
        <div class="role-card ${seller ? "active" : ""}" data-reg-role="seller" role="button" tabindex="0" aria-pressed="${seller}"><strong>Seller</strong><p class="muted">Join an existing shop, add products, and manage customer orders.</p></div>
      </div>
      <form id="registerForm">
        <div class="form-grid">
          <div class="form-group"><label for="registerFullName">Full Name</label><input id="registerFullName" name="fullName" autocomplete="name" required></div>
          <div class="form-group"><label for="registerEmail">Email</label><input id="registerEmail" name="email" type="email" autocomplete="email" required></div>
          <div class="form-group"><label for="registerPassword">Password</label><input id="registerPassword" name="password" type="password" autocomplete="new-password" minlength="6" required></div>
          <div class="form-group"><label for="registerConfirm">Confirm Password</label><input id="registerConfirm" name="confirm" type="password" autocomplete="new-password" required></div>
          <div class="form-group"><label for="registerContact">Contact Number</label><input id="registerContact" name="contact" autocomplete="tel" required></div>
          <div class="form-group"><label>Account Type</label><input name="accountType" value="${seller ? "Seller" : "Buyer"}" readonly></div>
          <div class="form-group"><label for="registerStreet">Street / Area</label><input id="registerStreet" name="street" placeholder="Poblacion" required></div>
          <div class="form-group"><label for="registerBarangay">Barangay</label><input id="registerBarangay" name="barangay" placeholder="Talabaan" required></div>
          <div class="form-group"><label for="registerMunicipality">Municipality</label><input id="registerMunicipality" name="municipality" value="Mamburao" required></div>
          <div class="form-group"><label for="registerProvince">Province</label><input id="registerProvince" name="province" value="Occidental Mindoro" required></div>
          ${seller ? `<div class="form-group full"><label for="registerShop">Existing Shop</label>
            <select id="registerShop" name="shopId" required>
              <option value="">Choose a shop</option>
              ${readList("shops").map((shop) => `<option value="${escapeHtml(shop.id)}">${escapeHtml(shop.name)}</option>`).join("")}
            </select>
            <small class="muted">Your seller account will be connected to the shop you choose.</small>
          </div>` : ""}
        </div>
        <button class="btn" type="submit">Create Account</button>
      </form>
    </section>`;

    const selectRole = (role) => {
      registerRole = role;
      registerView();
    };
    app.querySelectorAll("[data-reg-role]").forEach((card) => {
      card.addEventListener("click", () => selectRole(card.getAttribute("data-reg-role")));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectRole(card.getAttribute("data-reg-role"));
        }
      });
    });

    app.querySelector("#registerForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const password = String(form.get("password"));
      const confirm = String(form.get("confirm"));
      if (password !== confirm) {
        showMessage("Passwords do not match.");
        return;
      }

      const email = String(form.get("email")).trim();
      const allUsers = readList("users");
      if (allUsers.some((user) => String(user.email || "").toLowerCase() === email.toLowerCase())) {
        showMessage("An account with this email already exists.");
        return;
      }

      const userId = "u-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const address = {
        street: String(form.get("street")).trim(),
        barangay: String(form.get("barangay")).trim(),
        municipality: String(form.get("municipality")).trim(),
        province: String(form.get("province")).trim()
      };
      const user = {
        id: userId,
        role: registerRole,
        fullName: String(form.get("fullName")).trim(),
        username: email,
        email,
        password,
        contact: String(form.get("contact")).trim(),
        address,
        savedAddresses: [{
          id: "addr-1-" + userId,
          label: "Default Address",
          fullName: String(form.get("fullName")).trim(),
          contact: String(form.get("contact")).trim(),
          ...address,
          isDefault: true
        }],
        avatar: ""
      };

      if (registerRole === "seller") {
        const shop = readList("shops").find((item) => item.id === String(form.get("shopId")));
        if (!shop) {
          showMessage("Please choose an existing shop.");
          return;
        }
        user.sellerType = "Local Seller";
        user.businessName = shop.name;
        user.businessDesc = shop.description;
        user.businessLocation = shop.location;
        user.shopId = shop.id;
      }

      allUsers.push(user);
      localStorage.setItem("users", JSON.stringify(allUsers));
      showMessage("Account saved. Please login to continue.");
      location.hash = "#login";
    });
  }

  function render() {
    const view = location.hash.slice(1).split("/")[0];
    if (view === "register") registerView();
    else loginView();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!location.hash) location.hash = "#login";
    render();
    window.addEventListener("hashchange", render);
  });
})();

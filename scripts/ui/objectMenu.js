export function initObjectMenu(onSelect) {
  const menu = document.getElementById("object-menu");
  const toggle = document.getElementById("object-menu-toggle");
  const list = document.getElementById("object-menu-list");

  if (!menu || !toggle || !list) return;

  const setOpen = (isOpen) => {
    menu.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    list.hidden = !isOpen;
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(!menu.classList.contains("is-open"));
  });

  list.addEventListener("click", (event) => {
    event.stopPropagation();
    const button = event.target.closest("[data-object]");
    if (!button) return;

    setOpen(false);
    onSelect(button.dataset.object);
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !menu.classList.contains("is-open")) return;

    setOpen(false);
    toggle.focus();
  });
}

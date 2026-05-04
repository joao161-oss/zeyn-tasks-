// --- CONFIGURAÇÕES DE SIDEBAR ---
const left = document.getElementById("sidebarLeft");
const right = document.getElementById("sidebarRight");
document.getElementById("toggleLeft").onclick = () => left.classList.toggle("closed");
document.getElementById("toggleRight").onclick = () => right.classList.toggle("closed");

// --- ELEMENTOS DOS MODAIS (Fichários/Inputs) ---
const editDateInput = document.getElementById("editDateInput");
const editCategorySelect = document.getElementById("editCategorySelect");
const modal = document.getElementById("editModal");
const editInput = document.getElementById("editInput");
const saveEdit = document.getElementById("saveEdit");
const closeModal = document.getElementById("closeModal");
const deleteTaskBtn = document.getElementById("deleteTask");

const confirmModal = document.getElementById("confirmModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

// --- ELEMENTOS PRINCIPAIS ---
const container = document.getElementById("listsContainer");
const input = document.getElementById("listInput");
const dateInput = document.getElementById("dateInput");
const searchInput = document.getElementById("searchInput");
const btn = document.getElementById("addListBtn");

// --- FILTROS E CATEGORIAS ---
const btnAll = document.getElementById("filterAll");
const btnDone = document.getElementById("filterDone");
const btnPending = document.getElementById("filterPending");
const categoryBtns = document.querySelectorAll(".category-btn");

let myLists = JSON.parse(localStorage.getItem("portfolio_tasks")) || [];
let currentEditIdx = null;
let currentFilter = "all"; 
let selectedCategory = "Geral"; 

function save() {
  localStorage.setItem("portfolio_tasks", JSON.stringify(myLists));
}

// Filtros de Categoria (Sidebar Direita)
categoryBtns.forEach(btn => {
  btn.onclick = () => {
    categoryBtns.forEach(b => b.classList.remove("active-category"));
    btn.classList.add("active-category");
    selectedCategory = btn.getAttribute("data-type");
  };
});

// Filtros de Estado (Sidebar Esquerda)
btnAll.onclick = () => { currentFilter = "all"; render(); };
btnDone.onclick = () => { currentFilter = "done"; render(); };
btnPending.onclick = () => { currentFilter = "pending"; render(); };

// Pesquisa
searchInput.oninput = () => render();

function render() {
  container.innerHTML = "";
  const searchText = searchInput.value.toLowerCase();

  const filteredList = myLists.filter((data) => {
    const matchesFilter = 
      currentFilter === "all" || 
      (currentFilter === "done" && data.completed) || 
      (currentFilter === "pending" && !data.completed);

    const matchesSearch = data.title.toLowerCase().includes(searchText);
    return matchesFilter && matchesSearch;
  });

  filteredList.forEach((data) => {
    const originalIndex = myLists.indexOf(data);
    const listDiv = document.createElement("div");
    listDiv.className = "list";
    listDiv.draggable = true;

    // Drag and Drop
    listDiv.ondragstart = (e) => e.dataTransfer.setData("text/plain", originalIndex);
    listDiv.ondragover = (e) => e.preventDefault();
    listDiv.ondrop = (e) => {
      const fromIdx = e.dataTransfer.getData("text/plain");
      const movedItem = myLists.splice(fromIdx, 1)[0];
      myLists.splice(originalIndex, 0, movedItem);
      save(); render();
    };

    const header = document.createElement("div");
    header.className = "list-header";

    const title = document.createElement("h3");
    title.textContent = data.title;
    if (data.completed) title.classList.add("done");
    title.onclick = () => { data.completed = !data.completed; save(); render(); };

    const dateSpan = document.createElement("span");
    dateSpan.className = "task-date";
    if (data.deadline) {
      const [y, m, d] = data.deadline.split("-");
      dateSpan.textContent = `📅 ${d}/${m}`;
      if (new Date(data.deadline + "T00:00:00") < new Date().setHours(0,0,0,0) && !data.completed) {
        dateSpan.classList.add("overdue");
      }
    }

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = (e) => {
      e.stopPropagation();
      currentEditIdx = originalIndex;
      
      // --- MUDANÇA AQUI: Carrega os dados atuais no Modal ---
      editInput.value = data.title;
      editDateInput.value = data.deadline || "";
      editCategorySelect.value = data.category || "Geral";
      
      modal.style.display = "block";
    };

    const badge = document.createElement("span");
    badge.className = `badge badge-${(data.category || "Geral").toLowerCase()}`;
    badge.textContent = data.category || "Geral";

    header.appendChild(title);
    header.appendChild(dateSpan);
    header.appendChild(editBtn);
    listDiv.appendChild(header);
    listDiv.appendChild(badge);
    container.appendChild(listDiv);
  });
}

btn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;
  myLists.push({ title: text, completed: false, category: selectedCategory, deadline: dateInput.value });
  save(); render();
  input.value = "";
  dateInput.value = "";
};

deleteTaskBtn.onclick = () => confirmModal.style.display = "block";

confirmDelete.onclick = () => {
  myLists.splice(currentEditIdx, 1);
  save(); render();
  confirmModal.style.display = "none"; modal.style.display = "none";
};

cancelDelete.onclick = () => confirmModal.style.display = "none";

// --- MUDANÇA AQUI: Salva todas as novas informações ---
saveEdit.onclick = () => {
  if (editInput.value.trim() !== "" && currentEditIdx !== null) {
    myLists[currentEditIdx].title = editInput.value.trim();
    myLists[currentEditIdx].deadline = editDateInput.value;
    myLists[currentEditIdx].category = editCategorySelect.value;
    
    save(); 
    render(); 
    modal.style.display = "none";
  }
};

closeModal.onclick = () => modal.style.display = "none";

window.onclick = (e) => {
  if (e.target == modal) modal.style.display = "none";
  if (e.target == confirmModal) confirmModal.style.display = "none";
};

render();
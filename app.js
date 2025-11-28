let people = [];
let expenses = [];
let chart = null;

/* ========= SAVE DATA ========= */
function saveData() {
    localStorage.setItem("people", JSON.stringify(people));
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("dark", document.body.classList.contains("dark"));
}

/* ========= LOAD DATA ON START ========= */
window.onload = () => {
    let p = localStorage.getItem("people");
    let e = localStorage.getItem("expenses");
    let d = localStorage.getItem("dark");

    if (p) people = JSON.parse(p);
    if (e) expenses = JSON.parse(e);
    if (d === "true") document.body.classList.add("dark");

    people.forEach(name => {
        personSelect.appendChild(new Option(name, name));
    });

    updatePeopleList();
};

/* ========= DARK MODE ========= */
function toggleDark() {
    document.body.classList.toggle("dark");
    saveData();
}

/* ========= ADD PERSON ========= */
function addPerson() {
    let name = personInput.value.trim();
    if (!name) return alert("Enter a valid name");
    if (people.includes(name)) return alert("Name already exists");

    people.push(name);
    personSelect.appendChild(new Option(name, name));

    saveData();
    personInput.value = "";
    updatePeopleList();
}

/* ========= ADD EXPENSES (with TIMESTAMP) ========= */
function saveExpenses() {
    let person = personSelect.value;
    let raw = amountInput.value;

    if (!person) return alert("Select a person");
    if (!raw.trim()) return alert("Enter expenses");

    let numbers = raw.split("+")
        .map(x => Number(x.trim()))
        .filter(x => x > 0);

    numbers.forEach(n => {
        expenses.push({
            person,
            amount: n,
            time: new Date().toISOString()
        });
    });

    saveData();
    amountInput.value = "";
    updatePeopleList();
}

/* ========= UPDATE MEMBER LIST ========= */
function updatePeopleList() {
    let list = document.getElementById("peopleList");
    list.innerHTML = "";

    people.forEach(p => {
        let exp = expenses.filter(e => e.person === p);
        let total = exp.reduce((a,b)=>a + b.amount, 0);
        let count = exp.length;

        let div = document.createElement("div");
        div.className = "person-item";
        div.innerHTML = `${p} – ₹${total} (${count} items)`;
        div.onclick = () => showDetails(p);

        list.appendChild(div);
    });
}

/* ========= PERSON DETAILS ========= */
function showDetails(person) {
    let box = document.getElementById("personDetails");
    box.classList.remove("hidden");

    document.getElementById("detailName").innerHTML = person;

    let items = expenses.filter(e => e.person === person);
    let total = items.reduce((a,b)=>a + b.amount, 0);

    document.getElementById("detailStats").innerHTML =
        `<b>Total:</b> ₹${total}<br><b>Payments:</b> ${items.length}`;

    let table = document.getElementById("detailTable");
    table.innerHTML = `
        <tr>
            <th>Amount</th>
            <th>Time</th>
            <th>Edit</th>
            <th>Delete</th>
        </tr>
    `;

    items.forEach(e => {
        let index = expenses.indexOf(e);
        let row = table.insertRow();

        row.insertCell(0).innerHTML = "₹" + e.amount;
        row.insertCell(1).innerHTML = new Date(e.time).toLocaleString();

        // EDIT
        let edit = document.createElement("button");
        edit.className = "btn primary";
        edit.innerText = "Edit";
        edit.onclick = () => {
            let updated = prompt("New amount", e.amount);
            if (updated > 0) {
                expenses[index].amount = Number(updated);
                saveData();
                showDetails(person);
                updatePeopleList();
            }
        };
        row.insertCell(2).appendChild(edit);

        // DELETE
        let del = document.createElement("button");
        del.className = "btn accent";
        del.innerText = "Delete";
        del.onclick = () => {
            expenses.splice(index, 1);
            saveData();
            showDetails(person);
            updatePeopleList();
        };
        row.insertCell(3).appendChild(del);
    });
}

/* ========= DATE RANGE FILTER ========= */
function filterByDate(start, end) {
    let s = new Date(start);
    let e = new Date(end);

    return expenses.filter(e2 => {
        let t = new Date(e2.time);
        return t >= s && t <= e;
    });
}

/* ========= SUMMARY ========= */
function calculate() {
    if (expenses.length === 0) return alert("No expenses added!");

    let totals = {};
    people.forEach(p => totals[p] = 0);

    expenses.forEach(e => totals[e.person] += e.amount);

    let grand = Object.values(totals).reduce((a,b) => a + b, 0);
    let avg = grand / people.length;

    let html = `
        <h2>Summary</h2>
        <p><b>Total:</b> ₹${grand}</p>
        <p><b>Average per person:</b> ₹${avg.toFixed(2)}</p>

        <h3>Date Filter</h3>
        <input type="date" id="startDate">
        <input type="date" id="endDate">
        <button class="btn accent wide" onclick="showFiltered()">Show</button>

        <table class="table">
        <tr><th>Name</th><th>Spent</th><th>Difference</th><th>Status</th></tr>
    `;

    people.forEach(p => {
        let diff = totals[p] - avg;
        html += `
            <tr>
                <td>${p}</td>
                <td>₹${totals[p]}</td>
                <td>₹${diff.toFixed(2)}</td>
                <td>${diff >= 0 ? "Paid Extra" : "Needs to Pay"}</td>
            </tr>
        `;
    });

    html += "</table>";
    document.getElementById("analysis").innerHTML = html;

    drawChart(totals);
}

function showFiltered() {
    let s = document.getElementById("startDate").value;
    let e = document.getElementById("endDate").value;

    if (!s || !e) return alert("Select both dates");

    let filtered = filterByDate(s, e);
    let total = filtered.reduce((a,b) => a + b.amount, 0);

    document.getElementById("analysis").innerHTML +=
        `<h3>Filtered Total: ₹${total}</h3>`;
}

/* ========= CHART ========= */
function drawChart(totals) {
    let ctx = document.getElementById("chart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(totals),
            datasets: [{
                label: "Amount Spent",
                data: Object.values(totals),
                backgroundColor: ["#6c5ce7", "#00cec9", "#fd79a8", "#ffeaa7"]
            }]
        }
    });
}

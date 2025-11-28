let rentData = JSON.parse(localStorage.getItem("rentData") || "[]");
let people = JSON.parse(localStorage.getItem("people") || "[]");

/* Populate people dropdown */
let rentPersonSelect = document.getElementById("rentPersonSelect");
people.forEach(p => rentPersonSelect.appendChild(new Option(p, p)));

/* Dark mode */
window.onload = () => {
    let d = localStorage.getItem("dark");
    if(d==="true") document.body.classList.add("dark");
    filterByYear();
};

function toggleDark() {
    document.body.classList.toggle("dark");
    localStorage.setItem("dark", document.body.classList.contains("dark"));
}

/* Add Payment */
function addPayment() {
    let person = rentPersonSelect.value;
    let type = document.getElementById("paymentType").value;
    let amount = Number(document.getElementById("paymentAmount").value);
    let month = document.getElementById("paymentMonth").value;
    let year = Number(document.getElementById("paymentYear").value);

    if(!person || !amount || !month || !year) return alert("Enter all fields");

    rentData.push({
        person, type, amount, month, year, time: new Date().toISOString()
    });

    localStorage.setItem("rentData", JSON.stringify(rentData));
    document.getElementById("paymentAmount").value = "";
    filterByYear();
}

/* Generate month tables */
function filterByYear() {
    let year = Number(document.getElementById("filterYear").value);
    let months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    let container = document.getElementById("monthTables");
    container.innerHTML = "";

    ["Room Rent","Electricity"].forEach(type=>{
        let html = `<h3>${type} - ${year}</h3><table class="table"><tr><th>Month</th>`;
        people.forEach(p=> html+=`<th>${p}</th>`); html+="</tr>";

        months.forEach(month=>{
            html+=`<tr><td>${month}</td>`;
            people.forEach(p=>{
                let entry = rentData.filter(r=>r.person===p && r.type===type && r.month===month && r.year===year);
                if(entry.length>0){
                    html+=`<td>₹${entry.reduce((a,b)=>a+b.amount,0)} <br> Paid</td>`;
                } else {
                    html+=`<td>Not Paid</td>`;
                }
            });
            html+="</tr>";
        });

        html+="</table>";
        container.innerHTML+=html;
    });
}

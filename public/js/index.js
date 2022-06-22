const data = JSON.parse(document.getElementById('data').innerText)['data']

let moyennes = []
let nom_moyennes = []
let data_moyenne = []

Object.keys(data).forEach(key => {

    const moyenne_eleve = data[key][0].toString()
    data_moyenne.push({
        "nom": key,
        "note": moyenne_eleve
    })
    const div = document.createElement('div')
    div.classList.add('cellule')
    const grille = document.getElementById('grille-principale')
    const titre_matière = document.createElement('h4')
    titre_matière.appendChild(document.createTextNode(key + ` - [${moyenne_eleve.replace('.', ',')}]`))
    const canvas = document.createElement('canvas')
    div.appendChild(titre_matière)
    div.appendChild(canvas)
    grille.appendChild(div)


    data[key].shift()

    let data_eleve = []
    let data_classe = []

    if (data[key].length == 1) {
        data[key].push(data[key][0])
    }

    for (i = 0; i < data[key].length; i++) {
        data_eleve.push(data[key][i][0])
    }

    let label = []
    for (i = 0; i < data[key].length; i++) {
        data_classe.push(data[key][i][1])
        let state = i + 1
        label.push("Note n°" + state.toString())
    }

    const ctx = canvas.getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: label,
            datasets: [{
                label: "Notes de l'élève",
                data: data_eleve.reverse(),
                backgroundColor: [
                    'rgba(54, 162, 235, 1)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1.5
            },
            {
                label: "Notes moyenne de la classe",
                data: data_classe.reverse(),
                backgroundColor: [
                    '#7d7d7d',
                ],
                borderColor: [
                    '#7d7d7d',
                ],
                borderWidth: 1.5
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 20
                }
            }
        }
    });

})

data_moyenne.sort((a, b) => a.note - b.note)

data_moyenne.forEach((value) => {
    moyennes.push(value["note"])
    nom_moyennes.push(value["nom"])
})

const canvas_ = document.getElementById('moyenne-g')
const ctx = canvas_.getContext('2d');
const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: nom_moyennes,
        datasets: [{
            data: moyennes,
            backgroundColor: [
                'rgba(54, 162, 235, 1)',
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1.5
        }]
    },
    options: {
        plugins: {
            legend: {
                display: false
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 20
            }
        }
    }
});


function toogledarkmode() {
    const btn = document.getElementById("dark-mode")
    if (btn.classList.contains('dark')) {
        btn.innerHTML = `<i class="bi bi-brightness-high-fill"></i>`
        btn.classList.remove('dark')
        btn.classList.add('light')
    }
    else {
        btn.innerHTML = `<i class="bi bi-moon-stars-fill"></i>`
        btn.classList.remove('light')
        btn.classList.add('dark')
    }
    document.body.classList.toggle('light')
    document.querySelectorAll("h3").forEach((e) => {
        e.classList.toggle('light')
    })
    document.querySelectorAll("h4").forEach((e) => {
        e.classList.toggle('light')
    })
}
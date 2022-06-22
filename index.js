const puppeteer = require("puppeteer")
const express = require('express')
const app = express()
const fs = require('fs')
const port = 80
let data_test = ''
const dev_mode = true

if (dev_mode == true) {
    data_test = fs.readFileSync("resultat.html", 'utf-8')
}

app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/', express.static(__dirname + '/public/'))

app.listen(port, () => {
    console.log('[*] - Application Web UP !')
})

app.get('/', (req, res) => {
    res.render(`${__dirname}/public/index.ejs`, {})
})

app.post('/data', async (req, res) => {
    console.log(`[*] - Nouvelle requête de *${req.body.username}*`)
    try {
        let data, nom_prenom, source, resultat, moyenne_g_eleve, moyenne_g_classe
        if (dev_mode == true) {
            data = analyse(data_test)[0]
            nom_prenom = analyse(data_test)[1]
            moyenne_g_eleve = analyse(data_test)[2]
            moyenne_g_classe = analyse(data_test)[3]
        }
        else {
            source = await scrapping(req.body.username, req.body.password)
            resultat = analyse(source)
            data = resultat[0]
            nom_prenom = resultat[1]
            moyenne_g_eleve = resultat[2]
            moyenne_g_classe = resultat[3]
        }
        res.render(`${__dirname}/public/graph.ejs`, {
            data: {
                data
            }, nom_prenom, moyenne_g_eleve, moyenne_g_classe
        })
    }
    catch (e) {
        res.render(`${__dirname}/public/index.ejs`, {})
    }
})


async function scrapping(username, password) {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto("https://ent.netocentre.fr/cas/login?service=https:%2F%2F0370035M.index-education.net%2Fpronote%2Feleve.html&idpId=parentEleveEN-IdP", { waitUntil: "networkidle2" })
    await page.$eval('button#bouton_eleve', el => el.click())
    await page.type("#username", username)
    await page.type("#password", password)
    await page.$eval('button[id=bouton_valider]', el => el.click())
    await page.waitForSelector("#id_78id_33")
    await page.$eval('i[id=id_78id_33]', el => el.click())
    await page.waitForSelector(".GrandEspaceGauche")
    let source = await page.evaluate(() => document.querySelector('*').outerHTML);
    await browser.close()
    // fs.writeFile("resultat.html", source, () =>{})
    return source
}

function analyse(source) {
    const notes = {}
    let multiplier = 1
    let moyenne = 0
    let matiere = ''
    let moyenne_g_eleve = source.split('Moyenne générale élève : <span>')[1]
    moyenne_g_eleve = moyenne_g_eleve.split('</span>')[0]
    let moyenne_g_classe = source.split('Moyenne générale classe : <span>')[1]
    moyenne_g_classe = moyenne_g_classe.split('</span>')[0]

    // pour avoir les moyennes générales en float si besoin 👇
    // moyenne_g_classe = moyenne_g_classe.replace(',', '.')
    // moyenne_g_classe = parseFloat(moyenne_g_classe)
    // moyenne_g_eleve = moyenne_g_eleve.replace(',', '.')
    // moyenne_g_eleve = parseFloat(moyenne_g_eleve)



    let username = source.split('aria-label="Espace Élèves - ')[1]
    username = username.split(' Pour utiliser les raccourc')[0]
    source = source.split('<div id="GInterface.Instances[2].Instances[1]_1')
    source.shift()
    source.forEach(element => {
        let multiplier = 1
        moyenne = -1
        element = element.split('<div style="float: right;">')[1]
        if (element.includes('/5</span></div>')) {
            multiplier = 4
        }
        if (element.includes('/10</span></div>')) {
            multiplier = 2
        }
        if (element.includes('/25</span></div>')) {
            multiplier = 0.8
        }

        if (element.includes('<div class="AlignementDroit">')) {
            if (element.includes('<div class="GrandEspaceGauche">Moy. classe')) {
                moyenne = element.split('<div class="GrandEspaceGauche">Moy. classe : ')[1]
                moyenne = moyenne.split('<')[0]
                moyenne = moyenne.replace(',', '.')
            }
            if (element.includes('<div class="GrandEspaceGauche">Moy. groupe')) {
                moyenne = element.split('<div class="GrandEspaceGauche">Moy. groupe :')[1]
                moyenne = moyenne.split('<')[0]
                moyenne = moyenne.replace(',', '.')
            }
            element = element.split('>')[1]
            element = element.split('<')[0]
            element = element.replace(',', '.')
            notes[matiere].push([Math.round(element * multiplier * 100) / 100, Math.round((parseFloat(moyenne) * multiplier) * 100) / 100])
        }
        else {
            // moyenne élève matière
            matiere = element.split('<div>')[1]
            matiere = matiere.split('</div')[0]
            matiere = matiere.replace('&amp;', '&')
            element = element.split('<')[0]
            element = element.replace(',', '.')
            notes[matiere] = [parseFloat(element)]
        }
    })
    return [notes, username, moyenne_g_eleve.trim(), moyenne_g_classe.trim()]
}


// scrapping().then((a) =>{
//     // fs.writeFileSync("resultat.html", a, ()=>{})
//     analyse(a)
// })
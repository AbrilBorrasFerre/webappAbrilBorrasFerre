function canvia_seccio(num_boto) {
    const menu = document.getElementById("menu");
    const num_botons = menu.children.length;    // el nombre de botons dins de l'element "menu"
    for (let i = 1; i < num_botons; i++) {
        let boto = document.getElementById("boto_" + i);
        let seccio = document.getElementById("seccio_" + i);
        if (i == num_boto) {
            boto.style.color = "#950E17";    // es destaca la secció activa amb el canvi de colors del botó corresponent
            boto.style.backgroundColor = "#FCDEE0";
            seccio.style.display = "flex";    // es fa visible la secció activa
        }
        else {
            boto.style.color = "white";    // colors dels botons de seccions inactives
            boto.style.backgroundColor = "#950E17";
            seccio.style.display = "none";    // s'oculten les seccions inactives
        }
    }
}

let validat = false;    // variable que permet saber si hi ha algun usuari validat
let nom, contrasenya;
let scriptURL = "https://script.google.com/macros/s/AKfycbzZmt6tt-4-EBVbDOeoz1eTS6aw2Dfpd74hXBmQK93ydk0C9CGaSDPgIkwmVz7aDppIgw/exec"    // s'ha de substituir la cadena de text per la URL del script

function inici_sessio() {
    nom = document.getElementById("nom_usuari").value;    // la propietat "value" d'un quadre de text correspon al text escrit per l'usuari
    contrasenya = document.getElementById("contrasenya").value;
    let consulta = scriptURL + "?query=select&where=usuari&is=" + nom + "&and=contrasenya&equal=" + contrasenya;
    fetch(consulta)
        .then((resposta) => {   // registres que contenen el nom d'usuari i contrasenya escrits per l'usuari
            return resposta.json();    // conversió a llista
        })
        .then((resposta) => {
            if(resposta.length == 0) {    // llista buida
                window.alert("El nom d'usuari o la contrasenya no són correctes.");
            }
            else {    // llista amb (almenys) un registre
                window.alert("S'ha iniciat correctament la sessió.");
                inicia_sessio();    // usuari validat, s'executen les instruccions del procediment "inicia_sessio"
            }
        });    
}

function inicia_sessio() {
    validat = true;    // usuari validat
    document.getElementById("seccio_0").style.display = "none";    // s'oculta la secció de validació d'usuaris
    canvia_seccio(1);    // es mostra la secció 1
}

function nou_usuari() {
    nom = document.getElementById("nom_usuari").value;
    contrasenya = document.getElementById("contrasenya").value;
    let consulta_1 = scriptURL + "?query=select&where=usuari&is=" + nom;    // primera consulta per saber si ja existeix algun usuari amb el nom escrit per l'usuari que es vol registrar
    fetch(consulta_1)
        .then((resposta) => {
            return resposta.json();
        })
        .then((resposta) => {
            if(resposta.length == 0) {    // No hi ha cap altres usuari amb el mateix nom
                let consulta_2 = scriptURL + "?query=insert&values=" + nom + "$$" + contrasenya;    // segona consulta per registrar l'usuari nou
                fetch(consulta_2)
                    .then((resposta) => {
                        if (resposta.ok) {    // s'ha pogut afegir una registre en la base de dades
                            window.alert("S'ha completat el registre d'usuari.")
                            inicia_sessio();
                        }
                        else {    // no s'ha pogut afegir un registre en la base de dades
                            alert("S'ha produït un error en el registre d'usuari.")
                        }
                    })
            } 
            else {    // l'usuari ha de tornar-ho a intentar amb un nom diferent
                alert("Ja existeix un usuari amb aquest nom.");
            }
        });
}

function tanca_sessio() {
    if (validat) {
        if (confirm("Vols tancar la sessió?")) {    // S'ha respost "Sí"
            storage.setItem("usuari", "");
            location.reload();    // recàrrega de la pàgina, es reinicialitzen totes les variables
        }
    }
}

window.onload = () => { 
    let base_de_dades = storage.getItem("base_de_dades");   
    if(base_de_dades == null) {
        indexedDB.open("Dades").onupgradeneeded = event => {   
            event.target.result.createObjectStore("Fotos", {keyPath: "ID", autoIncrement:true}).createIndex("Usuari_index", "Usuari");
        }    // les fotos es desen a la taula "Fotos"
        storage.setItem("base_de_dades","ok");
    }
    document.getElementById("obturador").addEventListener("change", function() {    // procediment que s'executa quan s'obté el fitxer de la foto realitzada (esdeveniment "change")
        if(this.files[0] != undefined) {    // instruccions que s'executen només si s'obté algun fitxer (només es processa el primer que es rebi)
            let canvas = document.getElementById("canvas");    // contenidor on es desa temporalment la imatge
            let context = canvas.getContext("2d");
            let imatge = new Image;
            imatge.src = URL.createObjectURL(this.files[0]);    // es crea la imatge a partir del fitxer
            imatge.onload = () => {    // procediment que s'executa un cop la imatge s'ha carregat en el contenidor
                canvas.width = imatge.width;
                canvas.height = imatge.height;                
                context.drawImage(imatge,0,0,imatge.width,imatge.height);    // es "dibuixa" la imatge en el canvas
                document.getElementById("foto").src = canvas.toDataURL("image/jpeg");    // la imatge es mostra en format jpg
                document.getElementById("icona_camera").style.display = "none";    // s'oculta la icona que hi havia abans de fer la foto
                document.getElementById("desa").style.display = "unset";    // es mostra el botó per desar la foto
            }
        }
    });
}
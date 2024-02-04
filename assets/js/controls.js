//  Acessando Servidor Socket Local
var socket = io('http://192.168.100.86:3000');
const authToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlNhdCBBcHIgMTEgMjAyMCAwMzoxNDozMiBHTVQrMDAwMC5qb25hdGFzMTJhcG9zdG9saWNvQGdtYWlsLmNvbSIsImlhdCI6MTU4NjU3NDg3Mn0.PG8AsYYoN7q3ZPgoCulj9UPiTIaLkOw_RNlcY4_XFEw'; //Insira o Token de Autenticação aqui
 // Obtendo acesso à API
const api = axios.create({
    baseURL: 'https://www.abibliadigital.com.br/api/',
    headers: { 'Authorization': authToken }
});

window.addEventListener('DOMContentLoaded', () => {
    // Enviar para Tela

    // Obtendo variáveis da janela BrowserWindow
    let version = document.getElementById('version');
    let book = document.getElementById('book');
    let chapter = document.getElementById('chapter');
    let verse = document.getElementById('verse');
    let prevVerse = document.getElementById('prevVerse');
    let nextVerse = document.getElementById('nextVerse');
    let screen = document.getElementById('screen');

    //Adicionando Eventos
    book.addEventListener('change', changeBook);
    chapter.addEventListener('change', changeChapter);
    verse.addEventListener('change', changeVerse);
    version.addEventListener('change', sendVerse);
    screen.addEventListener('click', toogleScreen);
    
    // Obtendo Lista de Livros
    api.get('books')
    .then(({ data }) => {
        books = '';
        data.map(({ name, abbrev }) => {
            books += `<option value=${abbrev.pt}>${name}</option>`
        });
        book.innerHTML += books;
        changeBook();
    });

    // Função ChangeBook - Mudar de Livro
    function changeBook(option){
        // Obtendo Lista de Capítulos
        api.get(`books/${book.value}`)
            .then(({ data }) => {
                let { chapters } = data;
                chapter.innerHTML = '';
                for(let i = 1; i <= chapters; i++){
                    if(i == 1){
                        chapter.innerHTML += `<option value=${i} selected>${i}</option>`
                    }else{
                        chapter.innerHTML += `<option value=${i}>${i}</option>`
                    }
                }
                if(option == 'prev'){ 
                    chapter.value = chapters;
                    changeChapter(option);
                }else if(option == 'next' || option == 'change'){
                    changeChapter(option);
                }else{
                    changeChapter();
                }
            });
    }

    // Função ChangeChapter - Mudar Capítulo
    function changeChapter(option){
        // Obtendo Lista de Versículos
        api.get(`verses/${version.value}/${book.value}/${chapter.value}`)
            .then(({ data }) => {
                let { chapter } = data;
                var { verses } = chapter;
                verse.innerHTML = '';
                for(let i = 1; i <= verses; i++){
                    if(i == 1){
                        verse.innerHTML += `<option value=${i} selected>${i}</option>`
                    }else{
                        verse.innerHTML += `<option value=${i}>${i}</option>`
                    }
                }
                if(option == 'prev'){
                    verse.value = verses;
                    changeVerse(option);
                }else if(option == 'next' || option == 'change'){
                    changeVerse(option);
                }
                changeVerse();
            });
    }

    // Função ChangeVerse - Mudar Versículo
    function changeVerse(option){
        // Mostrando no Controle
        let actualVerse = document.getElementById('actualVerse');
        actualVerse.innerHTML = `${book.options[book.selectedIndex].text} ${chapter.value}:${verse.value}`;
        if(option == 'prev' || option == 'next' || option == 'change'){
            sendVerse();
        }
    }

    // Adicionando Evento prevVerse - Versículo Anterior
    prevVerse.addEventListener('click', () => {
        let actualBook = parseInt(book.options.selectedIndex);
        let actualChapter = parseInt(chapter.value);
        let actualVerse = parseInt(verse.value);
        if(actualVerse > 1){
            verse.value = actualVerse - 1;
            changeVerse('change');
        }
        else if((actualBook > 0) && (actualChapter  == 1) && (actualVerse  == 1)){
            book.options.selectedIndex = actualBook - 1;
            changeBook('prev');
        }
        else if((actualChapter > 1) && (actualVerse == 1)){
            chapter.value = actualChapter - 1;
            changeChapter('prev');
        }
    });

    // Adicionando Evento nextVerse - Próximo Versículo
    nextVerse.addEventListener('click', () => {
        let actualBook = parseInt(book.options.selectedIndex);
        let actualChapter = parseInt(chapter.value);
        let actualVerse = parseInt(verse.value);
        if(actualVerse < verse.length){
            verse.value = actualVerse + 1;
            changeVerse('change');
        }
        else if((actualBook < book.length - 1) && (actualChapter == chapter.length) && (actualVerse  == verse.length)){
            book.options.selectedIndex = actualBook + 1;
            changeBook('next');
        }
        else if((actualChapter < chapter.length) && (actualVerse  == verse.length)){
            chapter.value = actualChapter + 1;
            changeChapter('next');
        }
    });

    // Função sendVerse - Mandar para http://localhost:3000/BibliaOBS via Socket.io
    function sendVerse(){
        api.get(`verses/${version.value}/${book.value}/${chapter.value}/${verse.value}`)
        .then(({ data }) => {
            var { text } = data;
            let showVerse = {
                book: book.options[book.selectedIndex].text,
                chapterNumber: chapter.value,
                verseNumber: verse.value,
                verse: text,
                animation: 'animate__fadeIn'
            }
            socket.emit('showVerse', showVerse);
        });
    }

    let screenStatus = false;
    function toogleScreen(){
        if(screenStatus){
            screen.innerHTML = 'Mostrar na Tela <i class="mx-1 fas fa-tv"></i>';
            socket.emit('toggleVerse',{animation: 'animate__fadeOutDown'});
            screenStatus = false;
        }
        else{
            screen.innerHTML = 'Limpar a Tela <i class="mx-1 fas fa-eraser"></i>';
            sendVerse();
            socket.emit('toggleVerse',{animation: 'animate__fadeInUp'});
            screenStatus = true;
        }
    }

    //Estilos da Tela

    // Obtendo variáveis da janela BrowserWindow
    let backgroundColor = document.getElementById('backgroundColor');
    let fontWeight = document.getElementById('fontWeight');
    let textSize = document.getElementById('textSize');
    let sendStyle = document.getElementById('sendStyle');
    let textColor = document.getElementById('textColor');
    let textAlign = document.getElementById('textAlign');
    let font = document.getElementById('font');

    // Função para gerar JSON de Estilo

    function getStyle(){
        return {
            backgroundColor: backgroundColor.value,
            color: textColor.value,
            fontSize: textSize.value,
            textAlign: textAlign.value,
            fontFamily: `"${font.value}"`,
            fontWeight: fontWeight.value
        };
    }

    // Adicionando Evento sendStyle - Mandar para http://localhost:3000/BibliaOBS via Socket.io
    sendStyle.addEventListener('click', () => {
        socket.emit('style', getStyle());
    });
    saveStyle.addEventListener('click', () => {
        localStorage.setItem('styles', JSON.stringify(getStyle()));
    });
    loadStyle.addEventListener('click', () => {
        let styles = JSON.parse(localStorage.getItem('styles'));
        backgroundColor.value = styles.backgroundColor;
        textColor.value = styles.color;
        textSize.value = styles.fontSize;
        textAlign.value = styles.textAlign;
        font.value = styles.fontFamily.replace(/"/g,'');
        fontWeight.value = styles.fontWeight;
    });
});
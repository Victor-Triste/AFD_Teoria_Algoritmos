let diagrama = null;
let nodoInicialAutomata = null;
let nodosFinalesAutomata = null;
let alfabetoAutomata = null;
let nodosAutomata = null;
let proveniencia_datos = "formulario";
let transicionesAutomata = [];

/**
 * Permite generar los resultados en base a los datos de entrada proporcionado.
 */
function generateResults() {
  let inputs = document.querySelectorAll('.input-dinamico');
  let bandera = false

  inputs.forEach(input => {
    if (input.value === '') {
      bandera = true;
      return;
    }
  });

  if (!bandera) {
    let nodo_inicial = document.getElementById("nodo_inicial").value;
    let nodos_finales_string = document.getElementById("nodos_finales").value;
    let nodos_string = document.getElementById("num_nodos").value;
    let alfabeto_string = document.getElementById("alfabeto").value;

    let lista_nodos = nodos_string.split(",");
    let lista_alfabeto = alfabeto_string.split(",").map(item => item.toUpperCase());

    let lista_nodos_finales = nodos_finales_string.split(",");

    if (lista_nodos.length === 0 && lista_alfabeto.length === 0 && lista_nodos_finales.length === 0 && nodo_inicial.length === 0) {
      showNotification('alert-error', "/static/images/icon-error.svg", "Por favor ingrese todos los datos de entrada solicitados.");
    } else {
      nodosAutomata = lista_nodos;
      alfabetoAutomata = lista_alfabeto;
      nodoInicialAutomata = nodo_inicial;
      nodosFinalesAutomata = lista_nodos_finales;
      let inputsTransiciones = document.getElementsByClassName('input-dinamico');

      cleanInput("cadena_prueba");
      setStateComponent("cadena_prueba", false);
      setStateComponent("btn_test_string", false);

      removeComponent("notify_table_empty");
      removeComponent("notify_graph_empty");

      relaciones = createTable(lista_nodos, alfabetoAutomata, inputsTransiciones, nodo_inicial, lista_nodos_finales);
      crearGrafo(lista_nodos, relaciones, nodo_inicial, lista_nodos_finales);
      showNotification('alert-success', "static/images/icon-success.svg", "¡Excelente! Los resultados se encuentran en la parte inferior.");
    }
  } else {
    showNotification('alert-error', "/static/images/icon-error.svg", "Por favor ingrese todos los datos de entrada solicitados.");
  }
}

/**
 * Permite personalizar un mensaje de notificación para posteriormente mostrarlo y ocultarlo después de 3 segundos. 
 * @param {String} type La clase de Tailwind CSS para mostrar el tipo de mensaje que se desee (info, warnning, error).
 * @param {String} iconURL La ruta del icono a mostrar
 * @param {String} message El mensaje que se le desea mostrar al usuario.
 */
function showNotification(type, iconURL, message) {
  let div = document.getElementById("message");

  let atributeImage = div.querySelector("img");
  atributeImage.setAttribute("src", iconURL);

  let atributeSpan = div.querySelector('span');
  div.classList.add(type)
  div.classList.remove('hidden');
  atributeSpan.textContent = message;

  setTimeout(function () {
    div.classList.add('hidden');
    div.classList.remove(type);
  }, 3000);
}

/**
 * Permite generar de forma dinámica los Inputs HTML en donde el usuario proporcionará esta información
 */
function generateTransitions() {
  let nodo_inicial = document.getElementById("nodo_inicial").value;
  let nodos_finales_string = document.getElementById("nodos_finales").value;
  let nodos_string = document.getElementById("num_nodos").value;
  let alfabeto_string = document.getElementById("alfabeto").value;

  let lista_nodos = nodos_string.split(",");
  let lista_alfabeto = alfabeto_string.split(",").map(item => item.toUpperCase());
  let lista_nodos_finales = nodos_finales_string.split(",");

  if (!!lista_nodos && !!lista_alfabeto && !!lista_nodos_finales && !!nodo_inicial) {
    let lista_transiciones = [];

    for (let nodo of lista_nodos) {
      for (let letra of lista_alfabeto) {
        lista_transiciones.push(nodo + ',' + letra);
      }
    }

    let contenedorTransiciones = document.getElementById('content_transitions');
    contenedorTransiciones.innerHTML = '';
    if (proveniencia_datos == "archivo") {

      for (let i = 0; i < lista_transiciones.length; i++) {
        div = generateInputTransitionHTML(lista_transiciones[i], lista_transiciones[i].split(',')[0], transicionesAutomata[i])
        contenedorTransiciones.appendChild(div);
      }
    } else {
      for (let i = 0; i < lista_transiciones.length; i++) {
        div = generateInputTransitionHTML(lista_transiciones[i], lista_transiciones[i].split(',')[0], null)
        contenedorTransiciones.appendChild(div);
      }
    }

    setStateComponent("btn_processing_data", false);

  } else {
    showNotification('alert-error', "/static/images/icon-error.svg", "Por favor ingrese todos los datos de entrada solicitados.");
  }
}

/**
 * Permite crear la tabla de transiciones de acuerdo con la información proporcionada
 * @param {*} nodos 
 * @param {*} alfabeto 
 * @param {*} transiciones 
 * @param {*} nodoInicio 
 * @param {*} arrayNodosFinales 
 * @returns 
 */
function createTable(nodos, alfabeto, transiciones, nodoInicio, arrayNodosFinales) {
  let contenedorTabla = document.getElementById('table');
  let tabla = document.createElement('table');
  let thead = document.createElement('thead');
  let tbody = document.createElement('tbody');

  contenedorTabla.innerHTML = '';
  tabla.classList.add('table', 'border-collapse', 'border', 'border-slate-400');

  let headerRow = document.createElement('tr');
  headerRow.appendChild(document.createElement('th'));

  for (let i = 0; i < alfabeto.length; i++) {
    let th = document.createElement('th');
    th.classList.add("border", "border-slate-300");
    th.textContent = alfabeto[i];
    headerRow.appendChild(th);
  }

  thead.appendChild(headerRow);

  relaciones = createTableBody(nodos, alfabeto, transiciones, nodoInicio, arrayNodosFinales, tbody);

  tabla.appendChild(thead);
  tabla.appendChild(tbody);
  contenedorTabla.appendChild(tabla);
  return relaciones
}

function createTableBody(nodos, alfabeto, transiciones, nodoInicio, arrayNodosFinales, tbody) {
  let relaciones = [];

  for (let i = 0; i < nodos.length; i++) {
    let row = document.createElement('tr');
    let nodeCell = document.createElement('td');
    nodeCell.classList.add("border", "border-slate-300");
    if (nodos[i] == nodoInicio && arrayNodosFinales.includes(nodos[i])) {
      nodeCell.textContent = '--> *' + nodos[i];
    } else if (nodos[i] == nodoInicio) {
      nodeCell.textContent = '-->' + nodos[i];
    } else if (arrayNodosFinales.includes(nodos[i])) {
      nodeCell.textContent = '*' + nodos[i];
    } else {
      nodeCell.textContent = nodos[i];
    }

    row.appendChild(nodeCell);

    for (let j = 0; j < alfabeto.length; j++) {
      let td = document.createElement('td');
      let inputName = nodos[i] + ',' + alfabeto[j];
      let correspondingInput = findCorrespondingInput(transiciones, inputName);
      td.classList.add("border", "border-slate-300");
      if (correspondingInput) {

        if (arrayNodosFinales.includes(correspondingInput.value)) {
          td.textContent = '*' + correspondingInput.value;
        } else {
          td.textContent = correspondingInput.value;
        }
      }

      let tupla = [nodos[i], correspondingInput.value, alfabeto[j]];
      relaciones.push(tupla);

      row.appendChild(td);
    }

    tbody.appendChild(row);
  }

  return relaciones;
}

function findCorrespondingInput(transiciones, inputName) {
  for (let k = 0; k < transiciones.length; k++) {
    if (transiciones[k].name === inputName) {
      return transiciones[k];
    }
  }
  return null;
}

/**
 * Permite generar un componente HTML que servirá para las transiciones. 
 * @param {String} nameInput El nombre e id que tendrá el objeto HTML
 * @param {String} placeholder El placeholder a mostrar.
 * @returns {HTMLDivElement} Retorna el objeto DIV con todos sus componentes.
 */
function generateInputTransitionHTML(nameInput, placeholder, value) {
  let div = document.createElement('div');
  div.classList.add('form-control', 'w-full', 'max-w-xs');

  let label = document.createElement('label');
  label.classList.add('label');
  label.innerHTML = '<span class="label-text">δ (' + nameInput + ') = </span>';

  let input = document.createElement('input');
  input.type = 'text';
  input.name = nameInput;
  input.id = nameInput;
  input.placeholder = 'ej. ' + placeholder;
  input.classList.add('input', 'input-bordered', 'w-full', 'max-w-xs', 'input-dinamico');
  
  if (value != null) {
    input.value = value;
  }

  div.appendChild(label);
  div.appendChild(input);
  return div;
}

/**
 * Permite crear y configurar el gráfico para mostrarlo en HTML.
 * @param {Array<String>} arrayNodos Un arreglo que contiene los nodos ingresados por el usuario.
 * @param {Array<Array<String>>} relaciones Un arreglo de arreglos, el contiene en cada índice un arreglo de 3 columnas con el formato: [nodo origen, nodo destino, alfabeto]
 * @param {String} nodo_inicial Un string que contiene el nodo inicial dado por el usuario. 
 * @param {Array<String>} arrayNodosFinales Un arreglo que contiene los nodos finales dados por el usuario.
 */
function crearGrafo(arrayNodos, relaciones, nodo_inicial, arrayNodosFinales) {
  console.log(arrayNodos)
  console.log(relaciones)
  console.log(nodo_inicial)
  console.log(arrayNodosFinales)
  if (diagrama) {
    diagrama.div = null;
    diagrama = null;
  }
  let nodosGrafo = [];
  let transiciones = [];

  // Se crean los nodos del grafo y se configura de acuerdo a sí es un nodo inicial, final, ambos o ninguno de las anteriores.
  for (let i = 0; i < arrayNodos.length; i++) {
    if (arrayNodos[i] == nodo_inicial && arrayNodosFinales.includes(arrayNodos[i])) {
      nodosGrafo.push({ key: arrayNodos[i], color: "#17a589" });
    } else if (arrayNodos[i] == nodo_inicial) {
      nodosGrafo.push({ key: arrayNodos[i], color: "#00dcdc" });
    } else if (arrayNodosFinales.includes(arrayNodos[i])) {
      nodosGrafo.push({ key: arrayNodos[i], color: "#03c700" });
    } else {
      nodosGrafo.push({ key: arrayNodos[i] });
    }
  }

  //En un arreglo se va almacenando las transiciones
  for (let i = 0; i < relaciones.length; i++) {
    transiciones.push({ from: relaciones[i][0], to: relaciones[i][1], text: relaciones[i][2] });
  }

  let $ = go.GraphObject.make;
  diagrama = $(go.Diagram, "grafo");

  diagrama.nodeTemplate =
    $(go.Node, "Auto",
      new go.Binding("location", "loc", go.Point.parse),
      $(go.Shape,
        {
          figure: "ellipse",
          fill: "white"
        },
        new go.Binding("fill", "color")),
      $(go.TextBlock, { margin: 5 },
        new go.Binding("text", "key"))
    );

  diagrama.linkTemplate =
    $(go.Link,
      $(go.Shape, { strokeWidth: 3, stroke: "black" }),
      $(go.Shape, { toArrow: "Standard", fill: "white" }),
      $(go.TextBlock, new go.Binding("text", "text"), { segmentOffset: new go.Point(0, -10) })
    );
  diagrama.model = new go.GraphLinksModel(nodosGrafo, transiciones);
}

/**
 * Permite realizar la evaluación de un string y realiza el 
 * seguimiento en los nodos del grafo con una animación.
 */
async function evaluateString() {
  let inputString = document.getElementById("cadena_prueba").value;
  if (inputString.length > 0) {
    try {
      let nodoActual = diagrama.findNodeForKey(nodoInicialAutomata);
      diagrama.select(nodoActual);

      async function evaluarCaracter(caracter) {
        return new Promise(resolve => {
          let valorTransicion = caracter;
          let enlacesSalientes = nodoActual.findLinksOutOf();

          enlacesSalientes.each(function (enlace) {
            let textoTransicion = enlace.data.text;
            if (textoTransicion === valorTransicion) {
              let nodoDestino = enlace.toNode;
              nodoActual = nodoDestino;
              diagrama.select(nodoActual);
              enlace.elt(0).stroke = 'green';
              setTimeout(() => {
                enlace.elt(0).stroke = 'black';
                resolve();
              }, 2000);
            }
          });
        });
      }

      for (let i = 0; i < inputString.length; i++) {
        await evaluarCaracter(inputString[i]);
      }

      nodoFinal = nodoActual.data.key;
      if (nodosFinalesAutomata.includes(nodoFinal)) {
        showNotification('alert-success', "static/images/icon-success.svg", "La cadena proporcionada forma parte del lenguaje del autómata.");
      } else {
        showNotification('alert-error', "/static/images/icon-error.svg", "La cadena proporcionada no forma parte del lenguaje del autómata.");
      }
    } catch (error) {
      showNotification('alert-error', "/static/images/icon-error.svg", "¡Oh no! Ha ocurrido un error al buscar el nodo inicial");
    }
  } else {
    showNotification('alert-error', "/static/images/icon-error.svg", "Por favor ingrese uno o más caracteres del alfabeto");
  }
}

/**
 * Permite convertir a mayúscula y evaluar cada caracter ingresado por el usuario
 * con el alfabeto del autómata con el objetivo de permitirle al usuario escribir 
 * solamente esos caracteres.
 * @param {HTMLInputElement} input El componente de entrada de texto a evaluar
 */
function checkAlphabet(input) {
  let value = input.value.toUpperCase();
  value = value.split('').filter(char => alfabetoAutomata.includes(char)).join('');
  input.value = value;
}

/**
 * Permite limpiar la caja de texto del input asociado al ID dado.
 * @param {String} inputID El ID del input a limpiar
 */
function cleanInput(inputID) {
  input = document.getElementById(inputID);
  input.value = "";
}

/**
 * Método que se ejecuta al cargar la página. Permite realizar algunas configuraciones
 * tales como la deshabilitación de botones. 
 */
window.addEventListener('load', function () {
  setStateComponent("btn_processing_data", true);
  setStateComponent("cadena_prueba", true);
  setStateComponent("btn_test_string", true);
  cleanInput("input_file_select");
  cleanInput("cadena_prueba");
  cleanInput("num_nodos");
  cleanInput("alfabeto");
  cleanInput("nodo_inicial");
  cleanInput("nodos_finales");
});

/**
 * Permite habilitar o deshabilitar un componente 
 * @param {String} idComponent El id del componente a modificar el estado
 * @param {Boolean} state El estado que deseas que tenga: True o False.
 */
function setStateComponent(idComponent, state) {
  let component = document.getElementById(idComponent);
  component.disabled = state;
}

/**
 * Permite eliminar un componente HTML
 * @param {String} idComponent El id del componente a eliminar.
 */
function removeComponent(idComponent) {
  const component = document.getElementById(idComponent);
  if (component) {
    component.remove();
  }
}

/**
 * Permite leer un archivo txt y guardar la información en variables.
 * @param {*} event El evento de la selección del archivo.
 */
function handleFileSelect(event) {
  let fileSelected = event.target.files[0];
  let reader = new FileReader();

  reader.onload = function () {
    let contenido = reader.result;
    let linesFile = contenido.replace(/\r/g, '').split('\n');
    let data = {};
    // se recorre línea por línea del documento txt
    linesFile.forEach(linea => {
      if (linea.trim().startsWith('//') || linea.trim() === '') {
        return;
      }
      let matches = linea.match(/([^=]+)\s*=\s*(.*)/);
      if (matches) {
        let nombre = matches[1].trim();
        let contenido = matches[2].trim();
        data[nombre] = contenido;
      } else {
        transicionesAutomata.push(linea.trim());
      }
    });
    
    proveniencia_datos = "archivo";
    addValueComponent("num_nodos", data["Nodos(Q)"]);
    addValueComponent("alfabeto", data["Alfabeto(Σ)"]);
    addValueComponent("nodo_inicial", data["Nodo inicio(q0)"]);
    addValueComponent("nodos_finales", data["Nodo(s) final(es)"]);
  }
  reader.readAsText(fileSelected);
}

/**
 * Permite añadir valor a un input. Este método es usado 
 * para cuando el usuario ingresa datos desde un archivo.
 * @param {*} idComponent El id del componente
 * @param {*} value El valor a establecer en el componente.
 */
function addValueComponent(idComponent, value) {
  component = document.getElementById(idComponent);
  component.value = value;
}

/**
 * Permite descargar un archivo txt
 */
function descargarArchivo(){
  var fileUrl = "/static/documents/ejemplo_1.txt";
  var fileName = 'ejemplo_1.txt';
  var downloadLink = document.createElement('a');
  downloadLink.href = fileUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
let num;
let submit;
let tableInput;
let calculate;
let resultMatrix;

let rows;
let cols;

function setup() {
    num = select('#num');

    submit = select('#submit');
    submit.mousePressed(numChanged);

    tableInput = select('#tableInput');

    const canvas = select('#defaultCanvas0');
    if(canvas) canvas.remove(); // here too?

    calculate = select('#calculate');
    calculate.mousePressed(calcMatrix);

    MathJax.Hub.queue.Push(() => {
		resultMatrix = MathJax.Hub.getAllJax('resultMatrix')[0];
	});
}

function numChanged() {
    rows = Number(num.value());
    cols = rows;
    
    const tableInputElem = document.getElementById('tableInput');
    while (tableInputElem.firstChild) tableInputElem.removeChild(tableInputElem.firstChild);

    const canvas = select('#defaultCanvas0');
    if(canvas) canvas.remove(); // strange!

    for(let i = 0; i < rows; i++) {
        const tableRow = createElement('tr');
        tableRow.parent(tableInput);
        for(let j = 0; j < cols; j++) {
            const elem = createElement('td');
            elem.parent(tableRow);

            const elemInput = createInput();
            elemInput.parent(elem);
            elemInput.id(toId(i, j));
        }
    }
}

let matrix;
let originalMatrix;
function calcMatrix() {
    // Get matrix
    matrix = [];
    originalMatrix = [];
    for(let i = 0; i < rows; i++) {
        matrix[i] = [];
        originalMatrix[i] = [];
        for(let j = 0; j < cols; j++) {
            const elem = select('#' + toId(i, j));
            matrix[i][j] = new Frac(Number(elem.value()));
            originalMatrix[i][j] = matrix[i][j].copy();
        }
    }

    let det;
    let neg = false;
    for(let shift = 0; shift < rows - 1; shift++) {
        // Swap so first row is not zero
        let si = shift;
        while(matrix[si][shift].q === 0 && si < rows - 1) si++;
        if(matrix[si][shift] === 0) {
            det = new Frac(0);
            break;
        } 
        else {
            const t = matrix[si];
            matrix[si] = matrix[shift];
            matrix[shift] = matrix[si];
            neg = !neg;
        }

        // Perform row operation so first column has zeros
        for(let i = shift + 1; i < rows; i++) {
            const ratio = Frac.div(matrix[i][shift], matrix[shift][shift]);
            for(let j = shift; j < cols; j++) 
                matrix[i][j].sub(Frac.mult(ratio, matrix[shift][j]));
        }

        // Calculate determinant
        det = new Frac(1);
        for(let i = 0; i < rows; i++) det.mult(matrix[i][i]);
        if(neg) det.q = -det.q;
    }

    MathJax.Hub.queue.Push(["Text", resultMatrix, toLatex(originalMatrix) + "=" + det.toLatex()]);	
}

function toId(i, j) {
    return i.toString() + ' ' + j.toString();
}

function toLatex(m) {
    let latex = '\\left|\\begin{array}{';
    for(let i = 0; i < rows; i++) latex += 'c';
    latex += '}';

    for(let i = 0; i < rows; i++) {
        for(let j = 0; j < cols; j++) {
            latex += m[i][j].toLatex();

            if(j !== cols - 1) latex += '&';
        }
        if(i !== rows - 1) latex += '\\\\';
    }

    latex += '\\end{array}\\right|';

    return latex;
}